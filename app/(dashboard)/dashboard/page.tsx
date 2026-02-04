'use client';

import { useQuery } from '@tanstack/react-query';
import { Code2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

import { useAuthStore } from '@/stores/auth-store';
import { getProfile } from '@/lib/api/users';
import { getSubmissionStats, getMySubmissions } from '@/lib/api/submissions';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { UserProgress } from '@/components/dashboard/user-progress';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const authUser = useAuthStore((state) => state.user);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  const { data: stats } = useQuery({
    queryKey: ['submission-stats'],
    queryFn: getSubmissionStats,
  });

  const { data: submissions } = useQuery({
    queryKey: ['submissions', 1],
    queryFn: () => getMySubmissions(1, 5),
  });

  const user = profile || authUser;

  if (profileLoading || !user) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your progress
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards user={user} stats={stats} />

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* User Progress */}
        <UserProgress user={user} />

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump right into the action</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start" size="lg" asChild>
              <Link href="/challenge">
                <Code2 className="mr-2 h-5 w-5" />
                View This Week&apos;s Challenge
              </Link>
            </Button>
            <Button className="w-full justify-start" size="lg" variant="outline" asChild>
              <Link href="/shop">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Browse Shop ({user.coins} coins available)
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <RecentActivity submissions={submissions?.data || []} />
    </div>
  );
}
