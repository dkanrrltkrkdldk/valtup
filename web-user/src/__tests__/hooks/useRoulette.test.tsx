import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouletteStatus, useSpinRoulette } from '@/hooks/useRoulette';
import { ReactNode } from 'react';
import { mockRouletteStatus, mockSpinResultWin } from '../mocks/data';

jest.mock('@/lib/api', () => ({
  rouletteApi: {
    getStatus: jest.fn().mockResolvedValue({
      hasParticipatedToday: false,
      remainingBudget: 50000,
      canParticipate: true,
    }),
    spin: jest.fn().mockResolvedValue({
      pointAmount: 500,
      isWin: true,
      message: '축하합니다!',
    }),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useRouletteStatus', () => {
  it('fetches roulette status', async () => {
    const { result } = renderHook(() => useRouletteStatus(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({
      hasParticipatedToday: false,
      remainingBudget: 50000,
      canParticipate: true,
    });
  });
});

describe('useSpinRoulette', () => {
  it('provides mutation for spinning roulette', async () => {
    const { result } = renderHook(() => useSpinRoulette(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
  });
});
