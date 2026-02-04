'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Medal } from 'lucide-react';

import { useAuthStore } from '@/stores/auth-store';
import { getLeaderboard } from '@/lib/api/users';
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
import { TIER_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function LeaderboardPage() {
  const [limit, setLimit] = useState(25);
  const user = useAuthStore((state) => state.user);

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard', limit],
    queryFn: () => getLeaderboard(limit),
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
          {isLoading ? (
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
    </div>
  );
}
