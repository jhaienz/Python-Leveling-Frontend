'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ArrowLeft, Zap, Coins, Calendar } from 'lucide-react';
import Link from 'next/link';

import { getSubmission } from '@/lib/api/submissions';
import { CodeEditor } from '@/components/challenge/code-editor';
import { AIFeedbackCard } from '@/components/submissions/ai-feedback-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  EVALUATING: 'bg-blue-100 text-blue-700',
  PASSED: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
  ERROR: 'bg-gray-100 text-gray-700',
};

export default function SubmissionDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: submission, isLoading } = useQuery({
    queryKey: ['submission', id],
    queryFn: () => getSubmission(id),
    refetchInterval: (query) => {
      const data = query.state.data;
      // Keep polling if pending or evaluating
      if (data?.status === 'PENDING' || data?.status === 'EVALUATING') {
        return 5000; // Poll every 5 seconds
      }
      return false;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Submission not found</p>
        <Button asChild className="mt-4">
          <Link href="/submissions">Back to Submissions</Link>
        </Button>
      </div>
    );
  }

  const challengeTitle =
    typeof submission.challengeId === 'object'
      ? submission.challengeId.title
      : 'Challenge';
  const difficulty =
    typeof submission.challengeId === 'object'
      ? submission.challengeId.difficulty
      : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/submissions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Submission Details</h1>
          <p className="text-muted-foreground">{challengeTitle}</p>
        </div>
      </div>

      {/* Submission Info */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>{challengeTitle}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4" />
                Submitted {format(new Date(submission.createdAt), 'PPp')}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {difficulty && (
                <Badge className={cn(DIFFICULTY_COLORS[difficulty], 'text-white')}>
                  {DIFFICULTY_LABELS[difficulty]}
                </Badge>
              )}
              <Badge className={cn(statusColors[submission.status])}>
                {submission.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Rewards */}
          {(submission.xpEarned || submission.coinsEarned) && (
            <div className="flex flex-wrap gap-4 mb-4 p-4 bg-muted rounded-lg">
              {submission.xpEarned && (
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-500" />
                  <span className="font-semibold text-blue-600">
                    +{submission.xpEarned} XP
                  </span>
                </div>
              )}
              {submission.coinsEarned && (
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-yellow-500" />
                  <span className="font-semibold text-yellow-600">
                    +{submission.coinsEarned} Coins
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Submitted Code */}
          <div>
            <h3 className="font-semibold mb-2">Your Code</h3>
            <CodeEditor
              value={submission.code}
              onChange={() => {}}
              readOnly
              height="300px"
            />
          </div>
        </CardContent>
      </Card>

      {/* AI Feedback */}
      <AIFeedbackCard submission={submission} />
    </div>
  );
}
