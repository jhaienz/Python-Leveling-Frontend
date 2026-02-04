'use client';

import { Menu, Coins } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';
import { UserMenu } from './user-menu';
import { cn } from '@/lib/utils';

export function Header() {
  const user = useAuthStore((state) => state.user);
  const { sidebarCollapsed, setSidebarOpen } = useUIStore();

  return (
    <header
      className={cn(
        'fixed top-0 z-30 h-16 border-b bg-background transition-all duration-300',
        sidebarCollapsed ? 'left-16' : 'left-64',
        'right-0'
      )}
    >
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2 rounded-full bg-accent px-3 py-1.5">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">{user.coins}</span>
            </div>
          )}
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
