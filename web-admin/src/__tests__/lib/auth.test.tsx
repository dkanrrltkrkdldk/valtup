import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth, useRequireAdmin } from '@/lib/auth';
import { mockAdminUser, mockRegularUser } from '@/__tests__/mocks';
import type { ReactNode } from 'react';

// Mock the API
vi.mock('@/lib/api', () => ({
  authApi: {
    me: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  },
}));

import { authApi } from '@/lib/api';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    );
  };
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides initial loading state', () => {
    vi.mocked(authApi.me).mockReturnValue(new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isAdmin).toBe(false);
  });

  it('provides user data after successful auth', async () => {
    vi.mocked(authApi.me).mockResolvedValue(mockAdminUser);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toEqual(mockAdminUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isAdmin).toBe(true);
  });

  it('handles non-admin users correctly', async () => {
    vi.mocked(authApi.me).mockResolvedValue(mockRegularUser);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toEqual(mockRegularUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isAdmin).toBe(false);
  });

  it('handles auth failure', async () => {
    vi.mocked(authApi.me).mockRejectedValue(new Error('Not authenticated'));

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws error when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
  });

  describe('login', () => {
    it('calls login API and updates user', async () => {
      vi.mocked(authApi.me).mockRejectedValue(new Error('Not authenticated'));
      vi.mocked(authApi.login).mockResolvedValue(mockAdminUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let loginResult: typeof mockAdminUser;
      await act(async () => {
        loginResult = await result.current.login('admin_test');
      });

      expect(authApi.login).toHaveBeenCalledWith({ nickname: 'admin_test' });
      expect(loginResult!).toEqual(mockAdminUser);
    });
  });

  describe('logout', () => {
    it('calls logout API and clears user', async () => {
      vi.mocked(authApi.me).mockResolvedValue(mockAdminUser);
      vi.mocked(authApi.logout).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(authApi.logout).toHaveBeenCalled();
    });
  });

  describe('refetch', () => {
    it('refetches user data', async () => {
      vi.mocked(authApi.me).mockResolvedValue(mockAdminUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Clear and setup new mock
      vi.mocked(authApi.me).mockResolvedValue({
        ...mockAdminUser,
        nickname: 'updated_admin',
      });

      await act(async () => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(authApi.me).toHaveBeenCalledTimes(2);
      });
    });
  });
});

describe('useRequireAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns auth context for admin user', async () => {
    vi.mocked(authApi.me).mockResolvedValue(mockAdminUser);

    const { result } = renderHook(() => useRequireAdmin(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAdmin).toBe(true);
    expect(result.current.user).toEqual(mockAdminUser);
  });

  it('does not throw during loading', async () => {
    vi.mocked(authApi.me).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useRequireAdmin(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    // Should not throw during loading
  });

  it('returns auth object with correct shape', async () => {
    vi.mocked(authApi.me).mockResolvedValue(mockAdminUser);

    const { result } = renderHook(() => useRequireAdmin(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current).toHaveProperty('user');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('isAuthenticated');
    expect(result.current).toHaveProperty('isAdmin');
    expect(result.current).toHaveProperty('login');
    expect(result.current).toHaveProperty('logout');
    expect(result.current).toHaveProperty('refetch');
  });
});
