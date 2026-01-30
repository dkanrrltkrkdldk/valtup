import { render, screen } from '@testing-library/react';
import { Navigation } from '@/components/layout/Navigation';

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('Navigation', () => {
  it('renders all navigation items', () => {
    render(<Navigation />);
    
    expect(screen.getByText('룰렛')).toBeInTheDocument();
    expect(screen.getByText('포인트')).toBeInTheDocument();
    expect(screen.getByText('상품')).toBeInTheDocument();
    expect(screen.getByText('주문내역')).toBeInTheDocument();
  });

  it('renders navigation icons', () => {
    render(<Navigation />);
    
    expect(screen.getByText('🎰')).toBeInTheDocument();
    expect(screen.getByText('💰')).toBeInTheDocument();
    expect(screen.getByText('🛍️')).toBeInTheDocument();
    expect(screen.getByText('📋')).toBeInTheDocument();
  });

  it('highlights active navigation item', () => {
    render(<Navigation />);
    
    const rouletteLink = screen.getByText('룰렛').closest('a');
    expect(rouletteLink).toHaveClass('text-indigo-600');
  });

  it('renders links with correct hrefs', () => {
    render(<Navigation />);
    
    expect(screen.getByText('룰렛').closest('a')).toHaveAttribute('href', '/');
    expect(screen.getByText('포인트').closest('a')).toHaveAttribute('href', '/points');
    expect(screen.getByText('상품').closest('a')).toHaveAttribute('href', '/products');
    expect(screen.getByText('주문내역').closest('a')).toHaveAttribute('href', '/orders');
  });
});
