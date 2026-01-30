export interface User {
  id: number;
  nickname: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface LoginRequest {
  nickname: string;
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

export interface BudgetResponse {
  date: string;
  totalBudget: number;
  usedBudget: number;
  remainingBudget: number;
}

export interface DashboardResponse {
  todayParticipants: number;
  todayPointsGiven: number;
}

export interface AdminProductResponse {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  deletedAt: string | null;
  createdAt: string;
}

export interface AdminOrderResponse {
  id: number;
  userId: number;
  userNickname: string;
  productId: number;
  productName: string;
  quantity: number;
  totalPrice: number;
  status: 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  cancelledAt: string | null;
}

export interface RouletteParticipationResponse {
  id: number;
  userId: number;
  userNickname: string;
  date: string;
  pointAmount: number;
  createdAt: string;
  cancelledAt: string | null;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

export interface UpdateProductRequest {
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

export interface UpdateBudgetRequest {
  totalBudget: number;
}
