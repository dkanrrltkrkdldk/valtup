import { describe, it, expect } from 'vitest';
import { render, screen } from '@/__tests__/test-utils';
import { DashboardPage } from '@/pages/DashboardPage';

describe('DashboardPage', () => {
  it('renders page title', () => {
    render(<DashboardPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('대시보드');
  });

  it('renders three stat cards', () => {
    render(<DashboardPage />);
    expect(screen.getByText('오늘 예산')).toBeInTheDocument();
    expect(screen.getByText('오늘 참여자')).toBeInTheDocument();
    expect(screen.getByText('지급 포인트')).toBeInTheDocument();
  });

  it('displays placeholder values', () => {
    render(<DashboardPage />);
    const placeholders = screen.getAllByText('-');
    expect(placeholders.length).toBe(3);
  });

  it('displays placeholder text', () => {
    render(<DashboardPage />);
    const placeholderTexts = screen.getAllByText('페이지 구현 예정');
    expect(placeholderTexts.length).toBe(3);
  });

  it('applies correct color styles to stat values', () => {
    render(<DashboardPage />);
    
    // Budget value should be indigo
    const budgetSection = screen.getByText('오늘 예산').closest('div')?.parentElement;
    const budgetValue = budgetSection?.querySelector('.text-indigo-600');
    expect(budgetValue).toBeInTheDocument();
    
    // Participants value should be green
    const participantsSection = screen.getByText('오늘 참여자').closest('div')?.parentElement;
    const participantsValue = participantsSection?.querySelector('.text-green-600');
    expect(participantsValue).toBeInTheDocument();
    
    // Points value should be orange
    const pointsSection = screen.getByText('지급 포인트').closest('div')?.parentElement;
    const pointsValue = pointsSection?.querySelector('.text-orange-600');
    expect(pointsValue).toBeInTheDocument();
  });

  it('uses Card components for layout', () => {
    const { container } = render(<DashboardPage />);
    const cards = container.querySelectorAll('.bg-white.rounded-xl');
    expect(cards.length).toBe(3);
  });

  it('renders responsive grid layout', () => {
    const { container } = render(<DashboardPage />);
    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-3');
  });
});
