import { authApi, rouletteApi, pointApi, productApi, orderApi, ApiError } from '@/lib/api';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('API Client', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('authApi', () => {
    it('login makes POST request with nickname', async () => {
      const mockUser = { id: 1, nickname: 'test', role: 'USER' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUser),
      });

      const result = await authApi.login({ nickname: 'test' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/login'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ nickname: 'test' }),
        })
      );
      expect(result).toEqual(mockUser);
    });

    it('me makes GET request', async () => {
      const mockUser = { id: 1, nickname: 'test', role: 'USER' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUser),
      });

      const result = await authApi.me();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/me'),
        expect.any(Object)
      );
      expect(result).toEqual(mockUser);
    });

    it('logout makes POST request', async () => {
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
        })
      );
    });
  });

  describe('rouletteApi', () => {
    it('getStatus makes GET request', async () => {
      const mockStatus = { hasParticipatedToday: false, remainingBudget: 50000, canParticipate: true };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStatus),
      });

      const result = await rouletteApi.getStatus();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/roulette/status'),
        expect.any(Object)
      );
      expect(result).toEqual(mockStatus);
    });

    it('spin makes POST request', async () => {
      const mockResult = { pointAmount: 500, isWin: true, message: '축하합니다!' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResult),
      });

      const result = await rouletteApi.spin();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/roulette/spin'),
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('pointApi', () => {
    it('getPoints makes GET request with pagination', async () => {
      const mockPoints = { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPoints),
      });

      const result = await pointApi.getPoints(1, 20);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/points?page=1&size=20'),
        expect.any(Object)
      );
      expect(result).toEqual(mockPoints);
    });

    it('getBalance makes GET request', async () => {
      const mockBalance = { totalBalance: 700, expiringIn7Days: 100 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBalance),
      });

      const result = await pointApi.getBalance();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/points/balance'),
        expect.any(Object)
      );
      expect(result).toEqual(mockBalance);
    });
  });

  describe('productApi', () => {
    it('getProducts makes GET request', async () => {
      const mockProducts = { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProducts),
      });

      await productApi.getProducts();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/products'),
        expect.any(Object)
      );
    });

    it('getProduct makes GET request with id', async () => {
      const mockProduct = { id: 1, name: 'Test', price: 1000 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProduct),
      });

      const result = await productApi.getProduct(1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/products/1'),
        expect.any(Object)
      );
      expect(result).toEqual(mockProduct);
    });
  });

  describe('orderApi', () => {
    it('createOrder makes POST request', async () => {
      const mockOrder = { id: 1, productId: 1, quantity: 1, totalPrice: 1000 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockOrder),
      });

      const result = await orderApi.createOrder({ productId: 1, quantity: 1 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/orders'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ productId: 1, quantity: 1 }),
        })
      );
      expect(result).toEqual(mockOrder);
    });

    it('getOrders makes GET request', async () => {
      const mockOrders = { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockOrders),
      });

      await orderApi.getOrders();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/orders'),
        expect.any(Object)
      );
    });
  });

  describe('Error Handling', () => {
    it('throws ApiError on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          code: 'E001',
          message: 'Bad Request',
          timestamp: '2025-01-30T10:00:00',
        }),
      });

      await expect(authApi.me()).rejects.toThrow(ApiError);
    });

    it('handles JSON parse error gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      await expect(authApi.me()).rejects.toThrow(ApiError);
    });
  });
});
