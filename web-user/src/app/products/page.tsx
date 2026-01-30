'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingScreen } from '@/components/ui/Spinner';
import { PurchaseModal } from '@/components/products';
import { useProducts } from '@/hooks/useProducts';
import { usePointBalance } from '@/hooks/usePoints';
import { useCreateOrder } from '@/hooks/useOrders';
import type { Product } from '@/types/api';

export default function ProductsPage() {
  const [page, setPage] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: productsData, isLoading, refetch } = useProducts(page);
  const { data: balance, refetch: refetchBalance } = usePointBalance();
  const createOrder = useCreateOrder();

  const handlePurchase = async (productId: number, quantity: number) => {
    await createOrder.mutateAsync({ productId, quantity });
    refetch();
    refetchBalance();
  };

  if (isLoading) {
    return (
      <AppLayout>
        <LoadingScreen />
      </AppLayout>
    );
  }

  const products = productsData?.content ?? [];
  const totalPages = productsData?.totalPages ?? 0;
  const userBalance = balance?.totalBalance ?? 0;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">상품</h1>
          <div className="text-sm">
            <span className="text-gray-500">보유 포인트</span>
            <span className="ml-2 font-semibold text-indigo-600">
              {userBalance.toLocaleString()}P
            </span>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            등록된 상품이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((product) => {
              const isOutOfStock = product.stock === 0;
              const canAfford = userBalance >= product.price;

              return (
                <Card key={product.id} className="overflow-hidden">
                  <div className="aspect-square bg-gray-100 flex items-center justify-center text-5xl relative">
                    🎁
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="danger" className="text-sm">품절</Badge>
                      </div>
                    )}
                  </div>
                  <CardBody>
                    <h3 className="font-medium text-gray-900 truncate">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate mt-1">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-bold text-indigo-600">
                        {product.price.toLocaleString()}P
                      </span>
                      <span className="text-xs text-gray-400">
                        재고 {product.stock}
                      </span>
                    </div>
                    <Button
                      onClick={() => setSelectedProduct(product)}
                      disabled={isOutOfStock}
                      variant={canAfford ? 'primary' : 'secondary'}
                      size="sm"
                      className="w-full mt-3"
                    >
                      {isOutOfStock
                        ? '품절'
                        : canAfford
                        ? '구매하기'
                        : '포인트 부족'}
                    </Button>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

        <PurchaseModal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          product={selectedProduct}
          userBalance={userBalance}
          onPurchase={handlePurchase}
          isPurchasing={createOrder.isPending}
        />
      </div>
    </AppLayout>
  );
}
