'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { User, Mail, Calendar, Zap, Coins, FileCode, TrendingUp } from 'lucide-react';

import { useAuthStore } from '@/stores/auth-store';
import { getProfile } from '@/lib/api/users';
import { getSubmissionStats } from '@/lib/api/submissions';
import { getTransactionSummary } from '@/lib/api/transactions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { LevelBadge } from '@/components/dashboard/level-badge';

export default function ProfilePage() {
  const authUser = useAuthStore((state) => state.user);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  const { data: stats } = useQuery({
    queryKey: ['submission-stats'],
    queryFn: getSubmissionStats,
  });

  const { data: transactionSummary } = useQuery({
    queryKey: ['transaction-summary'],
    queryFn: getTransactionSummary,
  });

  const user = profile || authUser;

  if (profileLoading || !user) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const passRate = stats && stats.total > 0
    ? Math.round((stats.passed / stats.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">
          View your account details and statistics
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                style={{ backgroundColor: user.tierColor }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <LevelBadge
                  level={user.level}
                  tier={user.tier}
                  tierColor={user.tierColor}
                  size="sm"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Student ID:</span>
                <span className="font-medium">{user.studentId}</span>
              </div>
              {user.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{user.email}</span>
                </div>
              )}
              {user.createdAt && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Joined:</span>
                  <span className="font-medium">
                    {format(new Date(user.createdAt), 'PPP')}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Level Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Level Progress</CardTitle>
            <CardDescription>Your journey to Level 60</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div
                className="text-5xl font-bold mb-2"
                style={{ color: user.tierColor }}
              >
                {user.level}
              </div>
              <p className="text-sm text-muted-foreground">Current Level</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>XP Progress</span>
                <span className="font-medium">{user.xpProgress}%</span>
              </div>
              <Progress value={user.xpProgress} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{user.xp.toLocaleString()} XP</span>
                <span>{user.xpRequired.toLocaleString()} needed</span>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <Zap className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                <div className="text-2xl font-bold">{user.xp.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Total XP</p>
              </div>
              <div>
                <Coins className="h-5 w-5 mx-auto text-yellow-500 mb-1" />
                <div className="text-2xl font-bold">{user.coins.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Coins</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submission Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Submission Statistics</CardTitle>
            <CardDescription>Your challenge performance</CardDescription>
          </CardHeader>
          <CardContent>
            {stats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <FileCode className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
                    <p className="text-xs text-muted-foreground">Passed</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Success Rate</span>
                    <span className="font-medium">{passRate}%</span>
                  </div>
                  <Progress value={passRate} className="h-2" />
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">XP Earned:</span>
                    <span className="font-medium text-blue-600">
                      +{stats.totalXpEarned.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coins Earned:</span>
                    <span className="font-medium text-yellow-600">
                      +{stats.totalCoinsEarned.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Score:</span>
                    <span className="font-medium">{stats.averageScore}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                No submission data available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Transaction Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Coin Summary</CardTitle>
            <CardDescription>Your coin earnings and spending</CardDescription>
          </CardHeader>
          <CardContent>
            {transactionSummary ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <TrendingUp className="h-5 w-5 mx-auto text-green-500 mb-1" />
                    <div className="text-2xl font-bold text-green-600">
                      +{transactionSummary.totalEarned}
                    </div>
                    <p className="text-xs text-muted-foreground">Total Earned</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {transactionSummary.totalSpent}
                    </div>
                    <p className="text-xs text-muted-foreground">Total Spent</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Level Rewards:</span>
                    <span className="font-medium">
                      +{transactionSummary.byType.LEVEL_UP_REWARD || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Challenge Bonuses:</span>
                    <span className="font-medium">
                      +{transactionSummary.byType.CHALLENGE_BONUS || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Admin Grants:</span>
                    <span className="font-medium">
                      +{transactionSummary.byType.ADMIN_GRANT || 0}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                No transaction data available
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
