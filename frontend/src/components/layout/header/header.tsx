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
      <div className="container flex h-14 items-center">
        <MobileMenu />
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href={isAuthenticated ? '/transactions' : '/'}
              className="text-lg font-semibold"
            >
              PairPay
            </Link>
            <nav className="hidden md:flex">
              <NavMenu />
            </nav>
          </div>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}