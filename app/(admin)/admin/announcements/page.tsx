'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Link from 'next/link';
import { format } from 'date-fns';
import { Plus, Edit, Trash2, Pin, PinOff, Eye, EyeOff } from 'lucide-react';

import {
  getAnnouncements,
  deleteAnnouncement,
  publishAnnouncement,
  unpublishAnnouncement,
  togglePin,
} from '@/lib/api/announcements';
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
import { ApiClientError } from '@/lib/api/client';

export default function AdminAnnouncementsPage() {
  const queryClient = useQueryClient();

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: getAnnouncements,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => {
      toast.success('Announcement deleted');
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
    onError: (error) => {
      toast.error(error instanceof ApiClientError ? error.message : 'Failed to delete');
    },
  });

  const publishMutation = useMutation({
    mutationFn: publishAnnouncement,
    onSuccess: () => {
      toast.success('Announcement published');
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
    onError: (error) => {
      toast.error(error instanceof ApiClientError ? error.message : 'Failed to publish');
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: unpublishAnnouncement,
    onSuccess: () => {
      toast.success('Announcement unpublished');
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
    onError: (error) => {
      toast.error(error instanceof ApiClientError ? error.message : 'Failed to unpublish');
    },
  });

  const togglePinMutation = useMutation({
    mutationFn: togglePin,
    onSuccess: () => {
      toast.success('Pin status updated');
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
    onError: (error) => {
      toast.error(error instanceof ApiClientError ? error.message : 'Failed to toggle pin');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Announcements</h1>
          <p className="text-muted-foreground">Manage announcements</p>
        </div>
        <Button asChild>
          <Link href="/admin/announcements/new">
            <Plus className="mr-2 h-4 w-4" />
            New Announcement
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Announcements</CardTitle>
          <CardDescription>{announcements?.length || 0} total</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !announcements?.length ? (
            <p className="text-center py-8 text-muted-foreground">
              No announcements created yet.
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pinned</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {announcements.map((announcement) => (
                    <TableRow key={announcement.id}>
                      <TableCell className="font-medium max-w-xs truncate">
                        {announcement.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant={announcement.isPublished ? 'default' : 'secondary'}>
                          {announcement.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {announcement.isPinned && (
                          <Badge variant="outline">Pinned</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {announcement.publishedAt
                          ? format(new Date(announcement.publishedAt), 'PP')
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              announcement.isPublished
                                ? unpublishMutation.mutate(announcement.id)
                                : publishMutation.mutate(announcement.id)
                            }
                            title={announcement.isPublished ? 'Unpublish' : 'Publish'}
                          >
                            {announcement.isPublished ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => togglePinMutation.mutate(announcement.id)}
                            title={announcement.isPinned ? 'Unpin' : 'Pin'}
                          >
                            {announcement.isPinned ? (
                              <PinOff className="h-4 w-4" />
                            ) : (
                              <Pin className="h-4 w-4" />
                            )}
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/announcements/${announcement.id}/edit`}>
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
                                <AlertDialogTitle>Delete Announcement?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the announcement.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate(announcement.id)}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
