"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ProgressCardProps {
  streak: number;
  progressValue: number;
}

export const ProgressCard = ({ streak, progressValue }: ProgressCardProps) => (
  <div className="mx-3 mb-6">
    <div className="bg-gradient-to-br from-secondary/50 to-secondary/30 backdrop-blur-sm rounded-xl p-4 border border-border/50">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Daily Streak
        </span>
        <Badge
          variant="outline"
          className="bg-primary/10 border-primary/20 text-primary font-semibold"
        >
          {streak} days
        </Badge>
      </div>
      <Progress value={progressValue} className="h-2 mb-2 bg-secondary" />
      <p className="text-xs text-muted-foreground">
        {progressValue}% towards your weekly goal
      </p>
    </div>
  </div>
);
