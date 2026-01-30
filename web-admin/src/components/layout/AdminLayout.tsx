import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { useAuth } from '@/lib/auth';
import { Sidebar } from './Sidebar';
import { LoadingScreen } from '@/components/ui';

export function AdminLayout() {
  const { user, isLoading, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoadingScreen />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">접근 권한 없음</h1>
          <p className="text-gray-600 mb-4">관리자 계정으로 로그인해주세요.</p>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="text-indigo-600 hover:text-indigo-700"
          >
            로그인 페이지로 이동
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex justify-between items-center px-8 py-4">
            <div />
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.nickname}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                로그아웃
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
