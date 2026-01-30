import type {
  User,
  LoginRequest,
  BudgetResponse,
  DashboardResponse,
  AdminProductResponse,
  AdminOrderResponse,
  RouletteParticipationResponse,
  CreateProductRequest,
  UpdateProductRequest,
  UpdateBudgetRequest,
  PageResponse,
  ErrorResponse,
} from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

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

export const adminApi = {
  getBudget: () => fetchApi<BudgetResponse>('/api/admin/budget'),

  updateBudget: (data: UpdateBudgetRequest) =>
    fetchApi<BudgetResponse>('/api/admin/budget', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getDashboard: () => fetchApi<DashboardResponse>('/api/admin/dashboard'),

  getProducts: (page = 0, size = 10) =>
    fetchApi<PageResponse<AdminProductResponse>>(
      `/api/admin/products?page=${page}&size=${size}`
    ),

  createProduct: (data: CreateProductRequest) =>
    fetchApi<AdminProductResponse>('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateProduct: (id: number, data: UpdateProductRequest) =>
    fetchApi<AdminProductResponse>(`/api/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteProduct: (id: number) =>
    fetchApi<void>(`/api/admin/products/${id}`, {
      method: 'DELETE',
    }),

  getOrders: (page = 0, size = 10) =>
    fetchApi<PageResponse<AdminOrderResponse>>(
      `/api/admin/orders?page=${page}&size=${size}`
    ),

  cancelOrder: (id: number) =>
    fetchApi<AdminOrderResponse>(`/api/admin/orders/${id}/cancel`, {
      method: 'POST',
    }),

  getRouletteParticipations: (page = 0, size = 10) =>
    fetchApi<PageResponse<RouletteParticipationResponse>>(
      `/api/admin/roulette/participations?page=${page}&size=${size}`
    ),

  cancelRouletteParticipation: (id: number) =>
    fetchApi<void>(`/api/admin/roulette/${id}/cancel`, {
      method: 'POST',
    }),
};
