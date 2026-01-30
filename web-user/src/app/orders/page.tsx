'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingScreen } from '@/components/ui/Spinner';
import { useOrders } from '@/hooks/useOrders';

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrdersPage() {
  const [page, setPage] = useState(0);
  const { data: ordersData, isLoading } = useOrders(page);

  if (isLoading) {
    return (
      <AppLayout>
        <LoadingScreen />
      </AppLayout>
    );
  }

  const orders = ordersData?.content ?? [];
  const totalPages = ordersData?.totalPages ?? 0;

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">주문 내역</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            주문 내역이 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardBody>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">
                          {order.productName}
                        </h3>
                        <Badge
                          variant={
                            order.status === 'COMPLETED' ? 'success' : 'danger'
                          }
                        >
                          {order.status === 'COMPLETED' ? '완료' : '취소됨'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        수량: {order.quantity}개
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-indigo-600">
                        {order.totalPrice.toLocaleString()}P
                      </p>
                    </div>
                  </div>
                  {order.cancelledAt && (
                    <p className="text-xs text-red-500 mt-2">
                      취소일: {formatDate(order.cancelledAt)}
                    </p>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </AppLayout>
  );
}
