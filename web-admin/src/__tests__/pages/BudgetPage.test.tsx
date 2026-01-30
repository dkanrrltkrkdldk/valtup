import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@/__tests__/test-utils';
import { BudgetPage } from '@/pages/BudgetPage';
import { adminApi } from '@/lib/api';
import { mockBudgetConfig } from '@/__tests__/mocks';

vi.mock('@/lib/api', () => ({
  adminApi: {
    getBudget: vi.fn(),
    updateBudget: vi.fn(),
  },
}));

describe('BudgetPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page title', async () => {
    vi.mocked(adminApi.getBudget).mockResolvedValue(mockBudgetConfig);

    render(<BudgetPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('예산 관리');
    });
  });

  it('displays loading state while fetching', () => {
    vi.mocked(adminApi.getBudget).mockReturnValue(new Promise(() => {}));

    render(<BudgetPage />);

    expect(document.querySelector('.animate-spin')).toBeTruthy();
  });

  it('displays budget info when loaded', async () => {
    vi.mocked(adminApi.getBudget).mockResolvedValue(mockBudgetConfig);

    render(<BudgetPage />);

    await waitFor(() => {
      expect(screen.getByText('100,000P')).toBeInTheDocument();
      expect(screen.getByText('45,000P')).toBeInTheDocument();
      expect(screen.getByText('55,000P')).toBeInTheDocument();
    });
  });

  it('renders edit form with input and button', async () => {
    vi.mocked(adminApi.getBudget).mockResolvedValue(mockBudgetConfig);

    render(<BudgetPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('새 예산 (P)')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '예산 변경' })).toBeInTheDocument();
    });
  });

  it('submits form and shows success message', async () => {
    vi.mocked(adminApi.getBudget).mockResolvedValue(mockBudgetConfig);
    vi.mocked(adminApi.updateBudget).mockResolvedValue({
      ...mockBudgetConfig,
      totalBudget: 150000,
    });

    render(<BudgetPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('새 예산 (P)')).toBeInTheDocument();
    });

    const input = screen.getByLabelText('새 예산 (P)');
    fireEvent.change(input, { target: { value: '150000' } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '예산 변경' })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: '예산 변경' }));

    await waitFor(() => {
      expect(screen.getByText('예산이 변경되었습니다')).toBeInTheDocument();
    });

    expect(adminApi.updateBudget).toHaveBeenCalled();
  });

  it('displays error message on mutation failure', async () => {
    vi.mocked(adminApi.getBudget).mockResolvedValue(mockBudgetConfig);
    vi.mocked(adminApi.updateBudget).mockRejectedValue(new Error('Update failed'));

    render(<BudgetPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('새 예산 (P)')).toBeInTheDocument();
    });

    const input = screen.getByLabelText('새 예산 (P)');
    fireEvent.change(input, { target: { value: '150000' } });

    const button = screen.getByRole('button', { name: '예산 변경' });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument();
    });
  });

  it('displays error state when API fails', async () => {
    vi.mocked(adminApi.getBudget).mockRejectedValue(new Error('API Error'));

    render(<BudgetPage />);

    await waitFor(() => {
      expect(screen.getByText('데이터를 불러오는 중 오류가 발생했습니다.')).toBeInTheDocument();
    });
  });

  it('disables submit button when input is empty', async () => {
    vi.mocked(adminApi.getBudget).mockResolvedValue(mockBudgetConfig);

    render(<BudgetPage />);

    await waitFor(() => {
      const button = screen.getByRole('button', { name: '예산 변경' });
      expect(button).toBeDisabled();
    });
  });

  it('applies proper heading styles', async () => {
    vi.mocked(adminApi.getBudget).mockResolvedValue(mockBudgetConfig);

    render(<BudgetPage />);

    await waitFor(() => {
      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toHaveClass('text-2xl', 'font-bold', 'text-gray-900', 'mb-6');
    });
  });
});
