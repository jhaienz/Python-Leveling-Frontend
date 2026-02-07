'use client';

import { CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Submission } from '@/types';

interface AIFeedbackCardProps {
  submission: Submission;
}

export function AIFeedbackCard({ submission }: AIFeedbackCardProps) {
  const { aiScore, aiFeedback, aiAnalysis, aiSuggestions, status } = submission;

  if (status === 'PENDING' || status === 'ONGOING') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Evaluation</CardTitle>
          <CardDescription>Your code is being evaluated...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-center">
              <div className="h-16 w-16 mx-auto rounded-full bg-muted mb-4" />
              <p className="text-muted-foreground">
                {status === 'PENDING' ? 'Waiting for evaluation...' : 'Evaluation in progress...'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              AI Evaluation
              {status === 'COMPLETED' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </CardTitle>
            <CardDescription>
              {status === 'COMPLETED' ? 'Great job! Your solution passed.' : 'Your solution needs improvement.'}
            </CardDescription>
          </div>
          {aiScore !== undefined && (
            <div className="text-center">
              <div
                className={`text-4xl font-bold ${
                  aiScore >= 70 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {aiScore}%
              </div>
              <div className="text-xs text-muted-foreground">Overall Score</div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
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
            <div className="bg-muted rounded-lg p-4 text-sm">
              {aiFeedback}
            </div>
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
