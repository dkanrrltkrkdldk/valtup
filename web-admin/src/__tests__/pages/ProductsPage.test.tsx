import { describe, it, expect } from 'vitest';
import { render, screen } from '@/__tests__/test-utils';
import { ProductsPage } from '@/pages/ProductsPage';

describe('ProductsPage', () => {
  it('renders page title', () => {
    render(<ProductsPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('상품 관리');
  });

  it('renders card with product list title', () => {
    render(<ProductsPage />);
    expect(screen.getByText('상품 목록')).toBeInTheDocument();
  });

  it('displays placeholder text', () => {
    render(<ProductsPage />);
    expect(screen.getByText('페이지 구현 예정 (4.2 페이지 구현)')).toBeInTheDocument();
  });

  it('uses Card component structure', () => {
    const { container } = render(<ProductsPage />);
    const card = container.querySelector('.bg-white.rounded-xl');
    expect(card).toBeInTheDocument();
  });

  it('renders CardHeader within Card', () => {
    const { container } = render(<ProductsPage />);
    const cardHeader = container.querySelector('.border-b.border-gray-200');
    expect(cardHeader).toBeInTheDocument();
    expect(cardHeader).toHaveTextContent('상품 목록');
  });

  it('applies proper heading styles', () => {
    render(<ProductsPage />);
    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toHaveClass('text-2xl', 'font-bold', 'text-gray-900', 'mb-6');
  });
});
