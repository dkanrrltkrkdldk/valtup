'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (nickname.length < 3 || nickname.length > 30) {
      setError('닉네임은 3-30자 사이여야 합니다.');
      return;
    }

    setIsLoading(true);
    try {
      await login(nickname);
      router.push('/');
    } catch (err) {
      setError('로그인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Point Roulette</h1>
            <p className="mt-2 text-gray-600">매일 룰렛을 돌려 포인트를 획득하세요!</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              id="nickname"
              label="닉네임"
              placeholder="닉네임을 입력하세요 (3-30자)"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              error={error}
              autoComplete="off"
              autoFocus
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              시작하기
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            처음 방문하시면 자동으로 계정이 생성됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
