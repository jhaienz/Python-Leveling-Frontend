"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Send,
  Loader2,
  Zap,
  Coins,
  AlertTriangle,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  XCircle,
  Lightbulb,
  Lock,
  Sparkles,
  FileText,
  TestTube,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Clock,
  ListTodo,
  SkipForward,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { CodeEditor } from "./code-editor";
import {
  submitCode,
  getMySubmissions,
  getSubmission,
} from "@/lib/api/submissions";
import { getActiveChallenges } from "@/lib/api/challenges";
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from "@/lib/constants";
import { ApiClientError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import type { Challenge, Submission, PaginatedResponse } from "@/types";
import { WeekendNotice } from "./weekend-notice";

const DEFAULT_LANGUAGE = "Bicol";

type ChallengeStatus = "pending" | "ongoing" | "completed" | "failed";

interface ChallengeWithStatus extends Challenge {
  status: ChallengeStatus;
  submission?: Submission | null;
}

function getChallengeStatus(submission?: Submission | null): ChallengeStatus {
  if (!submission) return "pending"; // No submission yet
  if (submission.status === "COMPLETED") return "completed"; // Successfully completed
  if (submission.status === "FAILED") return "failed"; // Failed evaluation
  return "ongoing"; // PENDING, ONGOING, ERROR - submission in progress
}

const STATUS_CONFIG: Record<
  ChallengeStatus,
  { label: string; color: string; icon: React.ElementType }
> = {
  pending: {
    label: "Pending",
    color: "bg-muted text-muted-foreground",
    icon: ListTodo,
  },
  ongoing: {
    label: "Ongoing",
    color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    icon: Clock,
  },
  completed: {
    label: "Completed",
    color: "bg-green-500/10 text-green-600 dark:text-green-400",
    icon: CheckCircle,
  },
  failed: {
    label: "Failed",
    color: "bg-red-500/10 text-red-600 dark:text-red-400",
    icon: XCircle,
  },
};

export function ChallengeView() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showList, setShowList] = useState(true);

  // Fetch all active challenges
  const {
    data: challengesData,
    isLoading: isLoadingChallenges,
    error: challengesError,
  } = useQuery({
    queryKey: ["active-challenges"],
    queryFn: async () => {
      const data = await getActiveChallenges();
      console.log("Raw challenges data:", data);
      console.log("First challenge test cases:", data[0]?.testCases);
      return await getActiveChallenges();
    },
    retry: 1, // Allow one retry
  });
  // Sort challenges by difficulty (1=Very Easy to 5=Very Hard)
  const sortedChallenges = useMemo(() => {
    if (!challengesData) return [];
    return [...challengesData].sort((a, b) => a.difficulty - b.difficulty);
  }, [challengesData]);

  const selectedChallengeId = sortedChallenges[selectedIndex]?.id;

  // Fetch all submissions to derive per-challenge status
  const { data: submissionsData, isLoading: isLoadingSubmissions } = useQuery<
    PaginatedResponse<Submission>
  >({
    queryKey: ["my-submissions"],
    queryFn: () => getMySubmissions(1, 200),
    enabled: sortedChallenges.length > 0,
    staleTime: 0,
    refetchOnMount: "always" as const,
    refetchInterval: (query) =>
      query.state.data?.data?.some(
        (submission: Submission) =>
          submission.status === "PENDING" || submission.status === "ONGOING",
      )
        ? 5000
        : false,
    refetchIntervalInBackground: true,
  });

  const submissionsByChallengeId = useMemo(() => {
    const map = new Map<string, Submission>();
    const submissions = submissionsData?.data ?? [];

    submissions.forEach((submission) => {
      const challengeId =
        typeof submission.challengeId === "string"
          ? submission.challengeId
          : ((submission.challengeId as { id?: string; _id?: string } | null)
              ?.id ??
            (submission.challengeId as { id?: string; _id?: string } | null)
              ?._id);

      if (!challengeId) return;

      const existing = map.get(challengeId);
      if (!existing) {
        map.set(challengeId, submission);
        return;
      }

      const submissionDate = new Date(
        submission.evaluatedAt ?? submission.createdAt,
      ).getTime();
      const existingDate = new Date(
        existing.evaluatedAt ?? existing.createdAt,
      ).getTime();

      if (submissionDate >= existingDate) {
        map.set(challengeId, submission);
      }
    });

    return map;
  }, [submissionsData]);

  const selectedSubmissionSummary = selectedChallengeId
    ? submissionsByChallengeId.get(selectedChallengeId)
    : undefined;
  const selectedSubmissionId = selectedSubmissionSummary?.id;

  // Fetch full submission details for the selected challenge
  const { data: selectedSubmission, isLoading: isLoadingSelectedSubmission } =
    useQuery<Submission>({
      queryKey: ["submission", selectedSubmissionId],
      queryFn: () => getSubmission(selectedSubmissionId ?? ""),
      enabled: Boolean(selectedSubmissionId),
      staleTime: 0,
      refetchOnMount: "always" as const,
      refetchInterval: (query) =>
        query.state.data?.status === "PENDING" ||
        query.state.data?.status === "ONGOING"
          ? 5000
          : false,
      refetchIntervalInBackground: true,
    });

  // Combine challenges with their submission status
  const challengesWithStatus: ChallengeWithStatus[] = useMemo(() => {
    return sortedChallenges.map((challenge) => {
      const submissionSummary = submissionsByChallengeId.get(challenge.id);
      const submission =
        challenge.id === selectedChallengeId ? selectedSubmission : undefined;
      return {
        ...challenge,
        status: getChallengeStatus(submissionSummary ?? submission),
        submission,
      };
    });
  }, [
    sortedChallenges,
    submissionsByChallengeId,
    selectedChallengeId,
    selectedSubmission,
  ]);

  const selectedChallenge = challengesWithStatus[selectedIndex];
  const isLoadingSubmissionData =
    isLoadingSubmissions || isLoadingSelectedSubmission;

  // Navigation handlers
  const goToPrevious = () => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedIndex < challengesWithStatus.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const skipToNext = () => {
    const nextUnsolved = challengesWithStatus.findIndex(
      (c, i) => i > selectedIndex && c.status !== "completed",
    );
    if (nextUnsolved !== -1) {
      setSelectedIndex(nextUnsolved);
    } else {
      goToNext();
    }
  };

  if (isLoadingChallenges) {
    return (
      <div className="flex h-full gap-3 overflow-hidden">
        <Skeleton className="h-full w-80 shrink-0" />
        <Skeleton className="h-full flex-1" />
      </div>
    );
  }

  if (challengesError) {
    const isNoActiveChallengesError =
      challengesError instanceof ApiClientError &&
      (challengesError.statusCode === 404 ||
        challengesError.message.toLowerCase().includes("no active challenges"));
    const isWeekendOnlyError =
      challengesError instanceof ApiClientError &&
      (challengesError.statusCode === 403 ||
        challengesError.message.toLowerCase().includes("weekend"));

    if (isNoActiveChallengesError || isWeekendOnlyError) {
      return <WeekendNotice />;
    }

    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {challengesError instanceof ApiClientError
            ? challengesError.message
            : "Failed to load challenges. Please try again later."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex h-full gap-3 overflow-hidden">
      {/* Challenge List Sidebar */}
      {showList && (
        <div className="w-80 shrink-0 border rounded-lg bg-card flex flex-col overflow-hidden">
          {/* List Header */}
          <div className="border-b px-4 py-3 shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Challenges</h2>
              <Badge variant="outline" className="text-xs">
                {
                  challengesWithStatus.filter((c) => c.status === "completed")
                    .length
                }
                /{challengesWithStatus.length}
              </Badge>
            </div>
            <div className="mt-2">
              <Progress
                value={
                  (challengesWithStatus.filter((c) => c.status === "completed")
                    .length /
                    challengesWithStatus.length) *
                  100
                }
                className="h-1.5"
              />
            </div>
          </div>

          {/* Challenge List - Scrollable */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-2 space-y-1">
              {challengesWithStatus.map((challenge, index) => {
                const StatusIcon = STATUS_CONFIG[challenge.status].icon;
                const isSelected = index === selectedIndex;

                return (
                  <button
                    key={challenge.id}
                    onClick={() => setSelectedIndex(index)}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
                      isSelected
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted",
                    )}
                  >
                    <div
                      className={cn(
                        "shrink-0 p-1.5 rounded-md",
                        STATUS_CONFIG[challenge.status].color,
                      )}
                    >
                      <StatusIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground">
                          #{index + 1}
                        </span>
                        <Badge
                          className={cn(
                            "text-[10px] px-1.5 py-0",
                            DIFFICULTY_COLORS[challenge.difficulty],
                            "text-white",
                          )}
                        >
                          {DIFFICULTY_LABELS[challenge.difficulty]}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] px-1.5 py-0",
                            STATUS_CONFIG[challenge.status].color,
                          )}
                        >
                          {STATUS_CONFIG[challenge.status].label}
                        </Badge>
                      </div>
                      <p
                        className={cn(
                          "text-sm font-medium mt-1 truncate",
                          isSelected && "text-primary",
                        )}
                      >
                        {challenge.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          {challenge.baseXpReward}
                        </span>
                        <span className="flex items-center gap-1">
                          <Coins className="h-3 w-3" />
                          {challenge.bonusCoins}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>

          {/* Legend */}
          <div className="border-t p-3 shrink-0">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                const Icon = config.icon;
                const count = challengesWithStatus.filter(
                  (c) => c.status === key,
                ).length;
                return (
                  <div
                    key={key}
                    className="flex items-center gap-1.5 text-muted-foreground"
                  >
                    <Icon className="h-3 w-3" />
                    <span>
                      {config.label} ({count})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 border rounded-lg bg-card flex flex-col overflow-hidden",
        )}
      >
        {selectedChallenge && !isLoadingSubmissionData ? (
          <ChallengeContent
            challenge={selectedChallenge}
            submission={selectedChallenge.submission}
            hasSubmissionSummary={Boolean(selectedSubmissionSummary)}
            currentIndex={selectedIndex}
            totalCount={challengesWithStatus.length}
            onPrevious={goToPrevious}
            onNext={goToNext}
            onSkip={skipToNext}
            onToggleList={() => setShowList(!showList)}
            showList={showList}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}

interface ChallengeContentProps {
  challenge: ChallengeWithStatus;
  submission?: Submission | null;
  hasSubmissionSummary: boolean;
  currentIndex: number;
  totalCount: number;
  onPrevious: () => void;
  onNext: () => void;
  onSkip: () => void;
  onToggleList: () => void;
  showList: boolean;
}

interface NavigationBarProps {
  currentIndex: number;
  totalCount: number;
  onPrevious: () => void;
  onNext: () => void;
  onSkip: () => void;
  onToggleList: () => void;
  showList: boolean;
}

function NavigationBar({
  currentIndex,
  totalCount,
  onPrevious,
  onNext,
  onSkip,
  onToggleList,
  showList,
}: NavigationBarProps) {
  return (
    <div className="flex items-center justify-between border-b px-4 py-2 bg-muted/30 shrink-0">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleList}
          className="gap-1.5"
        >
          {showList ? (
            <>
              <PanelLeftClose className="h-4 w-4" />
              Hide
            </>
          ) : (
            <>
              <PanelLeftOpen className="h-4 w-4" />
              Show
            </>
          )}
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <span className="text-sm text-muted-foreground">
          Problem {currentIndex + 1} of {totalCount}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSkip}
          disabled={currentIndex === totalCount - 1}
          className="gap-1"
        >
          <SkipForward className="h-4 w-4" />
          Skip
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
          disabled={currentIndex === totalCount - 1}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function ChallengeContent({
  challenge,
  submission,
  hasSubmissionSummary,
  currentIndex,
  totalCount,
  onPrevious,
  onNext,
  onSkip,
  onToggleList,
  showList,
}: ChallengeContentProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [code, setCode] = useState(challenge.starterCode ?? "");
  const [explanation, setExplanation] = useState("");
  const [explanationLanguage] = useState(DEFAULT_LANGUAGE);
  const [justSubmitted, setJustSubmitted] = useState(false);

  // Reset code when challenge changes
  const [lastChallengeId, setLastChallengeId] = useState(challenge.id);
  if (challenge.id !== lastChallengeId) {
    setCode(challenge.starterCode ?? "");
    setExplanation("");
    setJustSubmitted(false);
    setLastChallengeId(challenge.id);
  }

  const hasSubmitted = hasSubmissionSummary || !!submission || justSubmitted;
  const isFailedSubmission =
    submission?.status === "FAILED" || challenge.status === "failed";
  const isExplanationValid = explanation.length >= 50;

  const submitMutation = useMutation({
    mutationFn: () =>
      submitCode({
        challengeId: challenge.id,
        code,
        explanation,
        explanationLanguage,
      }),
    onSuccess: (data) => {
      // Mark as submitted immediately to prevent double submissions
      setJustSubmitted(true);
      // Invalidate the submission query so it refetches
      queryClient.invalidateQueries({
        queryKey: ["my-submissions"],
      });
      queryClient.invalidateQueries({
        queryKey: ["submission", data.id],
      });
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

  // Calculate after submitMutation is defined
  const isSubmitDisabled =
    !code.trim() ||
    !isExplanationValid ||
    !explanationLanguage ||
    isFailedSubmission ||
    hasSubmitted ||
    submitMutation.isPending ||
    submitMutation.isSuccess;

  // If submitted but details not loaded yet, show loading state
  if (hasSubmitted && !submission) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If submitted, show results view
  if (hasSubmitted && submission) {
    return (
      <>
        <NavigationBar
          currentIndex={currentIndex}
          totalCount={totalCount}
          onPrevious={onPrevious}
          onNext={onNext}
          onSkip={onSkip}
          onToggleList={onToggleList}
          showList={showList}
        />
        <div className="flex-1 min-h-0 overflow-hidden">
          <SubmissionResultsContent
            submission={submission}
            challenge={challenge}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <NavigationBar
        currentIndex={currentIndex}
        totalCount={totalCount}
        onPrevious={onPrevious}
        onNext={onNext}
        onSkip={onSkip}
        onToggleList={onToggleList}
        showList={showList}
      />
      <div className="flex-1 min-h-0 overflow-hidden">
        <ResizablePanelGroup orientation="horizontal">
          {/* Left Panel - Problem Description */}
          <ResizablePanel defaultSize={45} minSize={30}>
            <div className="flex h-full flex-col overflow-hidden">
              {/* Header */}
              <div className="border-b px-4 py-3 shrink-0">
                <div className="flex items-center gap-3">
                  <h1 className="text-lg font-semibold">{challenge.title}</h1>
                  <Badge
                    className={`${DIFFICULTY_COLORS[challenge.difficulty]} text-white`}
                  >
                    {DIFFICULTY_LABELS[challenge.difficulty]}
                  </Badge>
                </div>
                {challenge.weekNumber && challenge.year && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Week {challenge.weekNumber}, {challenge.year}
                  </p>
                )}
              </div>

              {/* Tabs */}
              <Tabs
                defaultValue="description"
                className="flex-1 flex flex-col min-h-0"
              >
                <TabsList variant="line" className="px-4 pt-2 shrink-0">
                  <TabsTrigger value="description" className="gap-1.5">
                    <FileText className="h-4 w-4" />
                    Description
                  </TabsTrigger>
                  <TabsTrigger value="testcases" className="gap-1.5">
                    <TestTube className="h-4 w-4" />
                    Test Cases
                  </TabsTrigger>
                  <TabsTrigger value="rewards" className="gap-1.5">
                    <Trophy className="h-4 w-4" />
                    Rewards
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="description"
                  className="flex-1 mt-0 min-h-0"
                >
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-4">
                      <div>
                        <h3 className="font-medium text-sm text-muted-foreground mb-2">
                          Overview
                        </h3>
                        <p className="text-sm leading-relaxed">
                          {challenge.description}
                        </p>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="font-medium text-sm text-muted-foreground mb-2">
                          Problem Statement
                        </h3>
                        <div className="bg-muted rounded-lg p-4 whitespace-pre-wrap text-sm leading-relaxed">
                          {challenge.problemStatement}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="testcases" className="flex-1 mt-0 min-h-0">
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-3">
                      {challenge.testCases && challenge.testCases.length > 0 ? (
                        challenge.testCases.map((testCase, index) => {
                          const expectedOutput =
                            testCase.expectedOutput ??
                            (testCase as { expected_output?: unknown })
                              .expected_output ??
                            (testCase as { expected?: unknown }).expected ??
                            (testCase as { output?: unknown }).output;

                          return (
                            <div
                              key={index}
                              className="bg-muted rounded-lg p-4 space-y-2"
                            >
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                                  Example {index + 1}
                                </span>
                              </div>
                              <div className="space-y-1 font-mono text-sm">
                                <div>
                                  <span className="text-muted-foreground">
                                    Input:{" "}
                                  </span>
                                  <span className="text-foreground">
                                    {testCase.input}
                                  </span>
                                </div>
                                {expectedOutput !== undefined &&
                                  expectedOutput !== null && (
                                    <div>
                                      <span className="text-muted-foreground">
                                        Expected:{" "}
                                      </span>
                                      <span className="text-green-600 dark:text-green-400">
                                        {String(expectedOutput)}
                                      </span>
                                    </div>
                                  )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No test cases available for this challenge.
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="rewards" className="flex-1 mt-0 min-h-0">
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-4">
                      <div className="grid gap-4">
                        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                          <div className="p-3 bg-blue-500/10 rounded-full">
                            <Zap className="h-6 w-6 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold">
                              {challenge.baseXpReward} XP
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Base experience reward
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                          <div className="p-3 bg-yellow-500/10 rounded-full">
                            <Coins className="h-6 w-6 text-yellow-500" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold">
                              {challenge.bonusCoins} Coins
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Bonus coins on completion
                            </p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="text-sm text-muted-foreground space-y-2">
                        <p>
                          <strong>Tip:</strong> Write a clear explanation in
                          your native language to earn bonus XP and coins from
                          the review!
                        </p>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Code Editor & Submission */}
          <ResizablePanel defaultSize={55} minSize={35}>
            <div className="flex h-full flex-col overflow-hidden">
              {/* Code Editor Header */}
              <div className="flex items-center justify-between border-b px-4 py-2 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Python</span>
                  <Badge variant="outline" className="text-xs">
                    solution.py
                  </Badge>
                </div>
              </div>

              {/* Code Editor */}
              <div className="flex-1 min-h-0">
                <CodeEditor value={code} onChange={setCode} height="100%" />
              </div>

              {/* Explanation Section */}
              <div className="border-t shrink-0">
                <div className="px-4 py-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <Label
                      htmlFor={`explanation-${challenge.id}`}
                      className="text-sm font-medium"
                    >
                      Explain Your Code
                      <span className="ml-2 text-xs text-muted-foreground font-normal">
                        ({explanation.length}/50 min)
                      </span>
                    </Label>
                  </div>
                  <Textarea
                    id={`explanation-${challenge.id}`}
                    placeholder={`Explain how your code works in ${DEFAULT_LANGUAGE}...`}
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    rows={3}
                    className={cn(
                      "resize-none text-sm",
                      !isExplanationValid && explanation.length > 0
                        ? "border-red-500 focus-visible:ring-red-500"
                        : "",
                    )}
                  />
                  {!isExplanationValid && explanation.length > 0 && (
                    <p className="text-xs text-red-500">
                      {50 - explanation.length} more characters needed
                    </p>
                  )}
                </div>

                {/* Submit Section */}
                <div className="flex items-center justify-between border-t px-4 py-3 bg-muted/30">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>
                      Your code will be evaluated by AI (not executed)
                    </span>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button disabled={isSubmitDisabled}>
                        {submitMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : hasSubmitted ? (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Submitted
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Submit
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Submit your solution?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Your code and explanation will be sent for evaluation.
                          You can submit up to 5 times per hour.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={submitMutation.isPending}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => submitMutation.mutate()}
                          disabled={
                            isFailedSubmission ||
                            submitMutation.isPending ||
                            submitMutation.isSuccess
                          }
                        >
                          {submitMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            "Submit"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  );
}

function SubmissionResultsContent({
  submission,
  challenge,
}: {
  submission: Submission;
  challenge: Challenge;
}) {
  const {
    aiScore,
    aiFeedback,
    aiAnalysis,
    aiSuggestions,
    status,
    code,
    xpEarned,
    coinsEarned,
  } = submission;

  const isPending = status === "PENDING" || status === "ONGOING";

  return (
    <ResizablePanelGroup orientation="horizontal">
      {/* Left Panel - Problem & Results */}
      <ResizablePanel defaultSize={45} minSize={30}>
        <div className="flex h-full flex-col overflow-hidden">
          {/* Header */}
          <div className="border-b px-4 py-3 shrink-0">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold">{challenge.title}</h1>
              <Badge
                className={`${DIFFICULTY_COLORS[challenge.difficulty]} text-white`}
              >
                {DIFFICULTY_LABELS[challenge.difficulty]}
              </Badge>
              {status === "COMPLETED" && (
                <Badge className="bg-green-500 text-white">Passed</Badge>
              )}
              {status === "FAILED" && (
                <Badge className="bg-red-500 text-white">Failed</Badge>
              )}
              {isPending && (
                <Badge variant="secondary">
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Evaluating
                </Badge>
              )}
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="results" className="flex-1 flex flex-col min-h-0">
            <TabsList variant="line" className="px-4 pt-2 shrink-0">
              <TabsTrigger value="results" className="gap-1.5">
                <CheckCircle className="h-4 w-4" />
                Results
              </TabsTrigger>
              <TabsTrigger value="description" className="gap-1.5">
                <FileText className="h-4 w-4" />
                Problem
              </TabsTrigger>
            </TabsList>

            <TabsContent value="results" className="flex-1 mt-0 min-h-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {/* Locked Notice */}
                  <Alert>
                    <Lock className="h-4 w-4" />
                    <AlertTitle>Submission Locked</AlertTitle>
                    <AlertDescription>
                      You have already submitted a solution for this challenge.
                      {isPending && " Your submission is being evaluated."}
                    </AlertDescription>
                  </Alert>

                  {/* Score */}
                  {!isPending && aiScore !== undefined && (
                    <div className="flex items-center justify-center py-6">
                      <div className="text-center">
                        <div
                          className={cn(
                            "text-5xl font-bold",
                            aiScore >= 70 ? "text-green-500" : "text-red-500",
                          )}
                        >
                          {aiScore}%
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Overall Score
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rewards Earned */}
                  {!isPending &&
                    (xpEarned !== undefined || coinsEarned !== undefined) && (
                      <div className="flex gap-4 justify-center py-3 bg-muted/50 rounded-lg">
                        {xpEarned !== undefined && xpEarned > 0 && (
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-purple-500" />
                            <span className="font-semibold">
                              +{xpEarned} XP
                            </span>
                          </div>
                        )}
                        {coinsEarned !== undefined && coinsEarned > 0 && (
                          <div className="flex items-center gap-2">
                            <Coins className="h-5 w-5 text-yellow-500" />
                            <span className="font-semibold">
                              +{coinsEarned} Coins
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                  {/* Analysis Breakdown */}
                  {!isPending && aiAnalysis && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm">Score Breakdown</h3>
                      <div className="space-y-3">
                        <MetricBar
                          label="Correctness"
                          value={aiAnalysis.correctness}
                        />
                        <MetricBar
                          label="Code Quality"
                          value={aiAnalysis.codeQuality}
                        />
                        <MetricBar
                          label="Efficiency"
                          value={aiAnalysis.efficiency}
                        />
                        <MetricBar label="Style" value={aiAnalysis.style} />
                      </div>
                    </div>
                  )}

                  {/* Feedback */}
                  {!isPending && aiFeedback && (
                    <div>
                      <h3 className="font-semibold text-sm mb-2">Feedback</h3>
                      <div className="bg-muted rounded-lg p-4 text-sm">
                        {aiFeedback}
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {!isPending && aiSuggestions && aiSuggestions.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        Suggestions for Improvement
                      </h3>
                      <ul className="space-y-2">
                        {aiSuggestions.map((suggestion, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <span className="text-primary font-medium">
                              {index + 1}.
                            </span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Pending State */}
                  {isPending && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground">
                        Your submission is being evaluated by AI...
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        This may take a moment
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="description" className="flex-1 mt-0 min-h-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-2">
                      Overview
                    </h3>
                    <p className="text-sm leading-relaxed">
                      {challenge.description}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-2">
                      Problem Statement
                    </h3>
                    <div className="bg-muted rounded-lg p-4 whitespace-pre-wrap text-sm leading-relaxed">
                      {challenge.problemStatement}
                    </div>
                  </div>

                  {challenge.testCases && challenge.testCases.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-medium text-sm text-muted-foreground mb-2">
                          Test Cases
                        </h3>
                        <div className="space-y-2">
                          {challenge.testCases.map((testCase, index) => {
                            const expectedOutput =
                              testCase.expectedOutput ??
                              (testCase as { expected_output?: unknown })
                                .expected_output ??
                              (testCase as { expected?: unknown }).expected ??
                              (testCase as { output?: unknown }).output;

                            return (
                              <div
                                key={index}
                                className="bg-muted rounded-lg p-3 font-mono text-sm"
                              >
                                <span className="text-muted-foreground">
                                  Input:
                                </span>{" "}
                                {testCase.input}
                                {expectedOutput !== undefined &&
                                  expectedOutput !== null && (
                                    <>
                                      <br />
                                      <span className="text-muted-foreground">
                                        Expected:
                                      </span>{" "}
                                      {String(expectedOutput)}
                                    </>
                                  )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Right Panel - Submitted Code (Read-only) */}
      <ResizablePanel defaultSize={55} minSize={35}>
        <div className="flex h-full flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-2 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Your Submitted Code</span>
              {status === "COMPLETED" && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              {status === "FAILED" && (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              {isPending && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            <Badge variant="outline" className="text-xs">
              Read Only
            </Badge>
          </div>

          {/* Read-only Code Display */}
          <div className="flex-1 min-h-0 bg-muted/30">
            <ScrollArea className="h-full">
              <pre className="p-4 font-mono text-sm whitespace-pre-wrap">
                {code}
              </pre>
            </ScrollArea>
          </div>

          {/* Explanation Display */}
          {submission.explanation && (
            <div className="border-t px-4 py-3 bg-muted/30 shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Your Explanation</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {submission.explanation}
              </p>
            </div>
          )}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
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
