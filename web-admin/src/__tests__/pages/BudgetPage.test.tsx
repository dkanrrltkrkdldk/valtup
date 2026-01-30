import { describe, it, expect } from 'vitest';
import { render, screen } from '@/__tests__/test-utils';
import { BudgetPage } from '@/pages/BudgetPage';

describe('BudgetPage', () => {
  it('renders page title', () => {
    render(<BudgetPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('예산 관리');
  });

  it('renders card with budget settings title', () => {
    render(<BudgetPage />);
    expect(screen.getByText('일일 예산 설정')).toBeInTheDocument();
  });

  it('displays placeholder text', () => {
    render(<BudgetPage />);
    expect(screen.getByText('페이지 구현 예정 (4.2 페이지 구현)')).toBeInTheDocument();
  });

  it('uses Card component structure', () => {
    const { container } = render(<BudgetPage />);
    const card = container.querySelector('.bg-white.rounded-xl');
    expect(card).toBeInTheDocument();
  });

  it('renders CardHeader within Card', () => {
    const { container } = render(<BudgetPage />);
    const cardHeader = container.querySelector('.border-b.border-gray-200');
    expect(cardHeader).toBeInTheDocument();
    expect(cardHeader).toHaveTextContent('일일 예산 설정');
  });

  it('applies proper heading styles', () => {
    render(<BudgetPage />);
    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toHaveClass('text-2xl', 'font-bold', 'text-gray-900', 'mb-6');
  });
});
