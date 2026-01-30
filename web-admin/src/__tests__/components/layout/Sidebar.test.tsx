import { describe, it, expect } from 'vitest';
import { render, screen } from '@/__tests__/test-utils';
import { Sidebar } from '@/components/layout/Sidebar';

describe('Sidebar', () => {
  it('renders brand title', () => {
    render(<Sidebar />);
    expect(screen.getByText('Point Roulette')).toBeInTheDocument();
  });

  it('renders subtitle', () => {
    render(<Sidebar />);
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('renders all navigation items', () => {
    render(<Sidebar />);
    expect(screen.getByText('대시보드')).toBeInTheDocument();
    expect(screen.getByText('예산 관리')).toBeInTheDocument();
    expect(screen.getByText('상품 관리')).toBeInTheDocument();
    expect(screen.getByText('주문 내역')).toBeInTheDocument();
  });

  it('renders navigation links with correct hrefs', () => {
    render(<Sidebar />);
    expect(screen.getByRole('link', { name: /대시보드/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /예산 관리/i })).toHaveAttribute('href', '/budget');
    expect(screen.getByRole('link', { name: /상품 관리/i })).toHaveAttribute('href', '/products');
    expect(screen.getByRole('link', { name: /주문 내역/i })).toHaveAttribute('href', '/orders');
  });

  it('renders navigation icons', () => {
    render(<Sidebar />);
    expect(screen.getByText('📊')).toBeInTheDocument();
    expect(screen.getByText('💰')).toBeInTheDocument();
    expect(screen.getByText('📦')).toBeInTheDocument();
    expect(screen.getByText('📋')).toBeInTheDocument();
  });

  it('highlights active route', () => {
    render(<Sidebar />, { initialEntries: ['/'] });
    const dashboardLink = screen.getByRole('link', { name: /대시보드/i });
    expect(dashboardLink).toHaveClass('bg-indigo-600');
  });

  it('highlights budget route when active', () => {
    render(<Sidebar />, { initialEntries: ['/budget'] });
    const budgetLink = screen.getByRole('link', { name: /예산 관리/i });
    expect(budgetLink).toHaveClass('bg-indigo-600');
  });

  it('highlights products route when active', () => {
    render(<Sidebar />, { initialEntries: ['/products'] });
    const productsLink = screen.getByRole('link', { name: /상품 관리/i });
    expect(productsLink).toHaveClass('bg-indigo-600');
  });

  it('highlights orders route when active', () => {
    render(<Sidebar />, { initialEntries: ['/orders'] });
    const ordersLink = screen.getByRole('link', { name: /주문 내역/i });
    expect(ordersLink).toHaveClass('bg-indigo-600');
  });

  it('does not highlight inactive routes', () => {
    render(<Sidebar />, { initialEntries: ['/'] });
    const budgetLink = screen.getByRole('link', { name: /예산 관리/i });
    expect(budgetLink).not.toHaveClass('bg-indigo-600');
    expect(budgetLink).toHaveClass('text-gray-300');
  });

  it('applies dark sidebar styles', () => {
    const { container } = render(<Sidebar />);
    const aside = container.querySelector('aside');
    expect(aside).toHaveClass('w-64', 'bg-gray-900', 'text-white', 'min-h-screen');
  });
});
