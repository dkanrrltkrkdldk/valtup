import { render, screen, waitFor } from '../test-utils';
import PointsPage from '@/app/points/page';
import { mockPoint, mockExpiringPoint, createPageResponse, mockPointBalance, mockExpiringPoints } from '../mocks/data';

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

jest.mock('@/hooks/usePoints', () => ({
  usePoints: () => ({
    data: createPageResponse([mockPoint, mockExpiringPoint]),
    isLoading: false,
  }),
  usePointBalance: () => ({
    data: mockPointBalance,
  }),
  useExpiringPoints: () => ({
    data: mockExpiringPoints,
  }),
}));

describe('PointsPage', () => {
  it('renders page title', async () => {
    render(<PointsPage />);

    await waitFor(() => {
      expect(screen.getByText('내 포인트')).toBeInTheDocument();
    });
  });

  it('displays total balance', async () => {
    render(<PointsPage />);

    await waitFor(() => {
      expect(screen.getByText('700P')).toBeInTheDocument();
    });
  });

  it('shows expiring points warning when applicable', async () => {
    render(<PointsPage />);

    await waitFor(() => {
      expect(screen.getByText('만료 예정 포인트')).toBeInTheDocument();
    });
  });

  it('displays points list with expiry dates', async () => {
    render(<PointsPage />);

    await waitFor(() => {
      expect(screen.getByText('400P')).toBeInTheDocument();
      expect(screen.getAllByText('300P').length).toBeGreaterThanOrEqual(1);
    });
  });
});
