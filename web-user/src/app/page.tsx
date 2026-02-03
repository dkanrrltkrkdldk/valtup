'use client';

import { useState, useCallback } from 'react';
import { AppLayout } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { LoadingScreen } from '@/components/ui/Spinner';
import { RouletteWheel, ResultModal } from '@/components/roulette';
import { useRouletteStatus, useSpinRoulette } from '@/hooks/useRoulette';
import { usePointBalance } from '@/hooks/usePoints';

export default function HomePage() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<{ pointAmount: number; isWin: boolean } | null>(null);
  const [targetValue, setTargetValue] = useState<number | null>(null);

  const { data: status, isLoading: statusLoading, refetch: refetchStatus } = useRouletteStatus();
  const { data: balance, refetch: refetchBalance } = usePointBalance();
  const spinMutation = useSpinRoulette();

  const handleSpin = useCallback(async () => {
    if (isSpinning || !status?.canParticipate) return;

    try {
      const res = await spinMutation.mutateAsync();
      setTargetValue(res.pointAmount);
      setResult({ pointAmount: res.pointAmount, isWin: res.isWin });
      setIsSpinning(true);
      
      setTimeout(() => {
        setShowResult(true);
        setIsSpinning(false);
        setTargetValue(null);
        refetchStatus();
        refetchBalance();
      }, 4000);
    } catch {
      setIsSpinning(false);
      setTargetValue(null);
    }
  }, [isSpinning, status?.canParticipate, spinMutation, refetchStatus, refetchBalance]);

  const handleSpinEnd = useCallback(() => {
  }, []);

  const handleCloseResult = useCallback(() => {
    setShowResult(false);
    setResult(null);
  }, []);

  if (statusLoading) {
    return (
      <AppLayout>
        <LoadingScreen />
      </AppLayout>
    );
  }

  const canSpin = status?.canParticipate && !isSpinning;
  const hasParticipated = status?.hasParticipatedToday;
  const budgetExhausted = status && status.remainingBudget <= 0;

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">오늘의 룰렛</h1>
          <p className="text-gray-600">하루에 한 번, 행운을 시험해보세요!</p>
        </div>

        <Card className="mb-6">
          <CardBody>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">내 포인트</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {balance?.totalBalance?.toLocaleString() ?? 0}P
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">오늘 남은 예산</p>
                <p className="text-2xl font-bold text-gray-900">
                  {status?.remainingBudget?.toLocaleString() ?? 0}P
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="mb-8">
          <RouletteWheel isSpinning={isSpinning} targetValue={targetValue} onSpinEnd={handleSpinEnd} />
        </div>

        <div className="text-center">
          {hasParticipated ? (
            <div className="p-4 bg-gray-100 rounded-xl">
              <p className="text-gray-600 font-medium">오늘은 이미 참여하셨습니다.</p>
              <p className="text-sm text-gray-500 mt-1">내일 다시 도전해주세요!</p>
            </div>
          ) : budgetExhausted ? (
            <div className="p-4 bg-yellow-50 rounded-xl">
              <p className="text-yellow-800 font-medium">오늘의 예산이 소진되었습니다.</p>
              <p className="text-sm text-yellow-600 mt-1">내일 다시 도전해주세요!</p>
            </div>
          ) : (
            <Button
              onClick={handleSpin}
              disabled={!canSpin}
              isLoading={isSpinning}
              size="lg"
              className="w-full max-w-xs"
            >
              {isSpinning ? '돌리는 중...' : '룰렛 돌리기'}
            </Button>
          )}
        </div>

        {result && (
          <ResultModal
            isOpen={showResult}
            onClose={handleCloseResult}
            pointAmount={result.pointAmount}
            isWin={result.isWin}
          />
        )}
      </div>
    </AppLayout>
  );
}
