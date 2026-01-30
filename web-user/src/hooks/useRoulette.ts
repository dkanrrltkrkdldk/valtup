'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rouletteApi } from '@/lib/api';

export function useRouletteStatus() {
  return useQuery({
    queryKey: ['roulette', 'status'],
    queryFn: rouletteApi.getStatus,
    staleTime: 30 * 1000,
  });
}

export function useSpinRoulette() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rouletteApi.spin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roulette', 'status'] });
      queryClient.invalidateQueries({ queryKey: ['points'] });
    },
  });
}
