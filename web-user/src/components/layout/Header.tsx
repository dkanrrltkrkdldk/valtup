'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { usePointBalance } from '@/hooks/usePoints';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { data: balance } = usePointBalance();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-indigo-600">
            Point Roulette
          </Link>

          {isAuthenticated && (
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-gray-500">보유 포인트</span>
                <span className="ml-2 font-semibold text-indigo-600">
                  {balance?.totalBalance?.toLocaleString() ?? 0}P
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {user?.nickname}
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
