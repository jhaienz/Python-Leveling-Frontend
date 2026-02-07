'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Medal, Calendar, Zap, FileText } from 'lucide-react';

import { useAuthStore } from '@/stores/auth-store';
import { getLeaderboard, getWeeklyLeaderboard } from '@/lib/api/users';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TIER_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function LeaderboardPage() {
  const [limit, setLimit] = useState(25);
  const [activeTab, setActiveTab] = useState<'all-time' | 'weekly'>('all-time');
  const user = useAuthStore((state) => state.user);

  const { data: leaderboard, isLoading: isLoadingAllTime } = useQuery({
    queryKey: ['leaderboard', limit],
    queryFn: () => getLeaderboard(limit),
  });

  const { data: weeklyData, isLoading: isLoadingWeekly } = useQuery({
    queryKey: ['weekly-leaderboard', limit],
    queryFn: () => getWeeklyLeaderboard(limit),
  });

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-500';
      case 2:
        return 'text-gray-400';
      case 3:
        return 'text-amber-600';
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">
            See how you rank against other students
          </p>
        </div>
        <div className="flex items-center gap-2">
          {[10, 25, 50].map((l) => (
            <Button
              key={l}
              variant={limit === l ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLimit(l)}
            >
              Top {l}
            </Button>
          ))}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all-time' | 'weekly')}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="all-time" className="gap-2">
            <Trophy className="h-4 w-4" />
            All-Time
          </TabsTrigger>
          <TabsTrigger value="weekly" className="gap-2">
            <Calendar className="h-4 w-4" />
            Weekly
          </TabsTrigger>
        </TabsList>

        {/* All-Time Leaderboard */}
        <TabsContent value="all-time">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <CardTitle>Top Students</CardTitle>
              </div>
              <CardDescription>
                Rankings based on level and experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAllTime ? (
                <div className="space-y-4">
                  {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : !leaderboard?.length ? (
                <p className="text-center py-8 text-muted-foreground">
                  No rankings available yet.
                </p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16 text-center">Rank</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-center">Level</TableHead>
                        <TableHead className="text-center">Tier</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaderboard.map((entry) => {
                        const isCurrentUser = user?.id === entry.id;
                        const medalColor = getMedalColor(entry.rank);
                        const tierColor = TIER_COLORS[entry.tier] || '#808080';

                        return (
                          <TableRow
                            key={entry.id}
                            className={cn(isCurrentUser && 'bg-primary/5')}
                          >
                            <TableCell className="text-center">
                              {medalColor ? (
                                <Medal className={cn('h-5 w-5 mx-auto', medalColor)} />
                              ) : (
                                <span className="text-muted-foreground">
                                  {entry.rank}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className={cn(isCurrentUser && 'font-semibold')}>
                                  {entry.name}
                                </span>
                                {isCurrentUser && (
                                  <Badge variant="outline" className="text-xs">
                                    You
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-medium">
                              {entry.level}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                style={{ backgroundColor: tierColor, color: 'white' }}
                              >
                                {entry.tier}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weekly Leaderboard */}
        <TabsContent value="weekly">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <CardTitle>Weekly Champions</CardTitle>
                </div>
                {weeklyData && (
                  <Badge variant="outline" className="text-sm">
                    Week {weeklyData.week}, {weeklyData.year}
                  </Badge>
                )}
              </div>
              <CardDescription>
                Rankings based on XP earned this week (Saturday - Sunday)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingWeekly ? (
                <div className="space-y-4">
                  {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : !weeklyData?.data?.length ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No weekly rankings yet. Complete challenges to appear here!
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16 text-center">Rank</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-center">Level</TableHead>
                        <TableHead className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Zap className="h-4 w-4" />
                            Weekly XP
                          </div>
                        </TableHead>
                        <TableHead className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <FileText className="h-4 w-4" />
                            Submissions
                          </div>
                        </TableHead>
                        <TableHead className="text-center">Tier</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {weeklyData.data.map((entry) => {
                        const isCurrentUser = user?.id === entry.id;
                        const medalColor = getMedalColor(entry.rank);
                        const tierColor = TIER_COLORS[entry.tier] || '#808080';

                        return (
                          <TableRow
                            key={entry.id}
                            className={cn(isCurrentUser && 'bg-primary/5')}
                          >
                            <TableCell className="text-center">
                              {medalColor ? (
                                <Medal className={cn('h-5 w-5 mx-auto', medalColor)} />
                              ) : (
                                <span className="text-muted-foreground">
                                  {entry.rank}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className={cn(isCurrentUser && 'font-semibold')}>
                                  {entry.name}
                                </span>
                                {isCurrentUser && (
                                  <Badge variant="outline" className="text-xs">
                                    You
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-medium">
                              {entry.level}
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="font-semibold text-blue-600 dark:text-blue-400">
                                +{entry.weeklyXp}
                              </span>
                            </TableCell>
                            <TableCell className="text-center text-muted-foreground">
                              {entry.submissionCount}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                style={{ backgroundColor: tierColor, color: 'white' }}
                              >
                                {entry.tier}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
