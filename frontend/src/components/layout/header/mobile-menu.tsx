'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

const routes = [
  {
    href: '/transactions',
    label: '収支管理',
  },
  {
    href: '/settlements',
    label: '精算管理',
  },
] as const;

export function MobileMenu() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">メニューを開く</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>メニュー</SheetTitle>
        </SheetHeader>
        <div className="mt-4 flex flex-col gap-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'rounded-md px-2 py-1 text-sm transition-colors hover:bg-accent',
                pathname === route.href && 'bg-accent'
              )}
            >
              {route.label}
            </Link>
          ))}
          {!isAuthenticated && (
            <>
              <Link
                href="/login"
                className="rounded-md px-2 py-1 text-sm transition-colors hover:bg-accent"
              >
                ログイン
              </Link>
              <Link
                href="/register"
                className="rounded-md px-2 py-1 text-sm transition-colors hover:bg-accent"
              >
                新規登録
              </Link>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}