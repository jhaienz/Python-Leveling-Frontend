'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink } from 'lucide-react';
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
import type { Submission } from '@/types';
import { cn } from '@/lib/utils';
import { DIFFICULTY_LABELS } from '@/lib/constants';

interface SubmissionsTableProps {
  submissions: Submission[];
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  ONGOING: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  FAILED: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  ERROR: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
};

export function SubmissionsTable({ submissions }: SubmissionsTableProps) {
  if (!submissions.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No submissions yet.</p>
        <Button asChild className="mt-4">
          <Link href="/challenge">Complete a Challenge</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Challenge</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Score</TableHead>
            <TableHead className="text-center">XP</TableHead>
            <TableHead className="text-center">Coins</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission) => {
            const challengeTitle =
              typeof submission.challengeId === 'object' && submission.challengeId !== null
                ? submission.challengeId.title
                : 'Challenge';
            const difficulty =
              typeof submission.challengeId === 'object' && submission.challengeId !== null
                ? submission.challengeId.difficulty
                : null;

            return (
              <TableRow key={submission.id}>
                <TableCell>
                  <div className="font-medium">{challengeTitle}</div>
                  {difficulty && (
                    <div className="text-xs text-muted-foreground">
                      {DIFFICULTY_LABELS[difficulty]}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn(statusColors[submission.status])}
                  >
                    {submission.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {submission.aiScore !== undefined ? (
                    <span className="font-semibold">{submission.aiScore}%</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {submission.xpEarned ? (
                    <span className="text-blue-600 font-medium">
                      +{submission.xpEarned}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {submission.coinsEarned ? (
                    <span className="text-yellow-600 font-medium">
                      +{submission.coinsEarned}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDistanceToNow(new Date(submission.createdAt), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/submissions/${submission.id}`}>
                      View
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
