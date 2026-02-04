'use client';

import { Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function WeekendNotice() {
  // Calculate time until next Saturday
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilSaturday = dayOfWeek === 0 ? 6 : 6 - dayOfWeek;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Calendar className="h-8 w-8 text-muted-foreground" />
        </div>
        <CardTitle className="text-2xl">Challenges Available on Weekends</CardTitle>
        <CardDescription className="text-base">
          Weekly Python challenges open every Saturday and Sunday
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        <div className="flex items-center justify-center gap-2 text-lg">
          <Clock className="h-5 w-5 text-primary" />
          <span>
            {daysUntilSaturday === 0 ? (
              <span className="font-medium text-green-600">
                Challenge is available today!
              </span>
            ) : (
              <>
                Next challenge available in{' '}
                <span className="font-bold text-primary">
                  {daysUntilSaturday} day{daysUntilSaturday > 1 ? 's' : ''}
                </span>
              </>
            )}
          </span>
        </div>

        <div className="bg-muted rounded-lg p-4 text-left">
          <h3 className="font-semibold mb-2">What to expect:</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• A new Python coding challenge every week</li>
            <li>• AI-powered code evaluation and feedback</li>
            <li>• Earn XP and level up your skills</li>
            <li>• Collect coins to redeem prizes in the shop</li>
          </ul>
        </div>

        <p className="text-sm text-muted-foreground">
          In the meantime, check out your previous submissions or browse the shop!
        </p>
      </CardContent>
    </Card>
  );
}
