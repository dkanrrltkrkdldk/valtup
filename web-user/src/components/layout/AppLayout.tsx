'use client';

import { useAuth } from '@/lib/auth';
import { Header } from './Header';
import { Navigation } from './Navigation';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface AppLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function AppLayout({ children, requireAuth = true }: AppLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated && pathname !== '/login') {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, requireAuth, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (requireAuth && !isAuthenticated && pathname !== '/login') {
    return null;
  }

  const isLoginPage = pathname === '/login';

  return (
    <div className="min-h-screen bg-gray-50">
      {!isLoginPage && <Header />}
      <main className={`${!isLoginPage ? 'pb-20' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
      {!isLoginPage && <Navigation />}
    </div>
  );
}
