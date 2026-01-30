import { render, screen, waitFor } from '../test-utils';
import OrdersPage from '@/app/orders/page';
import { mockOrder, mockOrderCancelled, createPageResponse } from '../mocks/data';

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

jest.mock('@/hooks/useOrders', () => ({
  useOrders: () => ({
    data: createPageResponse([mockOrder, mockOrderCancelled]),
    isLoading: false,
  }),
}));

describe('OrdersPage', () => {
  it('renders page title', async () => {
    render(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('주문 내역')).toBeInTheDocument();
    });
  });

  it('displays orders list', async () => {
    render(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('테스트 상품')).toBeInTheDocument();
    });
  });

  it('shows completed status badge', async () => {
    render(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('완료')).toBeInTheDocument();
    });
  });

  it('displays order quantity', async () => {
    render(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('수량: 2개')).toBeInTheDocument();
    });
  });

  it('shows cancelled order with cancelled badge', async () => {
    render(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('취소됨')).toBeInTheDocument();
      expect(screen.getByText('취소된 상품')).toBeInTheDocument();
    });
  });
});
