"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  PenLine,
  Download,
  History,
  Settings,
  ChevronLeft,
  RefreshCw,
  Menu,
  FileText,
  Brain,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportSessionAsText } from "@/lib/utils/utils";
import { useSessionStore, useAppStore } from "@/stores";

interface SessionControlsProps {
  shareSessionLink: () => void;
  createNewSession: () => void;
  messages: string[];
  sessionDate: Date;
}

export function SessionControls({
  shareSessionLink,
  createNewSession,
  messages,
  sessionDate,
}: SessionControlsProps) {
  const { addNotification } = useAppStore();
  const {
    showHistory,
    setShowHistory,
    isNotesOpen,
    setIsNotesOpen,
    setIsSettingsOpen,
    showInsightsModal,
    setShowInsightsModal,
    hasNewInsights,
    setHasNewInsights,
    sessionGoals,
    sessionTheme,
    sessionNotes,
  } = useSessionStore();

  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  const handleOpenInsights = () => {
    setShowInsightsModal(true);
    setHasNewInsights(false);
  };

  const handleExportSessionAsText = () => {
    exportSessionAsText(
      sessionGoals,
      messages,
      sessionTheme,
      sessionDate,
      sessionNotes
    );
    addNotification({
      title: "Session Exported",
      description: "Your session has been exported as a text file.",
      variant: "success",
    });
  };

  const getInsightsStatus = () => {
    const userMessageCount = messages.filter((msg) => {
      return (
        typeof msg === "string" ||
        (typeof msg === "object" && msg.sender === "user")
      );
    }).length;

    if (userMessageCount < 3) {
      return {
        available: false,
        reason: `Need ${3 - userMessageCount} more messages`,
      };
    }

    return {
      available: true,
      reason: hasNewInsights ? "New insights available!" : "Ready for analysis",
    };
  };

  const insightsStatus = getInsightsStatus();

  return (
    <div className="flex items-center gap-2 mb-4 flex-wrap">
      {/* History Button */}
      <Button
        variant={showHistory ? "default" : "outline"}
        size="sm"
        onClick={() => setShowHistory(!showHistory)}
        className={`transition-all duration-200 ${
          showHistory
            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
            : "hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
        }`}
      >
        {showHistory ? (
          <ChevronLeft className="mr-1 h-4 w-4" />
        ) : (
          <History className="mr-1 h-4 w-4" />
        )}
        {showHistory ? "Back" : "History"}
      </Button>

      {/* Notes Button */}
      <Button
        variant={isNotesOpen ? "default" : "outline"}
        size="sm"
        onClick={() => setIsNotesOpen(!isNotesOpen)}
        className={`relative transition-all duration-200 ${
          isNotesOpen
            ? "bg-teal-600 hover:bg-teal-700 text-white shadow-md"
            : "hover:bg-teal-50 hover:border-teal-300 hover:text-teal-600"
        }`}
      >
        <PenLine className="mr-1 h-4 w-4" />
        Notes
        {isNotesOpen && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-teal-200 rounded-full animate-pulse" />
        )}
        {!isNotesOpen && (sessionNotes.trim() || sessionGoals.length > 0) && (
          <Badge
            variant="secondary"
            className="ml-1 text-xs bg-teal-100 text-teal-700"
          >
            {sessionGoals.length > 0 ? sessionGoals.length : "✓"}
          </Badge>
        )}
      </Button>

      {/* Options Dropdown */}
      <DropdownMenu onOpenChange={setIsOptionsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant={isOptionsOpen ? "default" : "outline"}
            size="sm"
            className={`relative transition-all duration-200 ${
              isOptionsOpen
                ? "bg-gray-700 hover:bg-gray-800 text-white shadow-md"
                : "hover:bg-gray-50 hover:border-gray-300 hover:text-gray-600"
            }`}
          >
            <Menu className="mr-1 h-4 w-4" />
            Options
            {isOptionsOpen && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-gray-200 rounded-full animate-pulse" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56 bg-white/95 backdrop-blur-sm border shadow-xl"
        >
          <DropdownMenuLabel className="text-gray-700 font-medium">
            Session Actions
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={createNewSession}
            className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50"
          >
            <RefreshCw className="mr-2 h-4 w-4 text-blue-600" />
            <span>New Session</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleExportSessionAsText}
            className="cursor-pointer hover:bg-green-50 focus:bg-green-50"
          >
            <Download className="mr-2 h-4 w-4 text-green-600" />
            <span>Export Conversation</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={shareSessionLink}
            className="cursor-pointer hover:bg-purple-50 focus:bg-purple-50"
          >
            <FileText className="mr-2 h-4 w-4 text-purple-600" />
            <span>Share Session (PDF)</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setIsSettingsOpen(true)}
            className="cursor-pointer hover:bg-orange-50 focus:bg-orange-50"
          >
            <Settings className="mr-2 h-4 w-4 text-orange-600" />
            <span>AI Assistant Settings</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* AI Insights Button */}
      <Button
        variant={showInsightsModal || hasNewInsights ? "default" : "outline"}
        size="sm"
        onClick={handleOpenInsights}
        disabled={!insightsStatus?.available}
        className={`relative transition-all duration-200 ${
          hasNewInsights
            ? "bg-purple-600 hover:bg-purple-700 animate-pulse shadow-lg"
            : showInsightsModal
            ? "bg-purple-600 hover:bg-purple-700 text-white shadow-md"
            : insightsStatus?.available
            ? "hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600"
            : "opacity-50"
        }`}
      >
        <Brain className="mr-2 h-4 w-4" />
        AI Insights
        {showInsightsModal && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-200 rounded-full animate-pulse" />
        )}
        {insightsStatus?.available && (
          <Badge
            variant={hasNewInsights ? "default" : "secondary"}
            className={`ml-2 text-xs transition-all ${
              hasNewInsights
                ? "bg-yellow-400 text-yellow-900 animate-bounce"
                : "bg-green-100 text-green-700"
            }`}
          >
            {hasNewInsights ? (
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                New
              </span>
            ) : (
              "Ready"
            )}
          </Badge>
        )}
        {!insightsStatus?.available && (
          <Badge variant="outline" className="ml-2 text-xs text-gray-500">
            {insightsStatus?.reason}
          </Badge>
        )}
      </Button>

      {/* Session Status Indicator */}
      <div className="hidden md:flex items-center gap-2 ml-auto text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span>Session Active</span>
        </div>
        {messages.length > 0 && (
          <Badge variant="outline" className="text-xs">
            {messages.length} messages
          </Badge>
        )}
      </div>
    </div>
  );
}
