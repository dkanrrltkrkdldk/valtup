import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useOrders, useCreateOrder } from '@/hooks/useOrders';
import { ReactNode } from 'react';

jest.mock('@/lib/api', () => ({
  orderApi: {
    getOrders: jest.fn().mockResolvedValue({
      content: [
        { id: 1, productId: 1, productName: '테스트 상품', quantity: 2, totalPrice: 2000, status: 'COMPLETED', createdAt: '2025-01-30', cancelledAt: null },
      ],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
    }),
    createOrder: jest.fn().mockResolvedValue({
      id: 1, productId: 1, productName: '테스트 상품', quantity: 1, totalPrice: 1000, status: 'COMPLETED', createdAt: '2025-01-30', cancelledAt: null,
    }),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useOrders', () => {
  it('fetches orders list', async () => {
    const { result } = renderHook(() => useOrders(0, 10), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.content.length).toBeGreaterThan(0);
  });
});

describe('useCreateOrder', () => {
  it('provides mutation for creating orders', () => {
    const { result } = renderHook(() => useCreateOrder(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
  });
});
