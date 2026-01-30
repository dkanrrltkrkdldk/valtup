import { Card, CardHeader, CardBody } from '@/components/ui';

export function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">대시보드</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">오늘 예산</h2>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold text-indigo-600">-</p>
            <p className="text-sm text-gray-500 mt-1">페이지 구현 예정</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">오늘 참여자</h2>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold text-green-600">-</p>
            <p className="text-sm text-gray-500 mt-1">페이지 구현 예정</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">지급 포인트</h2>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold text-orange-600">-</p>
            <p className="text-sm text-gray-500 mt-1">페이지 구현 예정</p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
