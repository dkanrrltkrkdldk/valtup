import { render, screen, waitFor } from '../test-utils';
import ProductsPage from '@/app/products/page';
import { mockProduct, mockProductOutOfStock, createPageResponse, mockPointBalance } from '../mocks/data';

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

jest.mock('@/hooks/useProducts', () => ({
  useProducts: () => ({
    data: createPageResponse([mockProduct, mockProductOutOfStock]),
    isLoading: false,
    refetch: jest.fn(),
  }),
}));

jest.mock('@/hooks/usePoints', () => ({
  usePointBalance: () => ({
    data: mockPointBalance,
    refetch: jest.fn(),
  }),
}));

jest.mock('@/hooks/useOrders', () => ({
  useCreateOrder: () => ({
    mutateAsync: jest.fn(),
    isPending: false,
  }),
}));

describe('ProductsPage', () => {
  it('renders page title', async () => {
    render(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('상품')).toBeInTheDocument();
    });
  });

  it('displays products list', async () => {
    render(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('테스트 상품')).toBeInTheDocument();
    });
  });

  it('displays out of stock badge for sold out products', async () => {
    render(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('품절 상품')).toBeInTheDocument();
    });
  });

  it('shows user balance', async () => {
    render(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('보유 포인트')).toBeInTheDocument();
      expect(screen.getByText('700P')).toBeInTheDocument();
    });
  });
});
