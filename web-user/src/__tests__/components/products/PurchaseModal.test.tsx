import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PurchaseModal } from '@/components/products/PurchaseModal';
import { mockProduct } from '../../mocks/data';

describe('PurchaseModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    product: mockProduct,
    userBalance: 5000,
    onPurchase: jest.fn(),
    isPurchasing: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays product information', () => {
    render(<PurchaseModal {...defaultProps} />);

    expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
    expect(screen.getByText(mockProduct.description)).toBeInTheDocument();
    expect(screen.getAllByText('1,000P').length).toBeGreaterThanOrEqual(1);
  });

  it('allows quantity adjustment', async () => {
    render(<PurchaseModal {...defaultProps} />);

    const increaseButton = screen.getAllByRole('button').find(
      (btn) => btn.textContent === '+'
    );
    
    await userEvent.click(increaseButton!);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('2,000P')).toBeInTheDocument();
  });

  it('prevents quantity below 1', async () => {
    render(<PurchaseModal {...defaultProps} />);

    const decreaseButton = screen.getAllByRole('button').find(
      (btn) => btn.textContent === '-'
    );
    
    expect(decreaseButton).toBeDisabled();
  });

  it('prevents quantity above stock', async () => {
    const lowStockProduct = { ...mockProduct, stock: 2 };
    render(<PurchaseModal {...defaultProps} product={lowStockProduct} />);

    const increaseButton = screen.getAllByRole('button').find(
      (btn) => btn.textContent === '+'
    );
    
    await userEvent.click(increaseButton!);
    await userEvent.click(increaseButton!);
    
    expect(increaseButton).toBeDisabled();
  });

  it('shows user balance', () => {
    render(<PurchaseModal {...defaultProps} />);
    expect(screen.getByText('5,000P')).toBeInTheDocument();
  });

  it('disables purchase when insufficient balance', () => {
    render(<PurchaseModal {...defaultProps} userBalance={500} />);
    
    const purchaseButton = screen.getByRole('button', { name: '구매하기' });
    expect(purchaseButton).toBeDisabled();
  });

  it('calls onPurchase with correct data', async () => {
    const onPurchase = jest.fn().mockResolvedValue(undefined);
    render(<PurchaseModal {...defaultProps} onPurchase={onPurchase} />);

    await userEvent.click(screen.getByRole('button', { name: '구매하기' }));
    
    expect(onPurchase).toHaveBeenCalledWith(mockProduct.id, 1);
  });

  it('calls onClose when cancel button is clicked', async () => {
    const onClose = jest.fn();
    render(<PurchaseModal {...defaultProps} onClose={onClose} />);

    await userEvent.click(screen.getByRole('button', { name: '취소' }));
    
    expect(onClose).toHaveBeenCalled();
  });

  it('shows loading state when isPurchasing is true', () => {
    render(<PurchaseModal {...defaultProps} isPurchasing={true} />);
    
    const purchaseButton = screen.getByRole('button', { name: '구매하기' });
    expect(purchaseButton).toBeDisabled();
  });

  it('does not render when product is null', () => {
    render(<PurchaseModal {...defaultProps} product={null} />);
    expect(screen.queryByText('상품 구매')).not.toBeInTheDocument();
  });
});
