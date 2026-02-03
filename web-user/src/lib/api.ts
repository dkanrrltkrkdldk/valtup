import type {
  User,
  LoginRequest,
  Point,
  PointBalance,
  ExpiringPoints,
  RouletteStatus,
  SpinResult,
  Product,
  Order,
  CreateOrderRequest,
  PageResponse,
  ErrorResponse,
} from '@/types/api';

const USE_PROXY = typeof window !== 'undefined';
const DIRECT_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

function getApiBaseUrl(): string {
  if (USE_PROXY) {
    return '/api/proxy';
  }
  return DIRECT_API_URL;
}

class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const apiPath = endpoint.replace(/^\/api/, '');
  const url = `${getApiBaseUrl()}${apiPath}`;

  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({
      code: 'E999',
      message: 'Unknown error',
      timestamp: new Date().toISOString(),
    }));
    throw new ApiError(errorData.code, errorData.message, response.status);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const authApi = {
  login: (data: LoginRequest) =>
    fetchApi<User>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () => fetchApi<User>('/api/auth/me'),

  logout: () =>
    fetchApi<void>('/api/auth/logout', {
      method: 'POST',
    }),
};

export const rouletteApi = {
  getStatus: () => fetchApi<RouletteStatus>('/api/roulette/status'),

  spin: () =>
    fetchApi<SpinResult>('/api/roulette/spin', {
      method: 'POST',
    }),
};

export const pointApi = {
  getPoints: (page = 0, size = 10) =>
    fetchApi<PageResponse<Point>>(`/api/points?page=${page}&size=${size}`),

  getBalance: () => fetchApi<PointBalance>('/api/points/balance'),

  getExpiring: () => fetchApi<ExpiringPoints>('/api/points/expiring'),
};

export const productApi = {
  getProducts: (page = 0, size = 10) =>
    fetchApi<PageResponse<Product>>(`/api/products?page=${page}&size=${size}`),

  getProduct: (id: number) => fetchApi<Product>(`/api/products/${id}`),
};

export const orderApi = {
  createOrder: (data: CreateOrderRequest) =>
    fetchApi<Order>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getOrders: (page = 0, size = 10) =>
    fetchApi<PageResponse<Order>>(`/api/orders?page=${page}&size=${size}`),
};

export { ApiError };
