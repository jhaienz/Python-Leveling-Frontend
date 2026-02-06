'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Send, Loader2, Zap, Coins, AlertTriangle, MessageSquare } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { CodeEditor } from './code-editor';
import { submitCode } from '@/lib/api/submissions';
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/lib/constants';
import type { Challenge } from '@/types';
import { ApiClientError } from '@/lib/api/client';

const LANGUAGES = [
  'Bicol',
  'Tagalog',
  'Cebuano',
  'Ilocano',
  'Hiligaynon',
  'Waray',
  'Pangasinan',
  'Kapampangan',
  'English',
  'Other',
];

interface ChallengeViewProps {
  challenge: Challenge;
}

export function ChallengeView({ challenge }: ChallengeViewProps) {
  const router = useRouter();
  const [code, setCode] = useState(challenge.starterCode);
  const [explanation, setExplanation] = useState('');
  const [explanationLanguage, setExplanationLanguage] = useState('');

  const isExplanationValid = explanation.length >= 50;
  const canSubmit = code.trim() && isExplanationValid && explanationLanguage;

  const submitMutation = useMutation({
    mutationFn: () => submitCode({
      challengeId: challenge.id,
      code,
      explanation,
      explanationLanguage,
    }),
    onSuccess: (data) => {
      toast.success('Code submitted successfully!');
      router.push(`/submissions/${data.id}`);
    },
    onError: (error) => {
      if (error instanceof ApiClientError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to submit code');
      }
    },
  });

  return (
    <div className="space-y-6">
      {/* Challenge Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-2xl">{challenge.title}</CardTitle>
              <CardDescription className="text-base">
                {challenge.description}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
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
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Rewards */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-blue-500" />
              <span>
                <span className="font-semibold">{challenge.baseXpReward}</span> Base XP
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span>
                <span className="font-semibold">{challenge.bonusCoins}</span> Bonus Coins
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
                    <span className="text-muted-foreground">Input:</span>{' '}
                    {testCase.input}
                    {testCase.expectedOutput && (
                      <>
                        <br />
                        <span className="text-muted-foreground">Expected:</span>{' '}
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

      {/* Code Editor */}
      <Card>
        <CardHeader>
          <CardTitle>Your Solution</CardTitle>
          <CardDescription>
            Write your Python code below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CodeEditor
            value={code}
            onChange={setCode}
            height="400px"
          />
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
            Explain your solution in your native language (minimum 50 characters).
            This demonstrates your understanding of the code.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={explanationLanguage} onValueChange={setExplanationLanguage}>
              <SelectTrigger id="language" className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="explanation">
              Explanation
              <span className="ml-2 text-xs text-muted-foreground">
                ({explanation.length}/50 minimum characters)
              </span>
            </Label>
            <Textarea
              id="explanation"
              placeholder="Explain how your code works in your chosen language..."
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={6}
              className={!isExplanationValid && explanation.length > 0 ? 'border-red-500' : ''}
            />
            {!isExplanationValid && explanation.length > 0 && (
              <p className="text-sm text-red-500">
                Explanation must be at least 50 characters ({50 - explanation.length} more needed)
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
                  <AlertDialogAction onClick={() => submitMutation.mutate()}>
                    Submit
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
