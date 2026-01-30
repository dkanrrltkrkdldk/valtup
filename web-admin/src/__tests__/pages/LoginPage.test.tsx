import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/__tests__/test-utils';
import { LoginPage } from '@/pages/LoginPage';
import { mockAdminUser, mockRegularUser } from '@/__tests__/mocks';

// Mock navigate
const mockNavigate = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock useAuth
const mockLogin = vi.fn();

vi.mock('@/lib/auth', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form', () => {
    render(<LoginPage />);
    
    expect(screen.getByText('Point Roulette')).toBeInTheDocument();
    expect(screen.getByText('관리자 로그인')).toBeInTheDocument();
    expect(screen.getByLabelText('관리자 닉네임')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /로그인/i })).toBeInTheDocument();
  });

  it('renders placeholder text', () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText('admin_으로 시작하는 닉네임 입력')).toBeInTheDocument();
  });

  it('renders helper text', () => {
    render(<LoginPage />);
    expect(screen.getByText('관리자 계정은 admin_으로 시작하는 닉네임입니다.')).toBeInTheDocument();
  });

  it('shows error when submitting empty nickname', async () => {
    render(<LoginPage />);
    
    fireEvent.click(screen.getByRole('button', { name: /로그인/i }));
    
    expect(screen.getByText('닉네임을 입력해주세요.')).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('shows error when submitting whitespace-only nickname', async () => {
    render(<LoginPage />);
    
    fireEvent.change(screen.getByLabelText('관리자 닉네임'), { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: /로그인/i }));
    
    expect(screen.getByText('닉네임을 입력해주세요.')).toBeInTheDocument();
  });

  it('calls login with trimmed nickname', async () => {
    mockLogin.mockResolvedValue(mockAdminUser);
    render(<LoginPage />);
    
    fireEvent.change(screen.getByLabelText('관리자 닉네임'), { target: { value: '  admin_test  ' } });
    fireEvent.click(screen.getByRole('button', { name: /로그인/i }));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin_test');
    });
  });

  it('navigates to home on successful admin login', async () => {
    mockLogin.mockResolvedValue(mockAdminUser);
    render(<LoginPage />);
    
    fireEvent.change(screen.getByLabelText('관리자 닉네임'), { target: { value: 'admin_test' } });
    fireEvent.click(screen.getByRole('button', { name: /로그인/i }));
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('shows error for non-admin user login', async () => {
    mockLogin.mockResolvedValue(mockRegularUser);
    render(<LoginPage />);
    
    fireEvent.change(screen.getByLabelText('관리자 닉네임'), { target: { value: 'regular_user' } });
    fireEvent.click(screen.getByRole('button', { name: /로그인/i }));
    
    await waitFor(() => {
      expect(screen.getByText('관리자 계정으로만 로그인할 수 있습니다.')).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows error on login failure', async () => {
    mockLogin.mockRejectedValue(new Error('Login failed'));
    render(<LoginPage />);
    
    fireEvent.change(screen.getByLabelText('관리자 닉네임'), { target: { value: 'admin_test' } });
    fireEvent.click(screen.getByRole('button', { name: /로그인/i }));
    
    await waitFor(() => {
      expect(screen.getByText('로그인에 실패했습니다. 다시 시도해주세요.')).toBeInTheDocument();
    });
  });

  it('shows loading state during login', async () => {
    mockLogin.mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<LoginPage />);
    
    fireEvent.change(screen.getByLabelText('관리자 닉네임'), { target: { value: 'admin_test' } });
    fireEvent.click(screen.getByRole('button', { name: /로그인/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  it('disables input during loading', async () => {
    mockLogin.mockImplementation(() => new Promise(() => {}));
    render(<LoginPage />);
    
    fireEvent.change(screen.getByLabelText('관리자 닉네임'), { target: { value: 'admin_test' } });
    fireEvent.click(screen.getByRole('button', { name: /로그인/i }));
    
    await waitFor(() => {
      expect(screen.getByLabelText('관리자 닉네임')).toBeDisabled();
    });
  });

  it('clears error when typing new value', async () => {
    render(<LoginPage />);
    
    // Submit empty to get error
    fireEvent.click(screen.getByRole('button', { name: /로그인/i }));
    expect(screen.getByText('닉네임을 입력해주세요.')).toBeInTheDocument();
    
    // Type something - error should clear on form resubmit
    fireEvent.change(screen.getByLabelText('관리자 닉네임'), { target: { value: 'a' } });
    mockLogin.mockResolvedValue(mockAdminUser);
    fireEvent.click(screen.getByRole('button', { name: /로그인/i }));
    
    await waitFor(() => {
      expect(screen.queryByText('닉네임을 입력해주세요.')).not.toBeInTheDocument();
    });
  });
});
