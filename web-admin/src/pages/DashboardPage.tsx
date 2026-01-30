import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardBody, Spinner } from '@/components/ui';
import { adminApi } from '@/lib/api';

export function DashboardPage() {
  const {
    data: dashboard,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useQuery({
    queryKey: ['dashboard'],
    queryFn: adminApi.getDashboard,
  });

  const {
    data: budget,
    isLoading: budgetLoading,
    error: budgetError,
  } = useQuery({
    queryKey: ['budget'],
    queryFn: adminApi.getBudget,
  });

  const isLoading = dashboardLoading || budgetLoading;
  const error = dashboardError || budgetError;

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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">대시보드</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">오늘 예산</h2>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold text-indigo-600">
              {budget?.remainingBudget.toLocaleString()}P
            </p>
            <p className="text-sm text-gray-500 mt-1">
              총 {budget?.totalBudget.toLocaleString()}P 중 남은 예산
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">오늘 참여자</h2>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold text-green-600">
              {dashboard?.todayParticipants.toLocaleString()}명
            </p>
            <p className="text-sm text-gray-500 mt-1">오늘 룰렛 참여 인원</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">지급 포인트</h2>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold text-orange-600">
              {dashboard?.todayPointsGiven.toLocaleString()}P
            </p>
            <p className="text-sm text-gray-500 mt-1">오늘 지급된 총 포인트</p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
