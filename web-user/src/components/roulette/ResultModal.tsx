'use client';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  pointAmount: number;
  isWin: boolean;
}

export function ResultModal({ isOpen, onClose, pointAmount, isWin }: ResultModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center py-6">
        {isWin ? (
          <>
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">축하합니다!</h2>
            <p className="text-4xl font-bold text-indigo-600 mb-4">
              {pointAmount.toLocaleString()}P
            </p>
            <p className="text-gray-600 mb-6">포인트를 획득하셨습니다!</p>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">😢</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">아쉽네요!</h2>
            <p className="text-gray-600 mb-6">
              오늘의 예산이 모두 소진되었습니다.<br />
              내일 다시 도전해주세요!
            </p>
          </>
        )}
        <Button onClick={onClose} size="lg">
          확인
        </Button>
      </div>
    </Modal>
  );
}
