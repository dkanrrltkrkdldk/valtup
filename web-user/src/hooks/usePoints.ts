'use client';

import { useQuery } from '@tanstack/react-query';
import { pointApi } from '@/lib/api';

export function usePoints(page = 0, size = 10) {
  return useQuery({
    queryKey: ['points', 'list', page, size],
    queryFn: () => pointApi.getPoints(page, size),
    staleTime: 60 * 1000,
  });
}

export function usePointBalance() {
  return useQuery({
    queryKey: ['points', 'balance'],
    queryFn: pointApi.getBalance,
    staleTime: 30 * 1000,
  });
}

export function useExpiringPoints() {
  return useQuery({
    queryKey: ['points', 'expiring'],
    queryFn: pointApi.getExpiring,
    staleTime: 60 * 1000,
  });
}
