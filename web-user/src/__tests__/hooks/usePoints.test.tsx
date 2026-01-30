import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePoints, usePointBalance, useExpiringPoints } from '@/hooks/usePoints';
import { ReactNode } from 'react';

jest.mock('@/lib/api', () => ({
  pointApi: {
    getPoints: jest.fn().mockResolvedValue({
      content: [{ id: 1, amount: 500, usedAmount: 100, availableAmount: 400, earnedAt: '2025-01-30', expiresAt: '2025-03-01', expired: false }],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
    }),
    getBalance: jest.fn().mockResolvedValue({ totalBalance: 700, expiringIn7Days: 300 }),
    getExpiring: jest.fn().mockResolvedValue({ points: [], totalAmount: 300 }),
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

describe('usePoints', () => {
  it('fetches points with pagination', async () => {
    const { result } = renderHook(() => usePoints(0, 10), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.content).toBeDefined();
  });
});

describe('usePointBalance', () => {
  it('fetches point balance', async () => {
    const { result } = renderHook(() => usePointBalance(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ totalBalance: 700, expiringIn7Days: 300 });
  });
});

describe('useExpiringPoints', () => {
  it('fetches expiring points', async () => {
    const { result } = renderHook(() => useExpiringPoints(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.totalAmount).toBe(300);
  });
});
