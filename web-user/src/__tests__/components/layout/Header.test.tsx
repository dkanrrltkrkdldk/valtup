import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '@/components/layout/Header';
import { mockPointBalance } from '../../mocks/data';

const mockLogout = jest.fn();

jest.mock('@/lib/auth', () => ({
  useAuth: () => ({
    user: { id: 1, nickname: 'testuser', role: 'USER' },
    isAuthenticated: true,
    isLoading: false,
    logout: mockLogout,
  }),
}));

jest.mock('@/hooks/usePoints', () => ({
  usePointBalance: () => ({
    data: mockPointBalance,
  }),
}));

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the logo', () => {
    render(<Header />);
    expect(screen.getByText('Point Roulette')).toBeInTheDocument();
  });

  it('displays user nickname when authenticated', () => {
    render(<Header />);
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('displays point balance when authenticated', () => {
    render(<Header />);
    expect(screen.getByText('700P')).toBeInTheDocument();
  });

  it('shows logout button when authenticated', () => {
    render(<Header />);
    expect(screen.getByText('로그아웃')).toBeInTheDocument();
  });

  it('calls logout when logout button is clicked', async () => {
    mockLogout.mockResolvedValue(undefined);
    render(<Header />);
    
    const logoutButton = screen.getByText('로그아웃');
    fireEvent.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalled();
  });
});
