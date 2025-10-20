
'use client';

import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Contribution } from "@/lib/data";
import { useEffect, useState } from "react";

export function ContributionProgress({ contribution }: { contribution: Contribution }) {
  const [progress, setProgress] = useState(0);
  const percentage = (contribution.paidMonths / contribution.totalMonths) * 100;

  useEffect(() => {
    // Animate the progress bar on mount
    const timer = setTimeout(() => setProgress(percentage), 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contribution Status</CardTitle>
        <CardDescription>
          Your payment status for the current year.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
            <Progress value={progress} className="h-4 bg-destructive/20 [&>div]:bg-destructive" />
            <p className="text-sm font-medium text-right text-muted-foreground">
                {contribution.paidMonths} / {contribution.totalMonths} months paid
            </p>
        </div>
      </CardContent>
    </Card>
  );
}
