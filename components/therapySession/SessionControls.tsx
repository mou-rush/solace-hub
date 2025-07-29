"use client";

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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportSessionAsText } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";

type SessionControlsProps = {
  readonly shareSessionLink: () => void;
  readonly setIsSettingsOpen: (isOpen: boolean) => void;
  readonly createNewSession: () => void;
  readonly setShowHistory: (isOpen: boolean) => void;
  readonly showHistory: boolean;
  readonly isNotesOpen: boolean;
  readonly setIsNotesOpen: (isOpen: boolean) => void;
  readonly sessionGoals: string[];
  readonly messages: string[];
  readonly sessionDate: Date;
  readonly sessionTheme: string;
  readonly sessionNotes: string;
};
export function SessionControls({
  shareSessionLink,
  setIsSettingsOpen,
  createNewSession,
  // exportSessionAsText,
  setShowHistory,
  showHistory,
  isNotesOpen,
  setIsNotesOpen,
  sessionGoals,
  messages,
  sessionTheme,
  sessionDate,
  sessionNotes,
}: SessionControlsProps) {
  const { success } = useToast();

  const handleExportSessionAsText = () => {
    exportSessionAsText(
      sessionGoals,
      messages,
      sessionTheme,
      sessionDate,
      sessionNotes
    );
    success({
      title: "Session Exported",
      description: "Your session has been exported as a text file.",
    });
  };
  return (
    <div className="flex items-center gap-2 mb-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowHistory(!showHistory)}
      >
        {showHistory ? (
          <ChevronLeft className="mr-1 h-4 w-4" />
        ) : (
          <History className="mr-1 h-4 w-4" />
        )}
        {showHistory ? "Back" : "History"}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsNotesOpen(!isNotesOpen)}
      >
        <PenLine className="mr-1 h-4 w-4" />
        Notes
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Menu className="mr-1 h-4 w-4" />
            Options
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Session Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={createNewSession}>
            <RefreshCw className="mr-2 h-4 w-4" />
            New Session
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportSessionAsText}>
            <Download className="mr-2 h-4 w-4" />
            Export Conversation
          </DropdownMenuItem>
          <DropdownMenuItem onClick={shareSessionLink}>
            <FileText className="mr-2 h-4 w-4" />
            Share Session (PDF)
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            AI Assistant Settings
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
