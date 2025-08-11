"use client";

import { Smile, Frown, Meh } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MoodSelectorProps {
  currentMood: string | undefined;
  setCurrentMood: (mood: string) => void;
}

export const MoodSelector = ({
  currentMood,
  setCurrentMood,
}: MoodSelectorProps) => (
  <div className="flex flex-col gap-2">
    <p className="text-sm font-medium">How are you feeling today?</p>
    <div className="flex gap-4 justify-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setCurrentMood("happy")}
              className={`flex flex-col items-center p-2 rounded-full transition-colors ${
                currentMood === "happy" ? "bg-green-100" : "hover:bg-gray-100"
              }`}
            >
              <Smile className="h-8 w-8 text-green-500" />
              <span className="text-xs mt-1">Good</span>
            </button>
          </TooltipTrigger>
          <TooltipContent>I'm feeling good today</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setCurrentMood("neutral")}
              className={`flex flex-col items-center p-2 rounded-full transition-colors ${
                currentMood === "neutral" ? "bg-blue-100" : "hover:bg-gray-100"
              }`}
            >
              <Meh className="h-8 w-8 text-blue-500" />
              <span className="text-xs mt-1">Okay</span>
            </button>
          </TooltipTrigger>
          <TooltipContent>I'm feeling neutral today</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setCurrentMood("sad")}
              className={`flex flex-col items-center p-2 rounded-full transition-colors ${
                currentMood === "sad" ? "bg-amber-100" : "hover:bg-gray-100"
              }`}
            >
              <Frown className="h-8 w-8 text-amber-500" />
              <span className="text-xs mt-1">Low</span>
            </button>
          </TooltipTrigger>
          <TooltipContent>I'm not feeling great today</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </div>
);
