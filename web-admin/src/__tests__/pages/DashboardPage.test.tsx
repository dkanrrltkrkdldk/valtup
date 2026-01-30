import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/__tests__/test-utils';
import { DashboardPage } from '@/pages/DashboardPage';
import { adminApi } from '@/lib/api';
import { mockDashboardStats, mockBudgetConfig } from '@/__tests__/mocks';

vi.mock('@/lib/api', () => ({
  adminApi: {
    getDashboard: vi.fn(),
    getBudget: vi.fn(),
  },
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page title', async () => {
    vi.mocked(adminApi.getDashboard).mockResolvedValue(mockDashboardStats);
    vi.mocked(adminApi.getBudget).mockResolvedValue(mockBudgetConfig);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('대시보드');
    });
  });

  it('displays loading state while fetching', () => {
    vi.mocked(adminApi.getDashboard).mockReturnValue(new Promise(() => {}));
    vi.mocked(adminApi.getBudget).mockReturnValue(new Promise(() => {}));

    const { container } = render(<DashboardPage />);

    expect(container.querySelector('.animate-spin')).toBeTruthy();
  });

  it('displays dashboard data when loaded', async () => {
    vi.mocked(adminApi.getDashboard).mockResolvedValue(mockDashboardStats);
    vi.mocked(adminApi.getBudget).mockResolvedValue(mockBudgetConfig);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('150명')).toBeInTheDocument();
      expect(screen.getByText('45,000P')).toBeInTheDocument();
    });
  });

  it('displays budget data when loaded', async () => {
    vi.mocked(adminApi.getDashboard).mockResolvedValue(mockDashboardStats);
    vi.mocked(adminApi.getBudget).mockResolvedValue(mockBudgetConfig);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('55,000P')).toBeInTheDocument();
    });
  });

  it('displays error state when API fails', async () => {
    vi.mocked(adminApi.getDashboard).mockRejectedValue(new Error('API Error'));
    vi.mocked(adminApi.getBudget).mockResolvedValue(mockBudgetConfig);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('데이터를 불러오는 중 오류가 발생했습니다.')).toBeInTheDocument();
    });
  });

  it('renders three stat cards with correct titles', async () => {
    vi.mocked(adminApi.getDashboard).mockResolvedValue(mockDashboardStats);
    vi.mocked(adminApi.getBudget).mockResolvedValue(mockBudgetConfig);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('오늘 예산')).toBeInTheDocument();
      expect(screen.getByText('오늘 참여자')).toBeInTheDocument();
      expect(screen.getByText('지급 포인트')).toBeInTheDocument();
    });
  });

  it('applies correct color styles to stat values', async () => {
    vi.mocked(adminApi.getDashboard).mockResolvedValue(mockDashboardStats);
    vi.mocked(adminApi.getBudget).mockResolvedValue(mockBudgetConfig);

    render(<DashboardPage />);

    await waitFor(() => {
      const budgetValue = screen.getByText('55,000P');
      expect(budgetValue).toHaveClass('text-indigo-600');

      const participantsValue = screen.getByText('150명');
      expect(participantsValue).toHaveClass('text-green-600');

      const pointsValue = screen.getByText('45,000P');
      expect(pointsValue).toHaveClass('text-orange-600');
    });
  });

  it('uses Card components for layout', async () => {
    vi.mocked(adminApi.getDashboard).mockResolvedValue(mockDashboardStats);
    vi.mocked(adminApi.getBudget).mockResolvedValue(mockBudgetConfig);

    const { container } = render(<DashboardPage />);

    await waitFor(() => {
      const cards = container.querySelectorAll('.bg-white.rounded-xl');
      expect(cards.length).toBe(3);
    });
  });

  it('renders responsive grid layout', async () => {
    vi.mocked(adminApi.getDashboard).mockResolvedValue(mockDashboardStats);
    vi.mocked(adminApi.getBudget).mockResolvedValue(mockBudgetConfig);

    const { container } = render(<DashboardPage />);

    await waitFor(() => {
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-3');
    });
  });
});
