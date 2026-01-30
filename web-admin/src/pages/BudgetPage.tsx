import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardBody, Input, Button, Spinner } from '@/components/ui';
import { adminApi } from '@/lib/api';

export function BudgetPage() {
  const queryClient = useQueryClient();
  const [newBudget, setNewBudget] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    data: budget,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['budget'],
    queryFn: adminApi.getBudget,
  });

  const updateMutation = useMutation({
    mutationFn: adminApi.updateBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget'] });
      setSuccessMessage('예산이 변경되었습니다');
      setErrorMessage('');
      setNewBudget('');
    },
    onError: (err: Error) => {
      setErrorMessage(err.message || '예산 변경 중 오류가 발생했습니다');
      setSuccessMessage('');
    },
  });

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseInt(newBudget, 10);
    if (!isNaN(value) && value >= 0) {
      updateMutation.mutate({ totalBudget: value });
    }
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">예산 관리</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">현재 예산 현황</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">총 예산</p>
                <p className="text-2xl font-bold text-gray-900">
                  {budget?.totalBudget.toLocaleString()}P
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">사용 예산</p>
                <p className="text-2xl font-bold text-red-600">
                  {budget?.usedBudget.toLocaleString()}P
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">남은 예산</p>
                <p className="text-2xl font-bold text-green-600">
                  {budget?.remainingBudget.toLocaleString()}P
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">일일 예산 설정</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="새 예산 (P)"
                type="number"
                min="0"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                placeholder="예: 100000"
              />
              <Button
                type="submit"
                isLoading={updateMutation.isPending}
                disabled={!newBudget || updateMutation.isPending}
              >
                예산 변경
              </Button>
            </form>

            {successMessage && (
              <p className="mt-4 text-green-600 font-medium">{successMessage}</p>
            )}
            {errorMessage && (
              <p className="mt-4 text-red-500 font-medium">{errorMessage}</p>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
