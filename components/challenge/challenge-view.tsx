"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Send,
  Loader2,
  Zap,
  Coins,
  AlertTriangle,
  MessageSquare,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  Lightbulb,
  Lock,
  Sparkles,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { CodeEditor } from "./code-editor";
import { submitCode, getMySubmissionForChallenge } from "@/lib/api/submissions";
import { getCurrentChallenge } from "@/lib/api/challenges";
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from "@/lib/constants";
import { ApiClientError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import type { Challenge, Submission } from "@/types";

const DEFAULT_LANGUAGE = "Bicol";

export function ChallengeView() {
  const {
    data: challengeData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["current-challenge"],
    queryFn: getCurrentChallenge,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error instanceof ApiClientError
            ? error.message
            : "Failed to load challenge. Please try again later."}
        </AlertDescription>
      </Alert>
    );
  }

  const challenges = Array.isArray(challengeData)
    ? challengeData.filter((item) => item.isActive !== false)
    : challengeData
      ? [challengeData]
      : [];

  if (!challenges.length) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Active Challenge</AlertTitle>
        <AlertDescription>
          There is no active challenge available at the moment. Check back
          later!
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {challenges.map((challenge) => (
        <ChallengeItem key={challenge.id} challenge={challenge} />
      ))}
    </div>
  );
}

function ChallengeItem({ challenge }: { challenge: Challenge }) {
  const router = useRouter();
  const [code, setCode] = useState(challenge.starterCode ?? "");
  const [explanation, setExplanation] = useState("");
  const [explanationLanguage] = useState(DEFAULT_LANGUAGE);
  const [isChallengeOpen, setIsChallengeOpen] = useState(true);

  // Fetch existing submission for this challenge
  const { data: existingSubmission } = useQuery({
    queryKey: ["my-submission", challenge.id],
    queryFn: () => getMySubmissionForChallenge(challenge.id),
  });

  const hasSubmitted = !!existingSubmission;
  const isExplanationValid = explanation.length >= 50;
  const canSubmit = code.trim() && isExplanationValid && explanationLanguage && !hasSubmitted;

  const submitMutation = useMutation({
    mutationFn: () =>
      submitCode({
        challengeId: challenge.id,
        code,
        explanation,
        explanationLanguage,
      }),
    onSuccess: (data) => {
      toast.success("Code submitted successfully!");
      router.push(`/submissions/${data.id}`);
    },
    onError: (error) => {
      if (error instanceof ApiClientError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to submit code");
      }
    },
  });

  return (
    <div className="space-y-6">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 rounded-lg border bg-card px-4 py-3 text-left shadow-xs"
        onClick={() => setIsChallengeOpen((prev) => !prev)}
        aria-expanded={isChallengeOpen}
      >
        <div className="space-y-1">
          <p className="text-xs uppercase text-muted-foreground">Challenge</p>
          <p className="text-lg font-semibold">{challenge.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            className={`${DIFFICULTY_COLORS[challenge.difficulty]} text-white`}
          >
            {DIFFICULTY_LABELS[challenge.difficulty]}
          </Badge>
          {challenge.weekNumber && challenge.year && (
            <Badge variant="outline">
              Week {challenge.weekNumber}, {challenge.year}
            </Badge>
          )}
          <ChevronDown
            className={`h-5 w-5 transition-transform ${
              isChallengeOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </div>
      </button>

      {isChallengeOpen && (
        <>
          {/* Challenge Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{challenge.title}</CardTitle>
              <CardDescription className="text-base">
                {challenge.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Rewards */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span>
                    <span className="font-semibold">
                      {challenge.baseXpReward}
                    </span>{" "}
                    Base XP
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Coins className="h-4 w-4 text-yellow-500" />
                  <span>
                    <span className="font-semibold">
                      {challenge.bonusCoins}
                    </span>{" "}
                    Bonus Coins
                  </span>
                </div>
              </div>

              <Separator />

              {/* Problem Statement */}
              <div>
                <h3 className="font-semibold mb-2">Problem Statement</h3>
                <div className="bg-muted rounded-lg p-4 whitespace-pre-wrap text-sm">
                  {challenge.problemStatement}
                </div>
              </div>

              {/* Test Cases */}
              {challenge.testCases && challenge.testCases.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Test Cases</h3>
                  <div className="space-y-2">
                    {challenge.testCases.map((testCase, index) => (
                      <div
                        key={index}
                        className="bg-muted rounded-lg p-3 text-sm font-mono"
                      >
                        <span className="text-muted-foreground">Input:</span>{" "}
                        {testCase.input}
                        {testCase.expectedOutput && (
                          <>
                            <br />
                            <span className="text-muted-foreground">
                              Expected:
                            </span>{" "}
                            {testCase.expectedOutput}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Show submitted solution or code editor */}
          {hasSubmitted && existingSubmission ? (
            <SubmissionResultsView submission={existingSubmission} />
          ) : (
            <>
              {/* Code Editor */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Solution</CardTitle>
                  <CardDescription>Write your Python code below</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CodeEditor value={code} onChange={setCode} height="400px" />
                </CardContent>
              </Card>

              {/* Explanation */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <CardTitle>Explain Your Code</CardTitle>
                  </div>
                  <CardDescription>
                    Explain your solution in your native language (minimum 50
                    characters). This demonstrates your understanding of the code.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <div className="text-sm text-muted-foreground">
                      {DEFAULT_LANGUAGE}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`explanation-${challenge.id}`}>
                      Explanation
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({explanation.length}/50 minimum characters)
                      </span>
                    </Label>
                    <Textarea
                      id={`explanation-${challenge.id}`}
                      placeholder="Explain how your code works in your chosen language..."
                      value={explanation}
                      onChange={(e) => setExplanation(e.target.value)}
                      rows={6}
                      className={
                        !isExplanationValid && explanation.length > 0
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {!isExplanationValid && explanation.length > 0 && (
                      <p className="text-sm text-red-500">
                        Explanation must be at least 50 characters (
                        {50 - explanation.length} more needed)
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Your code will be evaluated by AI (not executed)</span>
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="lg"
                          disabled={submitMutation.isPending || !canSubmit}
                        >
                          {submitMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Submit Solution
                            </>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Submit your solution?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Your code and explanation will be sent for evaluation.
                            You can submit up to 5 times per hour.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => submitMutation.mutate()}
                          >
                            Submit
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}

function SubmissionResultsView({ submission }: { submission: Submission }) {
  const { aiScore, aiFeedback, aiAnalysis, aiSuggestions, status, code, xpEarned, coinsEarned } = submission;

  const isPending = status === "PENDING" || status === "EVALUATING";

  return (
    <div className="space-y-6">
      {/* Locked Notice */}
      <Alert>
        <Lock className="h-4 w-4" />
        <AlertTitle>Submission Locked</AlertTitle>
        <AlertDescription>
          You have already submitted a solution for this challenge.
          {isPending && " Your submission is being evaluated."}
        </AlertDescription>
      </Alert>

      {/* Your Submitted Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Your Submitted Code
            {status === "PASSED" && <CheckCircle className="h-5 w-5 text-green-500" />}
            {status === "FAILED" && <XCircle className="h-5 w-5 text-red-500" />}
            {isPending && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
          </CardTitle>
          <CardDescription>
            {isPending
              ? "Waiting for AI evaluation..."
              : status === "PASSED"
                ? "Great job! Your solution passed."
                : "Your solution needs improvement."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto whitespace-pre">
            {code}
          </div>
        </CardContent>
      </Card>

      {/* AI Evaluation Results */}
      {!isPending && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  AI Evaluation
                  {status === "PASSED" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </CardTitle>
                <CardDescription>
                  {status === "PASSED"
                    ? "Your solution met the requirements."
                    : "Review the feedback below to improve."}
                </CardDescription>
              </div>
              {aiScore !== undefined && (
                <div className="text-center">
                  <div
                    className={cn(
                      "text-4xl font-bold",
                      aiScore >= 70 ? "text-green-500" : "text-red-500"
                    )}
                  >
                    {aiScore}%
                  </div>
                  <div className="text-xs text-muted-foreground">Overall Score</div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Rewards Earned */}
            {(xpEarned !== undefined || coinsEarned !== undefined) && (
              <div className="flex gap-4 justify-center py-3 bg-muted/50 rounded-lg">
                {xpEarned !== undefined && xpEarned > 0 && (
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    <span className="font-semibold">+{xpEarned} XP</span>
                  </div>
                )}
                {coinsEarned !== undefined && coinsEarned > 0 && (
                  <div className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-yellow-500" />
                    <span className="font-semibold">+{coinsEarned} Coins</span>
                  </div>
                )}
              </div>
            )}

            {/* Analysis Breakdown */}
            {aiAnalysis && (
              <div className="space-y-4">
                <h3 className="font-semibold">Score Breakdown</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <MetricBar label="Correctness" value={aiAnalysis.correctness} />
                  <MetricBar label="Code Quality" value={aiAnalysis.codeQuality} />
                  <MetricBar label="Efficiency" value={aiAnalysis.efficiency} />
                  <MetricBar label="Style" value={aiAnalysis.style} />
                </div>
              </div>
            )}

            {/* Feedback */}
            {aiFeedback && (
              <div>
                <h3 className="font-semibold mb-2">Feedback</h3>
                <div className="bg-muted rounded-lg p-4 text-sm">{aiFeedback}</div>
              </div>
            )}

            {/* Suggestions */}
            {aiSuggestions && aiSuggestions.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  Suggestions for Improvement
                </h3>
                <ul className="space-y-2">
                  {aiSuggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="text-primary font-medium">{index + 1}.</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MetricBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <Progress
        value={value}
        className="h-2"
        style={
          {
            "--progress-background":
              value >= 70 ? "#22c55e" : value >= 50 ? "#eab308" : "#ef4444",
          } as React.CSSProperties
        }
      />
    </div>
  );
}
