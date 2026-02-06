"use client";

import { ChallengeView } from "@/components/challenge/challenge-view";

export default function ChallengePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Weekly Challenge</h1>
        <p className="text-muted-foreground">
          Complete the challenge to earn XP and coins
        </p>
      </div>
      <ChallengeView />
    </div>
  );
}
