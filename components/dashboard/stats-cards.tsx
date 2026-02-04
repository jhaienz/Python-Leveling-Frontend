'use client';

import { Trophy, Zap, Coins, FileCode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { User, SubmissionStats } from '@/types';
import { LevelBadge } from './level-badge';

interface StatsCardsProps {
  user: User;
  stats?: SubmissionStats;
}

export function StatsCards({ user, stats }: StatsCardsProps) {
  const passRate = stats && stats.total > 0
    ? Math.round((stats.passed / stats.total) * 100)
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Level Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Level</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <LevelBadge
            level={user.level}
            tier={user.tier}
            tierColor={user.tierColor}
            size="lg"
          />
        </CardContent>
      </Card>

      {/* XP Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Experience</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{user.xp.toLocaleString()} XP</div>
          <div className="mt-2 space-y-1">
            <Progress value={user.xpProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {user.xpProgress}% to level {user.level + 1} ({user.xpRequired.toLocaleString()} XP needed)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Coins Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Coins</CardTitle>
          <Coins className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{user.coins.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Available to spend in shop
          </p>
        </CardContent>
      </Card>

      {/* Submissions Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Submissions</CardTitle>
          <FileCode className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.total || 0}</div>
          <p className="text-xs text-muted-foreground">
            {stats?.passed || 0} passed ({passRate}% success rate)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
