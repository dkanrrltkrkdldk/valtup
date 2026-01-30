import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/lib/auth';
import { Button, Input, Card, CardBody } from '@/components/ui';

export function LoginPage() {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const user = await login(nickname.trim());
      if (user.role !== 'ADMIN') {
        setError('관리자 계정으로만 로그인할 수 있습니다.');
        return;
      }
      navigate('/');
    } catch (err) {
      setError('로그인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardBody>
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Point Roulette</h1>
            <p className="text-gray-600 mt-1">관리자 로그인</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="관리자 닉네임"
              placeholder="admin_으로 시작하는 닉네임 입력"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              error={error}
              disabled={isLoading}
            />
            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading}
            >
              로그인
            </Button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-4">
            관리자 계정은 admin_으로 시작하는 닉네임입니다.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
