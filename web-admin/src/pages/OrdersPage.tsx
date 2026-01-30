import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Modal,
  Badge,
  Spinner,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui';
import { adminApi } from '@/lib/api';
import type { AdminOrderResponse } from '@/types/api';

type StatusFilter = 'ALL' | 'COMPLETED' | 'CANCELLED';

export function OrdersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [cancellingOrder, setCancellingOrder] = useState<AdminOrderResponse | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['orders', page],
    queryFn: () => adminApi.getOrders(page, 10),
  });

  const filteredContent = useMemo(() => {
    if (!data?.content) return [];
    if (statusFilter === 'ALL') return data.content;
    return data.content.filter(order => order.status === statusFilter);
  }, [data?.content, statusFilter]);

  const cancelMutation = useMutation({
    mutationFn: adminApi.cancelOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setCancellingOrder(null);
      showSuccess('주문이 취소되었습니다');
    },
    onError: (err: Error) => {
      setErrorMessage(err.message || '주문 취소 중 오류가 발생했습니다');
    },
  });

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    setPage(0);
  }, [statusFilter]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setErrorMessage('');
  };

  const handleCancel = () => {
    if (cancellingOrder) {
      cancelMutation.mutate(cancellingOrder.id);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as StatusFilter);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR') + ' ' + date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">데이터를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">주문 내역</h1>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">전체 주문</h2>
            <select
              value={statusFilter}
              onChange={handleFilterChange}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">전체</option>
              <option value="COMPLETED">완료</option>
              <option value="CANCELLED">취소됨</option>
            </select>
          </div>
        </CardHeader>
        <CardBody>
          {filteredContent.length === 0 ? (
            <p className="text-center text-gray-500 py-8">주문 내역이 없습니다.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>주문번호</TableHead>
                  <TableHead>사용자</TableHead>
                  <TableHead>상품</TableHead>
                  <TableHead>수량</TableHead>
                  <TableHead>금액</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>주문일</TableHead>
                  <TableHead>액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContent.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>#{order.id}</TableCell>
                    <TableCell>{order.userNickname}</TableCell>
                    <TableCell>{order.productName}</TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>{order.totalPrice.toLocaleString()}P</TableCell>
                    <TableCell>
                      {order.status === 'COMPLETED' ? (
                        <Badge variant="success">완료</Badge>
                      ) : (
                        <Badge variant="danger">취소됨</Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                    <TableCell>
                      {order.status === 'COMPLETED' && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setCancellingOrder(order)}
                        >
                          취소
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {data && data.totalPages > 0 && (
            <div className="flex justify-center items-center gap-4 mt-4 pt-4 border-t">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={data.first}
              >
                이전
              </Button>
              <span className="text-sm text-gray-600">
                {data.page + 1} / {data.totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={data.last}
              >
                다음
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      <Modal
        isOpen={!!cancellingOrder}
        onClose={() => {
          setCancellingOrder(null);
          setErrorMessage('');
        }}
        title="주문 취소"
      >
        <p className="text-gray-600 mb-6">
          주문 #{cancellingOrder?.id}을(를) 취소하시겠습니까?
        </p>
        {errorMessage && (
          <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
        )}
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setCancellingOrder(null);
              setErrorMessage('');
            }}
          >
            닫기
          </Button>
          <Button
            variant="danger"
            onClick={handleCancel}
            isLoading={cancelMutation.isPending}
          >
            취소하기
          </Button>
        </div>
      </Modal>
    </div>
  );
}
