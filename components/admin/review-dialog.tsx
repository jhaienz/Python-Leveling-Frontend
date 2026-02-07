'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Code, MessageSquare } from 'lucide-react';

import { reviewSubmission } from '@/lib/api/submissions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CodeEditor } from '@/components/challenge/code-editor';
import type { Submission } from '@/types';
import { ApiClientError } from '@/lib/api/client';

interface ReviewDialogProps {
  submission: Submission | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function ReviewDialog({
  submission,
  open,
  onOpenChange,
  onComplete,
}: ReviewDialogProps) {
  const [explanationScore, setExplanationScore] = useState(70);
  const [bonusXp, setBonusXp] = useState(0);
  const [bonusCoins, setBonusCoins] = useState(0);
  const [feedback, setFeedback] = useState('');

  const reviewMutation = useMutation({
    mutationFn: () => {
      if (!submission) throw new Error('No submission');
      return reviewSubmission(submission.id, {
        explanationScore,
        bonusXp: bonusXp > 0 ? bonusXp : undefined,
        bonusCoins: bonusCoins > 0 ? bonusCoins : undefined,
        feedback: feedback.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast.success('Submission reviewed successfully');
      // Reset form
      setExplanationScore(70);
      setBonusXp(0);
      setBonusCoins(0);
      setFeedback('');
      onComplete();
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError ? error.message : 'Failed to submit review'
      );
    },
  });

  if (!submission) return null;

  const userName =
    typeof submission.userId === 'object' && submission.userId !== null ? submission.userId.name : 'Unknown';
  const studentId =
    typeof submission.userId === 'object' && submission.userId !== null ? submission.userId.studentId : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Review Submission</DialogTitle>
          <DialogDescription>
            Review the student&apos;s code and explanation, then provide feedback and bonus rewards.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Student Info */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{userName}</p>
                <p className="text-sm text-muted-foreground">{studentId}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={submission.status === 'COMPLETED' ? 'default' : 'destructive'}>
                  {submission.status}
                </Badge>
                {submission.aiScore !== undefined && (
                  <Badge variant="outline">AI Score: {submission.aiScore}%</Badge>
                )}
              </div>
            </div>

            <Separator />

            {/* Code */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                <Label>Submitted Code</Label>
              </div>
              <CodeEditor
                value={submission.code}
                onChange={() => {}}
                readOnly
                height="200px"
              />
            </div>

            {/* Explanation */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <Label>
                  Student Explanation
                  {submission.explanationLanguage && (
                    <span className="ml-2 text-muted-foreground">
                      ({submission.explanationLanguage})
                    </span>
                  )}
                </Label>
              </div>
              <div className="bg-muted rounded-lg p-4 whitespace-pre-wrap text-sm">
                {submission.explanation || 'No explanation provided'}
              </div>
            </div>

            <Separator />

            {/* Review Form */}
            <div className="space-y-4">
              <h3 className="font-semibold">Your Review</h3>

              {/* Explanation Score */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Explanation Score</Label>
                  <span className="font-semibold text-primary">{explanationScore}%</span>
                </div>
                <Slider
                  value={[explanationScore]}
                  onValueChange={([value]) => setExplanationScore(value)}
                  min={0}
                  max={100}
                  step={5}
                />
                <p className="text-xs text-muted-foreground">
                  Rate how well the student explained their understanding of the code
                </p>
              </div>

              {/* Bonus Rewards */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bonusXp">Bonus XP (0-500)</Label>
                  <Input
                    id="bonusXp"
                    type="number"
                    min={0}
                    max={500}
                    value={bonusXp}
                    onChange={(e) => setBonusXp(Math.min(500, parseInt(e.target.value) || 0))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bonusCoins">Bonus Coins (0-100)</Label>
                  <Input
                    id="bonusCoins"
                    type="number"
                    min={0}
                    max={100}
                    value={bonusCoins}
                    onChange={(e) => setBonusCoins(Math.min(100, parseInt(e.target.value) || 0))}
                  />
                </div>
              </div>

              {/* Feedback */}
              <div className="space-y-2">
                <Label htmlFor="feedback">Feedback to Student (Optional)</Label>
                <Textarea
                  id="feedback"
                  placeholder="Provide feedback on their explanation..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {feedback.length}/1000 characters
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => reviewMutation.mutate()} disabled={reviewMutation.isPending}>
            {reviewMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
