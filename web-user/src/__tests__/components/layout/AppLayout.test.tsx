import { render, screen } from '@testing-library/react';
import { AppLayout } from '@/components/layout/AppLayout';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/lib/auth', () => ({
  useAuth: () => ({
    user: { id: 1, nickname: 'testuser', role: 'USER' },
    isAuthenticated: true,
    isLoading: false,
  }),
}));

jest.mock('@/hooks/usePoints', () => ({
  usePointBalance: () => ({
    data: { totalBalance: 700, expiringIn7Days: 300 },
  }),
}));

describe('AppLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when authenticated', () => {
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders Header when not on login page', () => {
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );
    
    expect(screen.getByText('Point Roulette')).toBeInTheDocument();
  });

  it('renders Navigation when not on login page', () => {
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );
    
    expect(screen.getByText('룰렛')).toBeInTheDocument();
  });
});

describe('AppLayout - Rendering', () => {
  it('renders with main container', () => {
    const { container } = render(
      <AppLayout>
        <div>Content</div>
      </AppLayout>
    );
    
    expect(container.querySelector('main')).toBeInTheDocument();
  });
});
