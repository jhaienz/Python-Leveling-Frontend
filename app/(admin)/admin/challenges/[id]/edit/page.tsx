'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getChallenge } from '@/lib/api/challenges';
import { ChallengeForm } from '@/components/admin/challenge-form';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditChallengePage() {
  const params = useParams();
  const id = params.id as string;

  const { data: challenge, isLoading } = useQuery({
    queryKey: ['challenge', id],
    queryFn: () => getChallenge(id),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Challenge not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Challenge</h1>
        <p className="text-muted-foreground">Update challenge details</p>
      </div>
      <ChallengeForm challenge={challenge} />
    </div>
  );
}
