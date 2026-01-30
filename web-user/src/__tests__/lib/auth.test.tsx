import { render, screen, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/lib/auth';
import { authApi } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  authApi: {
    me: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
  },
  ApiError: class ApiError extends Error {
    constructor(public code: string, message: string, public status: number) {
      super(message);
    }
  },
}));

const mockedAuthApi = authApi as jest.Mocked<typeof authApi>;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}

function TestComponent() {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="loading">{auth.isLoading.toString()}</div>
      <div data-testid="authenticated">{auth.isAuthenticated.toString()}</div>
      <div data-testid="user">{auth.user?.nickname ?? 'null'}</div>
      <button onClick={() => auth.login('testuser')}>Login</button>
      <button onClick={() => auth.logout()}>Logout</button>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides initial loading state', async () => {
    mockedAuthApi.me.mockImplementation(() => new Promise(() => {}));

    render(<TestComponent />, { wrapper: createWrapper() });

    expect(screen.getByTestId('loading').textContent).toBe('true');
  });

  it('provides user when authenticated', async () => {
    const mockUser = { id: 1, nickname: 'testuser', role: 'USER' as const, createdAt: '2025-01-30' };
    mockedAuthApi.me.mockResolvedValue(mockUser);

    render(<TestComponent />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
      expect(screen.getByTestId('user').textContent).toBe('testuser');
    });
  });

  it('provides not authenticated when no user', async () => {
    mockedAuthApi.me.mockRejectedValue(new Error('Not authenticated'));

    render(<TestComponent />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
      expect(screen.getByTestId('authenticated').textContent).toBe('false');
    });
  });
});

describe('useAuth - without provider', () => {
  it('throws error when used outside AuthProvider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleError.mockRestore();
  });
});
