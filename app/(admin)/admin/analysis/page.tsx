'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { FileCode, User, Play, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { getPendingAnalysis, analyzeSubmission } from '@/lib/api/submissions';
import { ApiClientError } from '@/lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/lib/constants';
import type { Submission } from '@/types';
import { cn } from '@/lib/utils';

export default function PendingAnalysisPage() {
  const [page, setPage] = useState(1);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
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
    </div>
  );
}
