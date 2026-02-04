'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { User } from '@/types';
import { LevelBadge } from './level-badge';
import { TIER_RANGES } from '@/lib/constants';

interface UserProgressProps {
  user: User;
}

export function UserProgress({ user }: UserProgressProps) {
  const tierRange = TIER_RANGES[user.tier];
  const tierProgress = tierRange
    ? ((user.level - tierRange[0]) / (tierRange[1] - tierRange[0])) * 100
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Progress</CardTitle>
        <CardDescription>Track your journey to become a Master</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Level */}
        <div className="flex items-center justify-between">
          <LevelBadge
            level={user.level}
            tier={user.tier}
            tierColor={user.tierColor}
            size="lg"
          />
          <span className="text-sm text-muted-foreground">
            Max Level: 60
          </span>
        </div>

        {/* XP Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>XP Progress to Next Level</span>
            <span className="font-medium">{user.xpProgress}%</span>
          </div>
          <Progress value={user.xpProgress} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{user.xp.toLocaleString()} XP</span>
            <span>{user.xpRequired.toLocaleString()} XP needed</span>
          </div>
        </div>

        {/* Tier Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress in {user.tier} Tier</span>
            <span className="font-medium">
              Level {user.level} / {tierRange?.[1] || 60}
            </span>
          </div>
          <Progress
            value={tierProgress}
            className="h-3"
            style={
              {
                '--progress-background': user.tierColor,
              } as React.CSSProperties
            }
          />
        </div>

        {/* Tier Roadmap */}
        <div className="grid grid-cols-6 gap-1 pt-4">
          {(['Newbie', 'Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master'] as const).map(
            (tier) => {
              const range = TIER_RANGES[tier];
              const isCurrentTier = tier === user.tier;
              const isPastTier = range && user.level > range[1];

              return (
                <div
                  key={tier}
                  className={`text-center p-2 rounded text-xs ${
                    isCurrentTier
                      ? 'bg-primary text-primary-foreground'
                      : isPastTier
                      ? 'bg-muted text-muted-foreground'
                      : 'bg-muted/50 text-muted-foreground'
                  }`}
                >
                  <div className="font-medium truncate">{tier}</div>
                  <div className="text-[10px] opacity-75">
                    {range?.[0]}-{range?.[1]}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </CardContent>
    </Card>
  );
}
