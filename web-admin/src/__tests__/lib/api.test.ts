import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authApi, adminApi, ApiError } from '@/lib/api';
import {
  mockAdminUser,
  mockBudgetConfig,
  mockDashboardStats,
  mockProducts,
  mockOrders,
  createPageResponse,
} from '@/__tests__/mocks';

// Mock fetch globally
const mockFetch = vi.fn();
(globalThis as { fetch: typeof fetch }).fetch = mockFetch;

describe('ApiError', () => {
  it('creates error with correct properties', () => {
    const error = new ApiError('E001', 'Test error', 400);
    expect(error.code).toBe('E001');
    expect(error.message).toBe('Test error');
    expect(error.status).toBe(400);
    expect(error.name).toBe('ApiError');
  });
});

describe('fetchApi', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('authApi', () => {
    describe('login', () => {
      it('sends login request with nickname', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockAdminUser),
        });

        const result = await authApi.login({ nickname: 'admin_test' });

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/auth/login'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ nickname: 'admin_test' }),
            credentials: 'include',
          })
        );
        expect(result).toEqual(mockAdminUser);
      });

      it('throws ApiError on failure', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: () =>
            Promise.resolve({
              code: 'E001',
              message: 'Invalid credentials',
              timestamp: '2024-01-01T00:00:00Z',
            }),
        });

        await expect(authApi.login({ nickname: 'invalid' })).rejects.toThrow(
          ApiError
        );
      });
    });

    describe('me', () => {
      it('fetches current user', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockAdminUser),
        });

        const result = await authApi.me();

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/auth/me'),
          expect.objectContaining({ credentials: 'include' })
        );
        expect(result).toEqual(mockAdminUser);
      });
    });

    describe('logout', () => {
      it('sends logout request', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 204,
          json: () => Promise.resolve({}),
        });

        await authApi.logout();

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/auth/logout'),
          expect.objectContaining({
            method: 'POST',
            credentials: 'include',
          })
        );
      });

      it('handles 204 response correctly', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 204,
        });

        const result = await authApi.logout();
        expect(result).toEqual({});
      });
    });
  });

  describe('adminApi', () => {
    describe('getBudget', () => {
      it('fetches budget data', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockBudgetConfig),
        });

        const result = await adminApi.getBudget();

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/admin/budget'),
          expect.objectContaining({ credentials: 'include' })
        );
        expect(result).toEqual(mockBudgetConfig);
      });
    });

    describe('updateBudget', () => {
      it('updates budget with new value', async () => {
        const updatedBudget = { ...mockBudgetConfig, totalBudget: 150000 };
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(updatedBudget),
        });

        const result = await adminApi.updateBudget({ totalBudget: 150000 });

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/admin/budget'),
          expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify({ totalBudget: 150000 }),
          })
        );
        expect(result).toEqual(updatedBudget);
      });
    });

    describe('getDashboard', () => {
      it('fetches dashboard stats', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockDashboardStats),
        });

        const result = await adminApi.getDashboard();

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/admin/dashboard'),
          expect.objectContaining({ credentials: 'include' })
        );
        expect(result).toEqual(mockDashboardStats);
      });
    });

    describe('getProducts', () => {
      it('fetches products with default pagination', async () => {
        const pageResponse = createPageResponse(mockProducts);
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(pageResponse),
        });

        const result = await adminApi.getProducts();

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/admin/products?page=0&size=10'),
          expect.any(Object)
        );
        expect(result).toEqual(pageResponse);
      });

      it('fetches products with custom pagination', async () => {
        const pageResponse = createPageResponse(mockProducts, 1, 20);
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(pageResponse),
        });

        await adminApi.getProducts(1, 20);

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/admin/products?page=1&size=20'),
          expect.any(Object)
        );
      });
    });

    describe('createProduct', () => {
      it('creates new product', async () => {
        const newProduct = mockProducts[0];
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(newProduct),
        });

        const productData = {
          name: '기프티콘 5000원',
          description: '편의점 5000원 상품권',
          price: 5000,
          stock: 100,
        };

        const result = await adminApi.createProduct(productData);

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/admin/products'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(productData),
          })
        );
        expect(result).toEqual(newProduct);
      });
    });

    describe('updateProduct', () => {
      it('updates existing product', async () => {
        const updatedProduct = { ...mockProducts[0], name: 'Updated Name' };
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(updatedProduct),
        });

        const updateData = {
          name: 'Updated Name',
          price: 5000,
          stock: 100,
        };

        const result = await adminApi.updateProduct(1, updateData);

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/admin/products/1'),
          expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify(updateData),
          })
        );
        expect(result).toEqual(updatedProduct);
      });
    });

    describe('deleteProduct', () => {
      it('deletes product', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 204,
        });

        await adminApi.deleteProduct(1);

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/admin/products/1'),
          expect.objectContaining({ method: 'DELETE' })
        );
      });
    });

    describe('getOrders', () => {
      it('fetches orders with default pagination', async () => {
        const pageResponse = createPageResponse(mockOrders);
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(pageResponse),
        });

        const result = await adminApi.getOrders();

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/admin/orders?page=0&size=10'),
          expect.any(Object)
        );
        expect(result).toEqual(pageResponse);
      });

      it('fetches orders with custom pagination', async () => {
        const pageResponse = createPageResponse(mockOrders, 2, 5);
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(pageResponse),
        });

        await adminApi.getOrders(2, 5);

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/admin/orders?page=2&size=5'),
          expect.any(Object)
        );
      });
    });

    describe('cancelOrder', () => {
      it('cancels order', async () => {
        const cancelledOrder = { ...mockOrders[0], status: 'CANCELLED' as const };
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(cancelledOrder),
        });

        const result = await adminApi.cancelOrder(1);

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/admin/orders/1/cancel'),
          expect.objectContaining({ method: 'POST' })
        );
        expect(result).toEqual(cancelledOrder);
      });
    });

    describe('getRouletteParticipations', () => {
      it('fetches roulette participations', async () => {
        const pageResponse = createPageResponse([]);
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(pageResponse),
        });

        await adminApi.getRouletteParticipations();

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/admin/roulette/participations?page=0&size=10'),
          expect.any(Object)
        );
      });
    });

    describe('cancelRouletteParticipation', () => {
      it('cancels roulette participation', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 204,
        });

        await adminApi.cancelRouletteParticipation(1);

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/admin/roulette/1/cancel'),
          expect.objectContaining({ method: 'POST' })
        );
      });
    });
  });

  describe('error handling', () => {
    it('throws ApiError with parsed error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () =>
          Promise.resolve({
            code: 'E100',
            message: 'Bad request',
            timestamp: '2024-01-01T00:00:00Z',
          }),
      });

      try {
        await authApi.me();
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).code).toBe('E100');
        expect((error as ApiError).message).toBe('Bad request');
        expect((error as ApiError).status).toBe(400);
      }
    });

    it('handles non-JSON error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Not JSON')),
      });

      try {
        await authApi.me();
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).code).toBe('E999');
        expect((error as ApiError).message).toBe('Unknown error');
        expect((error as ApiError).status).toBe(500);
      }
    });
  });
});
