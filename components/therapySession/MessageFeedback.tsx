"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import { ThumbsUp, ThumbsDown } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MessageFeedbackProps {
  success: (message: { title: string; description: string }) => void;
  user: any;
  sessionId: string | null;
}

export const MessageFeedback = ({
  success,
  user,
  sessionId,
}: MessageFeedbackProps) => {
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleFeedback = async (value: string) => {
    if (!user || !sessionId) return;

    setFeedback(value);

    success({
      title: "Feedback Recorded",
      description: "Thank you for your feedback on this response.",
    });
  };

  return (
    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 mt-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`px-2 py-0 h-6 ${
                feedback === "helpful" ? "bg-green-100 text-green-700" : ""
              }`}
              onClick={() => handleFeedback("helpful")}
            >
              <ThumbsUp className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>This was helpful</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`px-2 py-0 h-6 ${
                feedback === "unhelpful" ? "bg-red-100 text-red-700" : ""
              }`}
              onClick={() => handleFeedback("unhelpful")}
            >
              <ThumbsDown className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>This wasn't helpful</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
