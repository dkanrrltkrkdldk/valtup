'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { Product } from '@/types/api';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  userBalance: number;
  onPurchase: (productId: number, quantity: number) => Promise<void>;
  isPurchasing: boolean;
}

export function PurchaseModal({
  isOpen,
  onClose,
  product,
  userBalance,
  onPurchase,
  isPurchasing,
}: PurchaseModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  if (!product) return null;

  const totalPrice = product.price * quantity;
  const canAfford = userBalance >= totalPrice;
  const hasStock = product.stock >= quantity;

  const handleQuantityChange = (delta: number) => {
    const newQty = Math.max(1, Math.min(product.stock, quantity + delta));
    setQuantity(newQty);
    setError('');
  };

  const handlePurchase = async () => {
    if (!canAfford) {
      setError('포인트가 부족합니다.');
      return;
    }
    if (!hasStock) {
      setError('재고가 부족합니다.');
      return;
    }

    try {
      await onPurchase(product.id, quantity);
      setQuantity(1);
      onClose();
    } catch {
      setError('구매에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleClose = () => {
    setQuantity(1);
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="상품 구매">
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-3xl">
            🎁
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{product.description}</p>
            <p className="text-lg font-bold text-indigo-600 mt-2">
              {product.price.toLocaleString()}P
            </p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">수량</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50"
              >
                -
              </button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= product.stock}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">총 금액</span>
            <span className="text-xl font-bold text-indigo-600">
              {totalPrice.toLocaleString()}P
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">보유 포인트</span>
            <span className={canAfford ? 'text-gray-600' : 'text-red-600'}>
              {userBalance.toLocaleString()}P
            </span>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleClose} className="flex-1">
            취소
          </Button>
          <Button
            onClick={handlePurchase}
            disabled={!canAfford || !hasStock}
            isLoading={isPurchasing}
            className="flex-1"
          >
            구매하기
          </Button>
        </div>
      </div>
    </Modal>
  );
}
