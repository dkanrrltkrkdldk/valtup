import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@/__tests__/test-utils';
import { OrdersPage } from '@/pages/OrdersPage';
import { adminApi } from '@/lib/api';
import { mockOrders, createPageResponse } from '@/__tests__/mocks';

vi.mock('@/lib/api', () => ({
  adminApi: {
    getOrders: vi.fn(),
    cancelOrder: vi.fn(),
  },
}));

describe('OrdersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page title', async () => {
    vi.mocked(adminApi.getOrders).mockResolvedValue(createPageResponse(mockOrders));

    render(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('주문 내역');
    });
  });

  it('displays loading state', () => {
    vi.mocked(adminApi.getOrders).mockReturnValue(new Promise(() => {}));

    render(<OrdersPage />);

    expect(document.querySelector('.animate-spin')).toBeTruthy();
  });

  it('renders orders table with correct columns', async () => {
    vi.mocked(adminApi.getOrders).mockResolvedValue(createPageResponse(mockOrders));

    render(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('주문번호')).toBeInTheDocument();
      expect(screen.getByText('사용자')).toBeInTheDocument();
      expect(screen.getByText('상품')).toBeInTheDocument();
      expect(screen.getByText('수량')).toBeInTheDocument();
      expect(screen.getByText('금액')).toBeInTheDocument();
      expect(screen.getByText('상태')).toBeInTheDocument();
      expect(screen.getByText('주문일')).toBeInTheDocument();
      expect(screen.getByText('액션')).toBeInTheDocument();
    });
  });

  it('displays order data correctly', async () => {
    vi.mocked(adminApi.getOrders).mockResolvedValue(createPageResponse(mockOrders));

    render(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText('test_user')).toBeInTheDocument();
      expect(screen.getByText('기프티콘 5000원')).toBeInTheDocument();
      expect(screen.getByText('5,000P')).toBeInTheDocument();
    });
  });

  it('shows correct status badge for completed order', async () => {
    vi.mocked(adminApi.getOrders).mockResolvedValue(createPageResponse([mockOrders[0]]));

    render(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('완료')).toBeInTheDocument();
    });
  });

  it('shows correct status badge for cancelled order', async () => {
    vi.mocked(adminApi.getOrders).mockResolvedValue(createPageResponse([mockOrders[1]]));

    render(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('취소됨')).toBeInTheDocument();
    });
  });

  it('shows cancel button only for completed orders', async () => {
    vi.mocked(adminApi.getOrders).mockResolvedValue(createPageResponse(mockOrders));

    render(<OrdersPage />);

    await waitFor(() => {
      const cancelButtons = screen.getAllByRole('button', { name: '취소' });
      expect(cancelButtons.length).toBe(1);
    });
  });

  it('opens cancel confirmation modal', async () => {
    vi.mocked(adminApi.getOrders).mockResolvedValue(createPageResponse([mockOrders[0]]));

    render(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '취소' }));

    await waitFor(() => {
      expect(screen.getByText(/주문 #1.*취소하시겠습니까/)).toBeInTheDocument();
    });
  });

  it('renders cancel confirmation modal with correct buttons', async () => {
    vi.mocked(adminApi.getOrders).mockResolvedValue(createPageResponse([mockOrders[0]]));

    render(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '취소' }));

    await waitFor(() => {
      expect(screen.getByText(/주문 #1.*취소하시겠습니까/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '취소하기' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
    });
  });

  it('pagination buttons work correctly', async () => {
    const paginatedResponse = {
      content: mockOrders,
      page: 0,
      size: 10,
      totalElements: 20,
      totalPages: 2,
      first: true,
      last: false,
    };
    vi.mocked(adminApi.getOrders).mockResolvedValue(paginatedResponse);

    render(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('1 / 2')).toBeInTheDocument();
    });

    const prevButton = screen.getByRole('button', { name: '이전' });
    const nextButton = screen.getByRole('button', { name: '다음' });

    expect(prevButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();
  });

  it('displays empty state when no orders', async () => {
    vi.mocked(adminApi.getOrders).mockResolvedValue(createPageResponse([]));

    render(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('주문 내역이 없습니다.')).toBeInTheDocument();
    });
  });

  it('displays error state when API fails', async () => {
    vi.mocked(adminApi.getOrders).mockRejectedValue(new Error('API Error'));

    render(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('데이터를 불러오는 중 오류가 발생했습니다.')).toBeInTheDocument();
    });
  });

  it('closes cancel modal when close button clicked', async () => {
    vi.mocked(adminApi.getOrders).mockResolvedValue(createPageResponse([mockOrders[0]]));

    render(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '취소' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '닫기' }));

    await waitFor(() => {
      expect(screen.queryByText(/취소하시겠습니까/)).not.toBeInTheDocument();
    });
  });

  it('navigates to next page when next button clicked', async () => {
    const page1Response = {
      content: mockOrders,
      page: 0,
      size: 2,
      totalElements: 4,
      totalPages: 2,
      first: true,
      last: false,
    };
    const page2Response = {
      content: mockOrders,
      page: 1,
      size: 2,
      totalElements: 4,
      totalPages: 2,
      first: false,
      last: true,
    };
    vi.mocked(adminApi.getOrders)
      .mockResolvedValueOnce(page1Response)
      .mockResolvedValueOnce(page2Response);

    render(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('1 / 2')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '다음' }));

    await waitFor(() => {
      expect(screen.getByText('2 / 2')).toBeInTheDocument();
    });
  });

  it('displays datetime in correct Korean format', async () => {
    vi.mocked(adminApi.getOrders).mockResolvedValue(createPageResponse([mockOrders[0]]));

    render(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText(/2024/)).toBeInTheDocument();
    });
  });
});
