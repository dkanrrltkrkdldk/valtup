import { render, screen, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/login/page';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
  }),
  usePathname: () => '/login',
}));

jest.mock('@/lib/auth', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: jest.fn().mockResolvedValue({ id: 1, nickname: 'testuser', role: 'USER' }),
    logout: jest.fn(),
    refetch: jest.fn(),
  }),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders login form', () => {
    render(<LoginPage />);

    expect(screen.getByText('Point Roulette')).toBeInTheDocument();
    expect(screen.getByLabelText('닉네임')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '시작하기' })).toBeInTheDocument();
  });

  it('shows validation error for short nickname', async () => {
    render(<LoginPage />);

    const input = screen.getByLabelText('닉네임');
    await userEvent.type(input, 'ab');
    await userEvent.click(screen.getByRole('button', { name: '시작하기' }));

    expect(screen.getByText('닉네임은 3-30자 사이여야 합니다.')).toBeInTheDocument();
  });

  it('shows validation error for long nickname', async () => {
    render(<LoginPage />);

    const input = screen.getByLabelText('닉네임');
    await userEvent.type(input, 'a'.repeat(31));
    await userEvent.click(screen.getByRole('button', { name: '시작하기' }));

    expect(screen.getByText('닉네임은 3-30자 사이여야 합니다.')).toBeInTheDocument();
  });

  it('submits form with valid nickname', async () => {
    render(<LoginPage />);

    const input = screen.getByLabelText('닉네임');
    await userEvent.type(input, 'testuser');
    await userEvent.click(screen.getByRole('button', { name: '시작하기' }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('displays helper text', () => {
    render(<LoginPage />);
    expect(
      screen.getByText('처음 방문하시면 자동으로 계정이 생성됩니다.')
    ).toBeInTheDocument();
  });
});
