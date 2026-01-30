import { Card, CardHeader, CardBody } from '@/components/ui';

export function BudgetPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">예산 관리</h1>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">일일 예산 설정</h2>
        </CardHeader>
        <CardBody>
          <p className="text-gray-500">페이지 구현 예정 (4.2 페이지 구현)</p>
        </CardBody>
      </Card>
    </div>
  );
}
