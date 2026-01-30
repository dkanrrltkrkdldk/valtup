import { http, HttpResponse } from 'msw';
import {
  mockUser,
  mockPointBalance,
  mockExpiringPoints,
  mockRouletteStatus,
  mockSpinResultWin,
  mockProduct,
  mockProductOutOfStock,
  mockOrder,
  mockPoint,
  createPageResponse,
} from './data';

const API_URL = 'http://localhost:8080';

export const handlers = [
  http.post(`${API_URL}/api/auth/login`, () => {
    return HttpResponse.json(mockUser);
  }),

  http.get(`${API_URL}/api/auth/me`, () => {
    return HttpResponse.json(mockUser);
  }),

  http.post(`${API_URL}/api/auth/logout`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${API_URL}/api/roulette/status`, () => {
    return HttpResponse.json(mockRouletteStatus);
  }),

  http.post(`${API_URL}/api/roulette/spin`, () => {
    return HttpResponse.json(mockSpinResultWin);
  }),

  http.get(`${API_URL}/api/points`, () => {
    return HttpResponse.json(createPageResponse([mockPoint]));
  }),

  http.get(`${API_URL}/api/points/balance`, () => {
    return HttpResponse.json(mockPointBalance);
  }),

  http.get(`${API_URL}/api/points/expiring`, () => {
    return HttpResponse.json(mockExpiringPoints);
  }),

  http.get(`${API_URL}/api/products`, () => {
    return HttpResponse.json(
      createPageResponse([mockProduct, mockProductOutOfStock])
    );
  }),

  http.get(`${API_URL}/api/products/:id`, ({ params }) => {
    const id = Number(params.id);
    if (id === 1) return HttpResponse.json(mockProduct);
    if (id === 2) return HttpResponse.json(mockProductOutOfStock);
    return new HttpResponse(null, { status: 404 });
  }),

  http.post(`${API_URL}/api/orders`, () => {
    return HttpResponse.json(mockOrder);
  }),

  http.get(`${API_URL}/api/orders`, () => {
    return HttpResponse.json(createPageResponse([mockOrder]));
  }),
];

export const errorHandlers = {
  unauthorized: http.get(`${API_URL}/api/auth/me`, () => {
    return HttpResponse.json(
      { code: 'E010', message: 'Unauthorized', timestamp: new Date().toISOString() },
      { status: 401 }
    );
  }),

  insufficientPoints: http.post(`${API_URL}/api/orders`, () => {
    return HttpResponse.json(
      { code: 'E005', message: 'Insufficient points', timestamp: new Date().toISOString() },
      { status: 400 }
    );
  }),

  outOfStock: http.post(`${API_URL}/api/orders`, () => {
    return HttpResponse.json(
      { code: 'E007', message: 'Out of stock', timestamp: new Date().toISOString() },
      { status: 400 }
    );
  }),
};
