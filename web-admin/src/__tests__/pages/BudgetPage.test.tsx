import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@/__tests__/test-utils';
import { BudgetPage } from '@/pages/BudgetPage';
import { adminApi, ApiError } from '@/lib/api';
import { mockBudgetConfig, mockRouletteParticipations, createPageResponse } from '@/__tests__/mocks';

vi.mock('@/lib/api', () => ({
  adminApi: {
    getBudget: vi.fn(),
    updateBudget: vi.fn(),
    getRouletteParticipations: vi.fn(),
    cancelRouletteParticipation: vi.fn(),
  },
  ApiError: class ApiError extends Error {
    code: string;
    status: number;
    constructor(code: string, message: string, status: number) {
      super(message);
      this.code = code;
      this.status = status;
    }
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

  describe('Roulette Participation Table', () => {
    beforeEach(() => {
      vi.mocked(adminApi.getBudget).mockResolvedValue(mockBudgetConfig);
      vi.mocked(adminApi.getRouletteParticipations).mockResolvedValue(
        createPageResponse(mockRouletteParticipations)
      );
    });

    it('renders roulette participation section heading', async () => {
      render(<BudgetPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: '룰렛 참여 내역' })).toBeInTheDocument();
      });
    });

    it('renders participation table with correct columns', async () => {
      render(<BudgetPage />);

      await waitFor(() => {
        expect(screen.getByText('참여번호')).toBeInTheDocument();
        expect(screen.getByText('사용자')).toBeInTheDocument();
        expect(screen.getByText('참여일')).toBeInTheDocument();
        expect(screen.getByText('포인트')).toBeInTheDocument();
        expect(screen.getByText('상태')).toBeInTheDocument();
        expect(screen.getByText('참여시간')).toBeInTheDocument();
        expect(screen.getByText('액션')).toBeInTheDocument();
      });
    });

    it('displays participation data correctly', async () => {
      render(<BudgetPage />);

      await waitFor(() => {
        expect(screen.getByText('#1')).toBeInTheDocument();
        expect(screen.getByText('test_user')).toBeInTheDocument();
        expect(screen.getByText('500P')).toBeInTheDocument();
      });
    });

    it('shows 참여 badge for active participation', async () => {
      render(<BudgetPage />);

      await waitFor(() => {
        const badges = screen.getAllByText('참여');
        expect(badges.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('shows 취소됨 badge for cancelled participation', async () => {
      render(<BudgetPage />);

      await waitFor(() => {
        expect(screen.getByText('취소됨')).toBeInTheDocument();
      });
    });

    it('shows cancel button only for non-cancelled participations', async () => {
      render(<BudgetPage />);

      await waitFor(() => {
        const cancelButtons = screen.getAllByRole('button', { name: '취소' });
        expect(cancelButtons.length).toBe(2);
      });
    });

    it('opens cancel confirmation modal', async () => {
      render(<BudgetPage />);

      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: '취소' })[0]).toBeInTheDocument();
      });

      fireEvent.click(screen.getAllByRole('button', { name: '취소' })[0]);

      await waitFor(() => {
        expect(screen.getByText(/참여 #1.*취소하시겠습니까/)).toBeInTheDocument();
      });
    });

    it('displays loading state for participations', () => {
      vi.mocked(adminApi.getRouletteParticipations).mockReturnValue(new Promise(() => {}));

      render(<BudgetPage />);

      expect(document.querySelectorAll('.animate-spin').length).toBeGreaterThanOrEqual(1);
    });

    it('displays empty state when no participations', async () => {
      vi.mocked(adminApi.getRouletteParticipations).mockResolvedValue(createPageResponse([]));

      render(<BudgetPage />);

      await waitFor(() => {
        expect(screen.getByText('참여 내역이 없습니다.')).toBeInTheDocument();
      });
    });

    it('pagination displays correctly', async () => {
      const paginatedResponse = {
        content: mockRouletteParticipations,
        page: 0,
        size: 10,
        totalElements: 20,
        totalPages: 2,
        first: true,
        last: false,
      };
      vi.mocked(adminApi.getRouletteParticipations).mockResolvedValue(paginatedResponse);

      render(<BudgetPage />);

      await waitFor(() => {
        expect(screen.getByText('1 / 2')).toBeInTheDocument();
      });
    });

    it('cancel mutation shows success message', async () => {
      vi.mocked(adminApi.cancelRouletteParticipation).mockResolvedValue(undefined);

      render(<BudgetPage />);

      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: '취소' })[0]).toBeInTheDocument();
      });

      fireEvent.click(screen.getAllByRole('button', { name: '취소' })[0]);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '취소하기' })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: '취소하기' }));

      await waitFor(() => {
        expect(screen.getByText('참여가 취소되었습니다')).toBeInTheDocument();
      });
    });

    it('cancel mutation shows error message', async () => {
      vi.mocked(adminApi.cancelRouletteParticipation).mockRejectedValue(
        new Error('Cancel failed')
      );

      render(<BudgetPage />);

      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: '취소' })[0]).toBeInTheDocument();
      });

      fireEvent.click(screen.getAllByRole('button', { name: '취소' })[0]);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '취소하기' })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: '취소하기' }));

      await waitFor(() => {
        expect(screen.getByText('Cancel failed')).toBeInTheDocument();
      });
    });

    it('cancel with E009 error shows specific message', async () => {
      const apiError = new ApiError('E009', 'Cannot cancel', 400);
      vi.mocked(adminApi.cancelRouletteParticipation).mockRejectedValue(apiError);

      render(<BudgetPage />);

      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: '취소' })[0]).toBeInTheDocument();
      });

      fireEvent.click(screen.getAllByRole('button', { name: '취소' })[0]);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '취소하기' })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: '취소하기' }));

      await waitFor(() => {
        expect(screen.getByText('이미 사용된 포인트는 취소할 수 없습니다')).toBeInTheDocument();
      });
    });

    it('closes cancel modal on close button click', async () => {
      render(<BudgetPage />);

      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: '취소' })[0]).toBeInTheDocument();
      });

      fireEvent.click(screen.getAllByRole('button', { name: '취소' })[0]);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: '닫기' }));

      await waitFor(() => {
        expect(screen.queryByText(/취소하시겠습니까/)).not.toBeInTheDocument();
      });
    });

    it('participation section is separate Card from budget', async () => {
      render(<BudgetPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: '현재 예산 현황' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: '룰렛 참여 내역' })).toBeInTheDocument();
      });
    });
  });
});
