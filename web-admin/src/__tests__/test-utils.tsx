import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';
import type { User } from '@/types/api';

// Create a test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

// Mock auth context value type
interface MockAuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (nickname: string) => Promise<User>;
  logout: () => Promise<void>;
  refetch: () => void;
}

// Default mock auth values
const defaultMockAuth: MockAuthContextType = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  isAdmin: false,
  login: vi.fn(),
  logout: vi.fn(),
  refetch: vi.fn(),
};

interface WrapperProps {
  children: ReactNode;
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
  authValue?: Partial<MockAuthContextType>;
}

// Create wrapper with all providers
function createWrapper(options: CustomRenderOptions = {}) {
  const { initialEntries = ['/'], authValue } = options;
  const queryClient = createTestQueryClient();
  const mockAuth = { ...defaultMockAuth, ...authValue };

  return function Wrapper({ children }: WrapperProps) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          {children}
        </MemoryRouter>
      </QueryClientProvider>
    );
  };
}

// Custom render function
const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { initialEntries, authValue, ...renderOptions } = options;
  return render(ui, {
    wrapper: createWrapper({ initialEntries, authValue }),
    ...renderOptions,
  });
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render, createTestQueryClient };
export type { MockAuthContextType, CustomRenderOptions };
