import type {
  User,
  Point,
  PointBalance,
  ExpiringPoints,
  RouletteStatus,
  SpinResult,
  Product,
  Order,
  PageResponse,
} from '@/types/api';

export const mockUser: User = {
  id: 1,
  nickname: 'testuser',
  role: 'USER',
  createdAt: '2025-01-30T10:00:00',
};

export const mockAdminUser: User = {
  id: 2,
  nickname: 'admin_test',
  role: 'ADMIN',
  createdAt: '2025-01-30T10:00:00',
};

export const mockPoint: Point = {
  id: 1,
  amount: 500,
  usedAmount: 100,
  availableAmount: 400,
  earnedAt: '2025-01-30T10:00:00',
  expiresAt: '2025-03-01T10:00:00',
  expired: false,
};

export const mockExpiringPoint: Point = {
  id: 2,
  amount: 300,
  usedAmount: 0,
  availableAmount: 300,
  earnedAt: '2025-01-25T10:00:00',
  expiresAt: '2025-02-02T10:00:00',
  expired: false,
};

export const mockExpiredPoint: Point = {
  id: 3,
  amount: 200,
  usedAmount: 200,
  availableAmount: 0,
  earnedAt: '2024-12-01T10:00:00',
  expiresAt: '2024-12-31T10:00:00',
  expired: true,
};

export const mockPointBalance: PointBalance = {
  totalBalance: 700,
  expiringIn7Days: 300,
};

export const mockExpiringPoints: ExpiringPoints = {
  points: [mockExpiringPoint],
  totalAmount: 300,
};

export const mockRouletteStatus: RouletteStatus = {
  hasParticipatedToday: false,
  remainingBudget: 50000,
  canParticipate: true,
};

export const mockRouletteStatusParticipated: RouletteStatus = {
  hasParticipatedToday: true,
  remainingBudget: 49500,
  canParticipate: false,
};

export const mockRouletteStatusBudgetExhausted: RouletteStatus = {
  hasParticipatedToday: false,
  remainingBudget: 0,
  canParticipate: false,
};

export const mockSpinResultWin: SpinResult = {
  pointAmount: 500,
  isWin: true,
  message: '축하합니다!',
};

export const mockSpinResultLose: SpinResult = {
  pointAmount: 0,
  isWin: false,
  message: '예산이 소진되었습니다.',
};

export const mockProduct: Product = {
  id: 1,
  name: '테스트 상품',
  description: '테스트 상품 설명입니다.',
  price: 1000,
  stock: 10,
  imageUrl: null,
};

export const mockProductOutOfStock: Product = {
  id: 2,
  name: '품절 상품',
  description: '품절된 상품입니다.',
  price: 500,
  stock: 0,
  imageUrl: null,
};

export const mockOrder: Order = {
  id: 1,
  productId: 1,
  productName: '테스트 상품',
  quantity: 2,
  totalPrice: 2000,
  status: 'COMPLETED',
  createdAt: '2025-01-30T10:00:00',
  cancelledAt: null,
};

export const mockOrderCancelled: Order = {
  id: 2,
  productId: 1,
  productName: '취소된 상품',
  quantity: 1,
  totalPrice: 1000,
  status: 'CANCELLED',
  createdAt: '2025-01-29T10:00:00',
  cancelledAt: '2025-01-30T10:00:00',
};

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
