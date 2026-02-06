'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { User, Play, Loader2, CheckCircle, XCircle, Lightbulb, Coins, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { getPendingAnalysis, analyzeSubmission } from '@/lib/api/submissions';
import { ApiClientError } from '@/lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
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
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/lib/constants';
import type { Submission } from '@/types';
import { cn } from '@/lib/utils';

export default function PendingAnalysisPage() {
  const [page, setPage] = useState(1);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<Submission | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['pending-analysis', page],
    queryFn: () => getPendingAnalysis(page, 20),
  });

  const analyzeMutation = useMutation({
    mutationFn: (id: string) => analyzeSubmission(id),
    onMutate: (id) => {
      setAnalyzingId(id);
    },
    onSuccess: (result) => {
      setAnalysisResult(result.submission);
      setResultModalOpen(true);
      toast.success('Analysis completed successfully!');
      queryClient.invalidateQueries({ queryKey: ['pending-analysis'] });
      refetch();
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError ? error.message : 'Failed to analyze submission'
      );
    },
    onSettled: () => {
      setAnalyzingId(null);
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pending AI Analysis</h1>
        <p className="text-muted-foreground">
          Manually trigger AI evaluation for pending submissions (Ollama)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submissions Awaiting Analysis</CardTitle>
          <CardDescription>
            {data?.meta.total || 0} submissions pending AI evaluation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !data?.data.length ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50 text-green-500" />
              <p>All submissions have been analyzed!</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Challenge</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((submission) => {
                    const userName =
                      typeof submission.userId === 'object' && submission.userId !== null
                        ? submission.userId.name
                        : 'Unknown';
                    const studentId =
                      typeof submission.userId === 'object' && submission.userId !== null
                        ? submission.userId.studentId
                        : '';
                    const challengeTitle =
                      typeof submission.challengeId === 'object' && submission.challengeId !== null
                        ? submission.challengeId.title
                        : 'Challenge';
                    const difficulty =
                      typeof submission.challengeId === 'object' && submission.challengeId !== null
                        ? submission.challengeId.difficulty
                        : null;
                    const isAnalyzing = analyzingId === submission.id;

                    return (
                      <TableRow key={submission.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{userName}</div>
                              <div className="text-xs text-muted-foreground">
                                {studentId}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{challengeTitle}</span>
                            {difficulty && (
                              <Badge
                                className={cn(
                                  DIFFICULTY_COLORS[difficulty],
                                  'text-white text-xs'
                                )}
                              >
                                {DIFFICULTY_LABELS[difficulty]}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {submission.explanationLanguage || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(submission.createdAt), 'PP')}
                        </TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                disabled={isAnalyzing || analyzeMutation.isPending}
                              >
                                {isAnalyzing ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Analyzing...
                                  </>
                                ) : (
                                  <>
                                    <Play className="mr-2 h-4 w-4" />
                                    Analyze
                                  </>
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Run AI Analysis?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will send the submission to Ollama for evaluation.
                                  The student will receive XP and coins based on their score.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => analyzeMutation.mutate(submission.id)}
                                >
                                  Run Analysis
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {data.meta.totalPages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      {[...Array(data.meta.totalPages)].map((_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink
                            onClick={() => setPage(i + 1)}
                            isActive={page === i + 1}
                            className="cursor-pointer"
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
                          className={page === data.meta.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results Modal */}
      <Dialog open={resultModalOpen} onOpenChange={setResultModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Analysis Results
              {analysisResult?.status === 'PASSED' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </DialogTitle>
            <DialogDescription>
              {analysisResult?.status === 'PASSED'
                ? 'The submission passed the AI evaluation.'
                : 'The submission did not pass the AI evaluation.'}
            </DialogDescription>
          </DialogHeader>

          {analysisResult && (
            <div className="space-y-4">
              {/* Overall Score */}
              {analysisResult.aiScore !== undefined && (
                <div className="text-center py-4 bg-muted rounded-lg">
                  <div
                    className={cn(
                      'text-5xl font-bold',
                      analysisResult.aiScore >= 70 ? 'text-green-500' : 'text-red-500'
                    )}
                  >
                    {analysisResult.aiScore}%
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Overall Score</div>
                </div>
              )}

              {/* Score Breakdown */}
              {analysisResult.aiAnalysis && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Score Breakdown</h4>
                  <div className="grid gap-3">
                    <MetricBar label="Correctness" value={analysisResult.aiAnalysis.correctness} />
                    <MetricBar label="Code Quality" value={analysisResult.aiAnalysis.codeQuality} />
                    <MetricBar label="Efficiency" value={analysisResult.aiAnalysis.efficiency} />
                    <MetricBar label="Style" value={analysisResult.aiAnalysis.style} />
                  </div>
                </div>
              )}

              {/* Rewards Earned */}
              {(analysisResult.xpEarned !== undefined || analysisResult.coinsEarned !== undefined) && (
                <div className="flex gap-4 justify-center py-3 bg-muted/50 rounded-lg">
                  {analysisResult.xpEarned !== undefined && (
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      <span className="font-semibold">+{analysisResult.xpEarned} XP</span>
                    </div>
                  )}
                  {analysisResult.coinsEarned !== undefined && (
                    <div className="flex items-center gap-2">
                      <Coins className="h-5 w-5 text-yellow-500" />
                      <span className="font-semibold">+{analysisResult.coinsEarned} Coins</span>
                    </div>
                  )}
                </div>
              )}

              {/* Feedback */}
              {analysisResult.aiFeedback && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Feedback</h4>
                  <div className="bg-muted rounded-lg p-3 text-sm">
                    {analysisResult.aiFeedback}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {analysisResult.aiSuggestions && analysisResult.aiSuggestions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    Suggestions
                  </h4>
                  <ul className="space-y-1.5">
                    {analysisResult.aiSuggestions.map((suggestion, index) => (
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
            </div>
          )}

          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
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
            '--progress-background':
              value >= 70 ? '#22c55e' : value >= 50 ? '#eab308' : '#ef4444',
          } as React.CSSProperties
        }
      />
    </div>
  );
}
