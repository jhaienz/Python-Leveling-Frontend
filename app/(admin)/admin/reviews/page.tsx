'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { FileCode, User, MessageSquare } from 'lucide-react';

import { getPendingReviews } from '@/lib/api/submissions';
import { ReviewDialog } from '@/components/admin/review-dialog';
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
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/lib/constants';
import type { Submission } from '@/types';
import { cn } from '@/lib/utils';

export default function PendingReviewsPage() {
  const [page, setPage] = useState(1);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['pending-reviews', page],
    queryFn: () => getPendingReviews(page, 20),
  });

  const handleReviewComplete = () => {
    setSelectedSubmission(null);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pending Reviews</h1>
        <p className="text-muted-foreground">
          Review student explanations and grant bonus rewards
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submissions Awaiting Review</CardTitle>
          <CardDescription>
            {data?.meta.total || 0} submissions pending review
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
              <FileCode className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No submissions pending review</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Challenge</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>AI Score</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((submission) => {
                    const userName =
                      typeof submission.userId === 'object'
                        ? submission.userId.name
                        : 'Unknown';
                    const studentId =
                      typeof submission.userId === 'object'
                        ? submission.userId.studentId
                        : '';
                    const challengeTitle =
                      typeof submission.challengeId === 'object'
                        ? submission.challengeId.title
                        : 'Challenge';
                    const difficulty =
                      typeof submission.challengeId === 'object'
                        ? submission.challengeId.difficulty
                        : null;

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
                        <TableCell>
                          <span className="font-medium">
                            {submission.aiScore ?? '-'}%
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(submission.createdAt), 'PP')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => setSelectedSubmission(submission)}
                          >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Review
                          </Button>
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

      {/* Review Dialog */}
      <ReviewDialog
        submission={selectedSubmission}
        open={!!selectedSubmission}
        onOpenChange={(open) => !open && setSelectedSubmission(null)}
        onComplete={handleReviewComplete}
      />
    </div>
  );
}
