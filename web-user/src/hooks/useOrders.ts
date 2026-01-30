'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '@/lib/api';
import type { CreateOrderRequest } from '@/types/api';

export function useOrders(page = 0, size = 10) {
  return useQuery({
    queryKey: ['orders', 'list', page, size],
    queryFn: () => orderApi.getOrders(page, size),
    staleTime: 30 * 1000,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderRequest) => orderApi.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['points'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
