'use client';

import { useAuth } from '@/hooks/use-auth';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">ホーム</h1>
      {user && (
        <div>
          <p data-testid="user-name">ようこそ、{user.name}さん</p>
        </div>
      )}
    </div>
  );
}
