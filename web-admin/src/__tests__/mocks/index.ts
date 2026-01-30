import type {
  User,
  BudgetResponse,
  DashboardResponse,
  AdminProductResponse,
  AdminOrderResponse,
  RouletteParticipationResponse,
  PageResponse,
} from '@/types/api';

// Mock Admin User
export const mockAdminUser: User = {
  id: 1,
  nickname: 'admin_test',
  role: 'ADMIN',
  createdAt: '2024-01-01T00:00:00Z',
};

// Mock Regular User
export const mockRegularUser: User = {
  id: 2,
  nickname: 'regular_user',
  role: 'USER',
  createdAt: '2024-01-01T00:00:00Z',
};

// Mock Dashboard Stats
export const mockDashboardStats: DashboardResponse = {
  todayParticipants: 150,
  todayPointsGiven: 45000,
};

// Mock Budget Config
export const mockBudgetConfig: BudgetResponse = {
  date: '2024-01-15',
  totalBudget: 100000,
  usedBudget: 45000,
  remainingBudget: 55000,
};

// Mock Products
export const mockProduct: AdminProductResponse = {
  id: 1,
  name: '기프티콘 5000원',
  description: '편의점 5000원 상품권',
  price: 5000,
  stock: 100,
  imageUrl: 'https://example.com/image.png',
  deletedAt: null,
  createdAt: '2024-01-01T00:00:00Z',
};

export const mockProducts: AdminProductResponse[] = [
  mockProduct,
  {
    id: 2,
    name: '기프티콘 10000원',
    description: '편의점 10000원 상품권',
    price: 10000,
    stock: 50,
    imageUrl: null,
    deletedAt: null,
    createdAt: '2024-01-02T00:00:00Z',
  },
  {
    id: 3,
    name: '기프티콘 20000원',
    description: null,
    price: 20000,
    stock: 25,
    imageUrl: null,
    deletedAt: '2024-01-10T00:00:00Z',
    createdAt: '2024-01-03T00:00:00Z',
  },
];

// Mock Orders
export const mockOrder: AdminOrderResponse = {
  id: 1,
  userId: 2,
  userNickname: 'test_user',
  productId: 1,
  productName: '기프티콘 5000원',
  quantity: 1,
  totalPrice: 5000,
  status: 'COMPLETED',
  createdAt: '2024-01-15T10:00:00Z',
  cancelledAt: null,
};

export const mockOrders: AdminOrderResponse[] = [
  mockOrder,
  {
    id: 2,
    userId: 3,
    userNickname: 'another_user',
    productId: 2,
    productName: '기프티콘 10000원',
    quantity: 2,
    totalPrice: 20000,
    status: 'CANCELLED',
    createdAt: '2024-01-15T11:00:00Z',
    cancelledAt: '2024-01-15T12:00:00Z',
  },
];

// Mock Roulette Participations
export const mockRouletteParticipation: RouletteParticipationResponse = {
  id: 1,
  userId: 2,
  userNickname: 'test_user',
  date: '2024-01-15',
  pointAmount: 500,
  createdAt: '2024-01-15T10:00:00Z',
  cancelledAt: null,
};

export const mockRouletteParticipations: RouletteParticipationResponse[] = [
  mockRouletteParticipation,
  {
    id: 2,
    userId: 3,
    userNickname: 'another_user',
    date: '2024-01-15',
    pointAmount: 300,
    createdAt: '2024-01-15T11:00:00Z',
    cancelledAt: '2024-01-15T12:00:00Z',
  },
  {
    id: 3,
    userId: 4,
    userNickname: 'third_user',
    date: '2024-01-15',
    pointAmount: 800,
    createdAt: '2024-01-15T14:00:00Z',
    cancelledAt: null,
  },
];

// Helper to create paginated response
export function createPageResponse<T>(
  content: T[],
  page = 0,
  size = 10
): PageResponse<T> {
  return {
    content,
    page,
    size,
    totalElements: content.length,
    totalPages: Math.ceil(content.length / size),
    first: page === 0,
    last: page >= Math.ceil(content.length / size) - 1,
  };
}
