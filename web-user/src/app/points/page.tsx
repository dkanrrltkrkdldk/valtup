'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingScreen } from '@/components/ui/Spinner';
import { usePoints, usePointBalance, useExpiringPoints } from '@/hooks/usePoints';

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getDaysUntilExpiry(expiresAt: string) {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export default function PointsPage() {
  const [page, setPage] = useState(0);
  const { data: pointsData, isLoading } = usePoints(page);
  const { data: balance } = usePointBalance();
  const { data: expiring } = useExpiringPoints();

  if (isLoading) {
    return (
      <AppLayout>
        <LoadingScreen />
      </AppLayout>
    );
  }

  const points = pointsData?.content ?? [];
  const totalPages = pointsData?.totalPages ?? 0;

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">내 포인트</h1>

        <Card className="mb-6">
          <CardBody>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">보유 포인트</p>
              <p className="text-4xl font-bold text-indigo-600">
                {balance?.totalBalance?.toLocaleString() ?? 0}P
              </p>
            </div>
          </CardBody>
        </Card>

        {expiring && expiring.totalAmount > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-yellow-600">⚠️</span>
              <span className="font-medium text-yellow-800">만료 예정 포인트</span>
            </div>
            <p className="text-sm text-yellow-700">
              7일 내 <strong>{expiring.totalAmount.toLocaleString()}P</strong>가 만료됩니다.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {points.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              아직 포인트가 없습니다.
            </div>
          ) : (
            points.map((point) => {
              const daysLeft = getDaysUntilExpiry(point.expiresAt);
              const isExpired = point.expired;
              const isExpiringSoon = !isExpired && daysLeft <= 7;

              return (
                <Card key={point.id} className={isExpired ? 'opacity-50' : ''}>
                  <CardBody>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-bold text-gray-900">
                            {point.availableAmount.toLocaleString()}P
                          </span>
                          {isExpired && <Badge variant="default">만료됨</Badge>}
                          {isExpiringSoon && (
                            <Badge variant="warning">D-{daysLeft}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          획득: {formatDate(point.earnedAt)}
                        </p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>만료일</p>
                        <p className={isExpiringSoon ? 'text-yellow-600 font-medium' : ''}>
                          {formatDate(point.expiresAt)}
                        </p>
                      </div>
                    </div>
                    {point.usedAmount > 0 && (
                      <p className="text-xs text-gray-400 mt-2">
                        사용: {point.usedAmount.toLocaleString()}P / 총 {point.amount.toLocaleString()}P
                      </p>
                    )}
                  </CardBody>
                </Card>
              );
            })
          )}
        </div>

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </AppLayout>
  );
}
