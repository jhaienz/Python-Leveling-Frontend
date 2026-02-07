'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Submission } from '@/types';
import { cn } from '@/lib/utils';

interface RecentActivityProps {
  submissions: Submission[];
}

const statusConfig = {
  PENDING: { icon: Clock, color: 'text-yellow-500', label: 'Pending' },
  ONGOING: { icon: Clock, color: 'text-blue-500', label: 'Ongoing' },
  COMPLETED: { icon: CheckCircle, color: 'text-green-500', label: 'Completed' },
  FAILED: { icon: XCircle, color: 'text-red-500', label: 'Failed' },
  ERROR: { icon: AlertCircle, color: 'text-gray-500', label: 'Error' },
};

export function RecentActivity({ submissions }: RecentActivityProps) {
  if (!submissions.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground mb-4">
              No submissions yet. Complete your first challenge!
            </p>
            <Button asChild>
              <Link href="/challenge">View Challenge</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest submissions</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/submissions">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {submissions.slice(0, 5).map((submission) => {
            const status = statusConfig[submission.status];
            const StatusIcon = status.icon;
            const challengeTitle =
              typeof submission.challengeId === 'object' && submission.challengeId !== null
                ? submission.challengeId.title
                : 'Challenge';

            return (
              <Link
                key={submission.id}
                href={`/submissions/${submission.id}`}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <StatusIcon className={cn('h-5 w-5', status.color)} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{challengeTitle}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(submission.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {submission.aiScore !== undefined && (
                    <span className="text-sm font-medium">
                      {submission.aiScore}%
                    </span>
                  )}
                  <Badge
                    variant="secondary"
                    className={cn(
                      submission.status === 'COMPLETED' && 'bg-green-100 text-green-700',
                      submission.status === 'FAILED' && 'bg-red-100 text-red-700',
                      submission.status === 'PENDING' && 'bg-yellow-100 text-yellow-700'
                    )}
                  >
                    {status.label}
                  </Badge>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
