'use client';

import { useQuery } from '@tanstack/react-query';
import { getCurrentChallenge } from '@/lib/api/challenges';
import { ChallengeView } from '@/components/challenge/challenge-view';
import { WeekendNotice } from '@/components/challenge/weekend-notice';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { ApiClientError } from '@/lib/api/client';

export default function ChallengePage() {
  const { data: challenge, isLoading, error } = useQuery({
    queryKey: ['current-challenge'],
    queryFn: getCurrentChallenge,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Check if it's a weekend restriction error
  if (error instanceof ApiClientError && error.statusCode === 403) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Weekly Challenge</h1>
          <p className="text-muted-foreground">
            Test your Python skills
          </p>
        </div>
        <WeekendNotice />
      </div>
    );
  }

  // Other errors
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Weekly Challenge</h1>
          <p className="text-muted-foreground">
            Test your Python skills
          </p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof ApiClientError
              ? error.message
              : 'Failed to load challenge. Please try again later.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Weekly Challenge</h1>
          <p className="text-muted-foreground">
            Test your Python skills
          </p>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Active Challenge</AlertTitle>
          <AlertDescription>
            There is no challenge available at the moment. Check back later!
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Weekly Challenge</h1>
        <p className="text-muted-foreground">
          Complete the challenge to earn XP and coins
        </p>
      </div>
      <ChallengeView challenge={challenge} />
    </div>
  );
}
