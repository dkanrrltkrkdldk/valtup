import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProducts, useProduct } from '@/hooks/useProducts';
import { ReactNode } from 'react';

jest.mock('@/lib/api', () => ({
  productApi: {
    getProducts: jest.fn().mockResolvedValue({
      content: [
        { id: 1, name: '테스트 상품', description: '설명', price: 1000, stock: 10, imageUrl: null },
        { id: 2, name: '품절 상품', description: '품절', price: 500, stock: 0, imageUrl: null },
      ],
      page: 0,
      size: 10,
      totalElements: 2,
      totalPages: 1,
      first: true,
      last: true,
    }),
    getProduct: jest.fn().mockImplementation((id: number) => 
      Promise.resolve({ id, name: '테스트 상품', description: '설명', price: 1000, stock: 10, imageUrl: null })
    ),
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

describe('useProducts', () => {
  it('fetches products list', async () => {
    const { result } = renderHook(() => useProducts(0, 10), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.content.length).toBe(2);
  });
});

describe('useProduct', () => {
  it('fetches single product by id', async () => {
    const { result } = renderHook(() => useProduct(1), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe(1);
  });

  it('does not fetch when id is 0', () => {
    const { result } = renderHook(() => useProduct(0), { wrapper: createWrapper() });
    expect(result.current.isFetching).toBe(false);
  });
});
