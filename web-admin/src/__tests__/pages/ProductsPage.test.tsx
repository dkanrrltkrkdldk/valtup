import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@/__tests__/test-utils';
import { ProductsPage } from '@/pages/ProductsPage';
import { adminApi } from '@/lib/api';
import { mockProducts, createPageResponse } from '@/__tests__/mocks';

vi.mock('@/lib/api', () => ({
  adminApi: {
    getProducts: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
  },
}));

describe('ProductsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page title', async () => {
    vi.mocked(adminApi.getProducts).mockResolvedValue(createPageResponse(mockProducts));

    render(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('상품 관리');
    });
  });

  it('displays loading state', () => {
    vi.mocked(adminApi.getProducts).mockReturnValue(new Promise(() => {}));

    render(<ProductsPage />);

    expect(document.querySelector('.animate-spin')).toBeTruthy();
  });

  it('renders products table with correct columns', async () => {
    vi.mocked(adminApi.getProducts).mockResolvedValue(createPageResponse(mockProducts));

    render(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('이름')).toBeInTheDocument();
      expect(screen.getByText('가격')).toBeInTheDocument();
      expect(screen.getByText('재고')).toBeInTheDocument();
      expect(screen.getByText('상태')).toBeInTheDocument();
      expect(screen.getByText('등록일')).toBeInTheDocument();
      expect(screen.getByText('액션')).toBeInTheDocument();
    });
  });

  it('displays product data correctly', async () => {
    vi.mocked(adminApi.getProducts).mockResolvedValue(createPageResponse(mockProducts));

    render(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('기프티콘 5000원')).toBeInTheDocument();
      expect(screen.getByText('5,000P')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });

  it('shows correct status badge for active product', async () => {
    vi.mocked(adminApi.getProducts).mockResolvedValue(createPageResponse([mockProducts[0]]));

    render(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('판매중')).toBeInTheDocument();
    });
  });

  it('shows correct status badge for deleted product', async () => {
    vi.mocked(adminApi.getProducts).mockResolvedValue(createPageResponse([mockProducts[2]]));

    render(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('삭제됨')).toBeInTheDocument();
    });
  });

  it('opens create modal on button click', async () => {
    vi.mocked(adminApi.getProducts).mockResolvedValue(createPageResponse(mockProducts));

    render(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('상품 등록')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '상품 등록' }));

    await waitFor(() => {
      expect(screen.getByText('상품명')).toBeInTheDocument();
    });
  });

  it('opens edit modal with prefilled data', async () => {
    vi.mocked(adminApi.getProducts).mockResolvedValue(createPageResponse([mockProducts[0]]));

    render(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('수정')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '수정' }));

    await waitFor(() => {
      expect(screen.getByDisplayValue('기프티콘 5000원')).toBeInTheDocument();
    });
  });

  it('opens delete confirmation modal', async () => {
    vi.mocked(adminApi.getProducts).mockResolvedValue(createPageResponse([mockProducts[0]]));

    render(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '삭제' }));

    await waitFor(() => {
      expect(screen.getByText(/정말.*삭제하시겠습니까/)).toBeInTheDocument();
    });
  });

  it('renders create form in modal with all required fields', async () => {
    vi.mocked(adminApi.getProducts).mockResolvedValue(createPageResponse(mockProducts));

    render(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '상품 등록' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '상품 등록' }));

    await waitFor(() => {
      expect(screen.getByLabelText('상품명')).toBeInTheDocument();
      expect(screen.getByLabelText('설명')).toBeInTheDocument();
      expect(screen.getByLabelText('가격 (P)')).toBeInTheDocument();
      expect(screen.getByLabelText('재고')).toBeInTheDocument();
      expect(screen.getByLabelText('이미지 URL')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '등록' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
    });
  });

  it('renders delete confirmation in modal', async () => {
    vi.mocked(adminApi.getProducts).mockResolvedValue(createPageResponse([mockProducts[0]]));

    render(<ProductsPage />);

    const tableDeleteButton = await screen.findByRole('button', { name: '삭제' });
    fireEvent.click(tableDeleteButton);

    await waitFor(() => {
      expect(screen.getByText(/정말/)).toBeInTheDocument();
      expect(screen.getByText(/삭제하시겠습니까/)).toBeInTheDocument();
    });
  });

  it('pagination buttons work correctly', async () => {
    const paginatedResponse = {
      content: mockProducts.slice(0, 2),
      page: 0,
      size: 10,
      totalElements: 20,
      totalPages: 2,
      first: true,
      last: false,
    };
    vi.mocked(adminApi.getProducts).mockResolvedValue(paginatedResponse);

    render(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('1 / 2')).toBeInTheDocument();
    });

    const prevButton = screen.getByRole('button', { name: '이전' });
    const nextButton = screen.getByRole('button', { name: '다음' });

    expect(prevButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();
  });

  it('displays empty state when no products', async () => {
    vi.mocked(adminApi.getProducts).mockResolvedValue(createPageResponse([]));

    render(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('등록된 상품이 없습니다.')).toBeInTheDocument();
    });
  });

  it('displays error state when API fails', async () => {
    vi.mocked(adminApi.getProducts).mockRejectedValue(new Error('API Error'));

    render(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('데이터를 불러오는 중 오류가 발생했습니다.')).toBeInTheDocument();
    });
  });

  it('closes create modal when cancel is clicked', async () => {
    vi.mocked(adminApi.getProducts).mockResolvedValue(createPageResponse(mockProducts));

    render(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '상품 등록' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '상품 등록' }));

    await waitFor(() => {
      expect(screen.getByLabelText('상품명')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '취소' }));

    await waitFor(() => {
      expect(screen.queryByLabelText('상품명')).not.toBeInTheDocument();
    });
  });

  it('updates form fields in create modal', async () => {
    vi.mocked(adminApi.getProducts).mockResolvedValue(createPageResponse(mockProducts));

    render(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '상품 등록' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '상품 등록' }));

    await waitFor(() => {
      expect(screen.getByLabelText('상품명')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('상품명'), { target: { value: 'Test Product' } });
    fireEvent.change(screen.getByLabelText('설명'), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText('가격 (P)'), { target: { value: '5000' } });
    fireEvent.change(screen.getByLabelText('재고'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('이미지 URL'), { target: { value: 'http://test.com/img.png' } });

    expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('5000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    expect(screen.getByDisplayValue('http://test.com/img.png')).toBeInTheDocument();
  });

  it('shows edit modal with product description when available', async () => {
    vi.mocked(adminApi.getProducts).mockResolvedValue(createPageResponse([mockProducts[0]]));

    render(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '수정' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '수정' }));

    await waitFor(() => {
      expect(screen.getByDisplayValue('편의점 5000원 상품권')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://example.com/image.png')).toBeInTheDocument();
    });
  });

  it('navigates to next page when next button clicked', async () => {
    const page1Response = {
      content: mockProducts.slice(0, 2),
      page: 0,
      size: 2,
      totalElements: 4,
      totalPages: 2,
      first: true,
      last: false,
    };
    const page2Response = {
      content: mockProducts.slice(2, 3),
      page: 1,
      size: 2,
      totalElements: 4,
      totalPages: 2,
      first: false,
      last: true,
    };
    vi.mocked(adminApi.getProducts)
      .mockResolvedValueOnce(page1Response)
      .mockResolvedValueOnce(page2Response);

    render(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('1 / 2')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '다음' }));

    await waitFor(() => {
      expect(screen.getByText('2 / 2')).toBeInTheDocument();
    });
  });

  it('closes edit modal when cancel is clicked', async () => {
    vi.mocked(adminApi.getProducts).mockResolvedValue(createPageResponse([mockProducts[0]]));

    render(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '수정' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '수정' }));

    await waitFor(() => {
      expect(screen.getByDisplayValue('기프티콘 5000원')).toBeInTheDocument();
    });

    const cancelButtons = screen.getAllByRole('button', { name: '취소' });
    fireEvent.click(cancelButtons[cancelButtons.length - 1]);

    await waitFor(() => {
      expect(screen.queryByDisplayValue('기프티콘 5000원')).not.toBeInTheDocument();
    });
  });
});
