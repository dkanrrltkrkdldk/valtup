import { describe, it, expect } from 'vitest';
import { render, screen } from '@/__tests__/test-utils';
import { OrdersPage } from '@/pages/OrdersPage';

describe('OrdersPage', () => {
  it('renders page title', () => {
    render(<OrdersPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('주문 내역');
  });

  it('renders card with orders title', () => {
    render(<OrdersPage />);
    expect(screen.getByText('전체 주문')).toBeInTheDocument();
  });

  it('displays placeholder text', () => {
    render(<OrdersPage />);
    expect(screen.getByText('페이지 구현 예정 (4.2 페이지 구현)')).toBeInTheDocument();
  });

  it('uses Card component structure', () => {
    const { container } = render(<OrdersPage />);
    const card = container.querySelector('.bg-white.rounded-xl');
    expect(card).toBeInTheDocument();
  });

  it('renders CardHeader within Card', () => {
    const { container } = render(<OrdersPage />);
    const cardHeader = container.querySelector('.border-b.border-gray-200');
    expect(cardHeader).toBeInTheDocument();
    expect(cardHeader).toHaveTextContent('전체 주문');
  });

  it('applies proper heading styles', () => {
    render(<OrdersPage />);
    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toHaveClass('text-2xl', 'font-bold', 'text-gray-900', 'mb-6');
  });
});
