'use client';

import type { Tier } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LevelBadgeProps {
  level: number;
  tier: Tier;
  tierColor: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LevelBadge({ level, tier, tierColor, size = 'md' }: LevelBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <Badge
        className={cn(
          'font-semibold',
          size === 'sm' && 'text-xs px-2 py-0.5',
          size === 'md' && 'text-sm px-2.5 py-0.5',
          size === 'lg' && 'text-base px-3 py-1'
        )}
        style={{ backgroundColor: tierColor, color: 'white' }}
      >
        {tier}
      </Badge>
      <span
        className={cn(
          'font-bold',
          size === 'sm' && 'text-sm',
          size === 'md' && 'text-base',
          size === 'lg' && 'text-lg'
        )}
      >
        Level {level}
      </span>
    </div>
  );
}
