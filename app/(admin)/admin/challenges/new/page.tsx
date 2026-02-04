import { ChallengeForm } from '@/components/admin/challenge-form';

export default function NewChallengePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Challenge</h1>
        <p className="text-muted-foreground">Create a new weekly challenge</p>
      </div>
      <ChallengeForm />
    </div>
  );
}
