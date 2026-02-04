'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Link from 'next/link';
import { Plus, Edit, Trash2, Power, PowerOff } from 'lucide-react';

import { listChallenges, deleteChallenge, activateChallenge, deactivateChallenge } from '@/lib/api/challenges';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
import { DIFFICULTY_LABELS } from '@/lib/constants';
import { ApiClientError } from '@/lib/api/client';

export default function AdminChallengesPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: challenges, isLoading } = useQuery({
    queryKey: ['admin-challenges', page],
    queryFn: () => listChallenges(page, 20),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteChallenge,
    onSuccess: () => {
      toast.success('Challenge deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
    },
    onError: (error) => {
      toast.error(error instanceof ApiClientError ? error.message : 'Failed to delete');
    },
  });

  const activateMutation = useMutation({
    mutationFn: activateChallenge,
    onSuccess: () => {
      toast.success('Challenge activated');
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
    },
    onError: (error) => {
      toast.error(error instanceof ApiClientError ? error.message : 'Failed to activate');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateChallenge,
    onSuccess: () => {
      toast.success('Challenge deactivated');
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
    },
    onError: (error) => {
      toast.error(error instanceof ApiClientError ? error.message : 'Failed to deactivate');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Challenges</h1>
          <p className="text-muted-foreground">Manage weekly challenges</p>
        </div>
        <Button asChild>
          <Link href="/admin/challenges/new">
            <Plus className="mr-2 h-4 w-4" />
            New Challenge
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Challenges</CardTitle>
          <CardDescription>
            {challenges?.meta.total || 0} total challenges
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !challenges?.data.length ? (
            <p className="text-center py-8 text-muted-foreground">
              No challenges created yet.
            </p>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Week/Year</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {challenges.data.map((challenge) => (
                      <TableRow key={challenge.id}>
                        <TableCell className="font-medium">
                          {challenge.title}
                        </TableCell>
                        <TableCell>
                          {DIFFICULTY_LABELS[challenge.difficulty]}
                        </TableCell>
                        <TableCell>
                          {challenge.weekNumber && challenge.year
                            ? `Week ${challenge.weekNumber}, ${challenge.year}`
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={challenge.isActive ? 'default' : 'secondary'}>
                            {challenge.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {challenge.isActive ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deactivateMutation.mutate(challenge.id)}
                                title="Deactivate"
                              >
                                <PowerOff className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => activateMutation.mutate(challenge.id)}
                                title="Activate"
                              >
                                <Power className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/admin/challenges/${challenge.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Challenge?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the challenge. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteMutation.mutate(challenge.id)}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {challenges.meta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {challenges.meta.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= challenges.meta.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
