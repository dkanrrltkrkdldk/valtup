import { render, screen, waitFor, fireEvent } from '../test-utils';
import HomePage from '@/app/page';
import { mockRouletteStatus, mockPointBalance, mockSpinResultWin } from '../mocks/data';

jest.mock('@/lib/auth', () => ({
  useAuth: () => ({
    user: { id: 1, nickname: 'testuser', role: 'USER' },
    isAuthenticated: true,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
    refetch: jest.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/components/layout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockRefetchStatus = jest.fn();
const mockRefetchBalance = jest.fn();
const mockMutateAsync = jest.fn();

jest.mock('@/hooks/useRoulette', () => ({
  useRouletteStatus: () => ({
    data: mockRouletteStatus,
    isLoading: false,
    refetch: mockRefetchStatus,
  }),
  useSpinRoulette: () => ({
    mutateAsync: mockMutateAsync,
  }),
}));

jest.mock('@/hooks/usePoints', () => ({
  usePointBalance: () => ({
    data: mockPointBalance,
    refetch: mockRefetchBalance,
  }),
}));

describe('HomePage (Roulette)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMutateAsync.mockResolvedValue(mockSpinResultWin);
  });

  it('renders page title', async () => {
    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("오늘의 룰렛")).toBeInTheDocument();
    });
  });

  it('displays user balance', async () => {
    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('700P')).toBeInTheDocument();
    });
  });

  it('displays remaining budget', async () => {
    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('50,000P')).toBeInTheDocument();
    });
  });

  it('shows spin button when can participate', async () => {
    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('룰렛 돌리기')).toBeInTheDocument();
    });
  });

  it('shows already participated message when participated today', async () => {
    jest.doMock('@/hooks/useRoulette', () => ({
      useRouletteStatus: () => ({
        data: { ...mockRouletteStatus, hasParticipatedToday: true, canParticipate: false },
        isLoading: false,
        refetch: mockRefetchStatus,
      }),
      useSpinRoulette: () => ({
        mutateAsync: mockMutateAsync,
      }),
    }));

    const { rerender } = render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '룰렛 돌리기' })).toBeInTheDocument();
    });
  });
});
