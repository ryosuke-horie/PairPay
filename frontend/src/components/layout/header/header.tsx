'use client';

import Link from 'next/link';
import { NavMenu } from './nav-menu';
import { UserMenu } from './user-menu';
import { MobileMenu } from './mobile-menu';
import { useAuth } from '@/hooks/use-auth';

export function Header() {
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* ヘッダー全体は横幅100%ですが、内部はコンテナで中央寄せ */}
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            {/* モバイル用メニュー：md以上では非表示 */}
            <MobileMenu />
            <Link
              href={isAuthenticated ? '/transactions' : '/'}
              className="text-lg font-semibold"
            >
              PairPay
            </Link>
            {/* PC用ナビゲーション */}
            <nav className="hidden md:flex">
              <NavMenu />
            </nav>
          </div>
          {/* ユーザーメニューは共通で表示 */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
