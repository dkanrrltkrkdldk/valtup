export interface User {
  id: number;
  nickname: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface LoginRequest {
  nickname: string;
}

export interface Point {
  id: number;
  amount: number;
  usedAmount: number;
  availableAmount: number;
  earnedAt: string;
  expiresAt: string;
  expired: boolean;
}

export interface PointBalance {
  totalBalance: number;
  expiringIn7Days: number;
}

export interface ExpiringPoints {
  points: Point[];
  totalAmount: number;
}

export interface RouletteStatus {
  hasParticipatedToday: boolean;
  remainingBudget: number;
  canParticipate: boolean;
}

export interface SpinResult {
  pointAmount: number;
  isWin: boolean;
  message: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string | null;
}

export interface Order {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  totalPrice: number;
  status: 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  cancelledAt: string | null;
}

export interface CreateOrderRequest {
  productId: number;
  quantity: number;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ErrorResponse {
  code: string;
  message: string;
  timestamp: string;
}
