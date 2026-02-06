'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Code2,
  ShoppingBag,
  Megaphone,
  Users,
  Ticket,
  ArrowLeft,
  MessageSquareMore,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { UserMenu } from '@/components/layout/user-menu';
import { cn } from '@/lib/utils';

const adminNavItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/challenges', label: 'Challenges', icon: Code2 },
  { href: '/admin/reviews', label: 'Reviews', icon: MessageSquareMore },
  { href: '/admin/shop', label: 'Shop Items', icon: ShoppingBag },
  { href: '/admin/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/purchases', label: 'Redemptions', icon: Ticket },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, isInitialized } = useAuthStore();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isInitialized && user && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [isInitialized, isAuthenticated, user, router]);

  if (isLoading || !isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-4 w-full max-w-md px-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background">
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link href="/admin" className="flex items-center gap-2">
            <Code2 className="h-6 w-6 text-primary" />
            <span className="font-bold">Admin Panel</span>
          </Link>
        </div>

        <ScrollArea className="h-[calc(100vh-4rem)]">
          <nav className="space-y-1 p-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to App</span>
            </Link>

            <div className="my-4 border-t" />

            {adminNavItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>

      {/* Admin Header */}
      <header className="fixed top-0 left-64 right-0 z-30 h-16 border-b bg-background">
        <div className="flex h-full items-center justify-end px-4 gap-4">
          <ThemeToggle />
          <UserMenu />
        </div>
      </header>

      {/* Admin Content */}
      <main className="pt-16 pl-64">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
