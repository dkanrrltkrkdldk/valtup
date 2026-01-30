import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Button,
  Spinner,
  Modal,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui';
import { adminApi, ApiError } from '@/lib/api';
import type { RouletteParticipationResponse } from '@/types/api';

export function BudgetPage() {
  const queryClient = useQueryClient();
  const [newBudget, setNewBudget] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [participationPage, setParticipationPage] = useState(0);
  const [cancellingParticipation, setCancellingParticipation] = useState<RouletteParticipationResponse | null>(null);
  const [participationSuccessMessage, setParticipationSuccessMessage] = useState('');
  const [participationErrorMessage, setParticipationErrorMessage] = useState('');

  const {
    data: budget,
    isLoading: budgetLoading,
    error: budgetError,
  } = useQuery({
    queryKey: ['budget'],
    queryFn: adminApi.getBudget,
  });

  const {
    data: participations,
    isLoading: participationsLoading,
  } = useQuery({
    queryKey: ['roulette-participations', participationPage],
    queryFn: () => adminApi.getRouletteParticipations(participationPage, 10),
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

  const cancelParticipationMutation = useMutation({
    mutationFn: adminApi.cancelRouletteParticipation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roulette-participations'] });
      queryClient.invalidateQueries({ queryKey: ['budget'] });
      setCancellingParticipation(null);
      setParticipationSuccessMessage('참여가 취소되었습니다');
      setParticipationErrorMessage('');
    },
    onError: (err: Error | ApiError) => {
      if (err instanceof ApiError && err.code === 'E009') {
        setParticipationErrorMessage('이미 사용된 포인트는 취소할 수 없습니다');
      } else {
        setParticipationErrorMessage(err.message || '참여 취소 중 오류가 발생했습니다');
      }
    },
  });

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (participationSuccessMessage) {
      const timer = setTimeout(() => setParticipationSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [participationSuccessMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseInt(newBudget, 10);
    if (!isNaN(value) && value >= 0) {
      updateMutation.mutate({ totalBudget: value });
    }
  };

  const handleCancelParticipation = () => {
    if (cancellingParticipation) {
      cancelParticipationMutation.mutate(cancellingParticipation.id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (budgetLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (budgetError) {
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

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">룰렛 참여 내역</h2>
          </CardHeader>
          <CardBody>
            {participationSuccessMessage && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
                {participationSuccessMessage}
              </div>
            )}

            {participationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : participations?.content.length === 0 ? (
              <p className="text-center text-gray-500 py-8">참여 내역이 없습니다.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>참여번호</TableHead>
                    <TableHead>사용자</TableHead>
                    <TableHead>참여일</TableHead>
                    <TableHead>포인트</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>참여시간</TableHead>
                    <TableHead>액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participations?.content.map((participation) => (
                    <TableRow key={participation.id}>
                      <TableCell>#{participation.id}</TableCell>
                      <TableCell>{participation.userNickname}</TableCell>
                      <TableCell>{formatDate(participation.date)}</TableCell>
                      <TableCell>{participation.pointAmount}P</TableCell>
                      <TableCell>
                        {participation.cancelledAt ? (
                          <Badge variant="danger">취소됨</Badge>
                        ) : (
                          <Badge variant="success">참여</Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatTime(participation.createdAt)}</TableCell>
                      <TableCell>
                        {!participation.cancelledAt && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setCancellingParticipation(participation)}
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

            {participations && participations.totalPages > 0 && (
              <div className="flex justify-center items-center gap-4 mt-4 pt-4 border-t">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setParticipationPage((p) => p - 1)}
                  disabled={participations.first}
                >
                  이전
                </Button>
                <span className="text-sm text-gray-600">
                  {participations.page + 1} / {participations.totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setParticipationPage((p) => p + 1)}
                  disabled={participations.last}
                >
                  다음
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <Modal
        isOpen={!!cancellingParticipation}
        onClose={() => {
          setCancellingParticipation(null);
          setParticipationErrorMessage('');
        }}
        title="참여 취소"
      >
        <p className="text-gray-600 mb-6">
          참여 #{cancellingParticipation?.id}을(를) 취소하시겠습니까?
        </p>
        {participationErrorMessage && (
          <p className="text-red-500 text-sm mb-4">{participationErrorMessage}</p>
        )}
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setCancellingParticipation(null);
              setParticipationErrorMessage('');
            }}
          >
            닫기
          </Button>
          <Button
            variant="danger"
            onClick={handleCancelParticipation}
            isLoading={cancelParticipationMutation.isPending}
          >
            취소하기
          </Button>
        </div>
      </Modal>
    </div>
  );
}
