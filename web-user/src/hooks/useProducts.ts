'use client';

import { useQuery } from '@tanstack/react-query';
import { productApi } from '@/lib/api';

export function useProducts(page = 0, size = 10) {
  return useQuery({
    queryKey: ['products', 'list', page, size],
    queryFn: () => productApi.getProducts(page, size),
    staleTime: 60 * 1000,
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: ['products', 'detail', id],
    queryFn: () => productApi.getProduct(id),
    enabled: id > 0,
    staleTime: 60 * 1000,
  });
}
