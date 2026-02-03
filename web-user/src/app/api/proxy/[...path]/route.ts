import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://valtup-production.up.railway.app';

function buildTargetUrl(request: NextRequest, path: string[]): URL {
  const targetPath = `/api/${path.join('/')}`;
  const targetUrl = new URL(targetPath, BACKEND_URL);
  
  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });
  
  return targetUrl;
}

function buildRequestHeaders(request: NextRequest): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    headers['Cookie'] = cookieHeader;
  }
  
  return headers;
}

async function getRequestBody(request: NextRequest): Promise<string | undefined> {
  if (!['POST', 'PUT', 'PATCH'].includes(request.method)) {
    return undefined;
  }
  
  try {
    const body = await request.text();
    return body || undefined;
  } catch {
    return undefined;
  }
}

function transformSetCookieForProxy(cookie: string): string {
  return cookie
    .replace(/Domain=[^;]+;?\s*/gi, '')
    .replace(/Path=[^;]+/gi, 'Path=/');
}

async function proxyRequest(request: NextRequest, path: string[]) {
  const targetUrl = buildTargetUrl(request, path);
  const headers = buildRequestHeaders(request);
  const body = await getRequestBody(request);

  const fetchOptions: RequestInit = {
    method: request.method,
    headers,
    body,
  };

  try {
    const response = await fetch(targetUrl.toString(), fetchOptions);
    const responseText = await response.text();
    
    const proxyResponse = new NextResponse(responseText, {
      status: response.status,
      statusText: response.statusText,
    });

    proxyResponse.headers.set(
      'Content-Type', 
      response.headers.get('Content-Type') || 'application/json'
    );
    
    response.headers.getSetCookie().forEach((cookie) => {
      proxyResponse.headers.append('Set-Cookie', transformSetCookieForProxy(cookie));
    });

    return proxyResponse;
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { code: 'E999', message: 'Proxy error', timestamp: new Date().toISOString() },
      { status: 502 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}
