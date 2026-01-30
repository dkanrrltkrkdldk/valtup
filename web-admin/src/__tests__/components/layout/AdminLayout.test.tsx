import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/__tests__/test-utils';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { mockAdminUser, mockRegularUser } from '@/__tests__/mocks';

// Mock the auth module
const mockNavigate = vi.fn();
const mockLogout = vi.fn().mockResolvedValue(undefined);

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Outlet: () => <div data-testid="outlet">Page Content</div>,
  };
});

vi.mock('@/lib/auth', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '@/lib/auth';

describe('AdminLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading screen when loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      isAdmin: false,
      login: vi.fn(),
      logout: mockLogout,
      refetch: vi.fn(),
    });

    render(<AdminLayout />);
    expect(document.querySelector('svg.animate-spin')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      isAdmin: false,
      login: vi.fn(),
      logout: mockLogout,
      refetch: vi.fn(),
    });

    render(<AdminLayout />);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('shows access denied for non-admin users', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: mockRegularUser,
      isLoading: false,
      isAuthenticated: true,
      isAdmin: false,
      login: vi.fn(),
      logout: mockLogout,
      refetch: vi.fn(),
    });

    render(<AdminLayout />);
    expect(screen.getByText('접근 권한 없음')).toBeInTheDocument();
    expect(screen.getByText('관리자 계정으로 로그인해주세요.')).toBeInTheDocument();
  });

  it('renders layout for admin users', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: mockAdminUser,
      isLoading: false,
      isAuthenticated: true,
      isAdmin: true,
      login: vi.fn(),
      logout: mockLogout,
      refetch: vi.fn(),
    });

    render(<AdminLayout />);
    expect(screen.getByText('Point Roulette')).toBeInTheDocument();
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });

  it('displays user nickname in header', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: mockAdminUser,
      isLoading: false,
      isAuthenticated: true,
      isAdmin: true,
      login: vi.fn(),
      logout: mockLogout,
      refetch: vi.fn(),
    });

    render(<AdminLayout />);
    expect(screen.getByText('admin_test')).toBeInTheDocument();
  });

  it('renders logout button', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: mockAdminUser,
      isLoading: false,
      isAuthenticated: true,
      isAdmin: true,
      login: vi.fn(),
      logout: mockLogout,
      refetch: vi.fn(),
    });

    render(<AdminLayout />);
    expect(screen.getByText('로그아웃')).toBeInTheDocument();
  });

  it('calls logout and navigates on logout click', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: mockAdminUser,
      isLoading: false,
      isAuthenticated: true,
      isAdmin: true,
      login: vi.fn(),
      logout: mockLogout,
      refetch: vi.fn(),
    });

    render(<AdminLayout />);
    fireEvent.click(screen.getByText('로그아웃'));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  it('handles login page redirect for non-admin', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: mockRegularUser,
      isLoading: false,
      isAuthenticated: true,
      isAdmin: false,
      login: vi.fn(),
      logout: mockLogout,
      refetch: vi.fn(),
    });

    render(<AdminLayout />);
    fireEvent.click(screen.getByText('로그인 페이지로 이동'));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  it('returns null when not authenticated and not loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      isAdmin: false,
      login: vi.fn(),
      logout: mockLogout,
      refetch: vi.fn(),
    });

    const { container } = render(<AdminLayout />);
    // After redirect, returns null
    expect(container.firstChild).toBeNull();
  });
});
