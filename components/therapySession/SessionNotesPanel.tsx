"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  XCircle,
  Calendar,
  Clock,
  Download,
  Save,
  FileText,
  Loader2,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { exportSessionAsPDF, exportSessionAsText } from "@/lib/utils/utils";
import { useState } from "react";
import { useAppStore } from "@/stores";

interface SessionNotesPanelProps {
  isNotesOpen: boolean;
  sessionTheme: string;
  setSessionTheme: (value: string) => void;
  messages: any[];
  sessionNotes: string;
  saveSessionData: () => void;
  setSessionNotes: (value: string) => void;
  setNewGoal: (value: string) => void;
  newGoal: string;
  addSessionGoal: () => void;
  sessionGoals: string[];
  removeSessionGoal: (index: number) => void;
  sessionDate: Date;
}

export const SessionNotesPanel = ({
  isNotesOpen,
  setSessionTheme,
  saveSessionData,
  setSessionNotes,
  setNewGoal,
  newGoal,
  addSessionGoal,
  removeSessionGoal,

  sessionGoals,
  messages,
  sessionTheme,
  sessionDate,
  sessionNotes,
}: SessionNotesPanelProps) => {
  const { addNotification } = useAppStore();
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const handleExportSessionAsText = () => {
    try {
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
    } catch (err) {
      addNotification({
        title: "Export Failed",
        description: "Failed to export session as text file.",
        variant: "error",
      });
    }
  };

  const handleExportSessionAsPDF = async () => {
    if (isExportingPDF) return;

    setIsExportingPDF(true);
    try {
      await exportSessionAsPDF(
        sessionTheme,
        sessionDate,
        sessionGoals,
        sessionNotes,
        messages
      );
      addNotification({
        title: "PDF Generated",
        description: "Your session has been exported as a PDF file.",
        variant: "success",
      });
    } catch (err) {
      console.error("PDF Export Error:", err);
      addNotification({
        title: "PDF Export Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "error",
      });
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <Card
      className={`transition-all duration-300 overflow-hidden ${
        isNotesOpen ? "max-h-[600px]" : "max-h-0"
      }`}
    >
      <CardContent className="p-4">
        <Tabs defaultValue="notes">
          <TabsList className="mb-4">
            <TabsTrigger value="notes">Session Notes</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="info">Session Info</TabsTrigger>
          </TabsList>

          <TabsContent value="notes">
            <div className="space-y-4">
              <div>
                <label htmlFor="session-theme" className="text-sm font-medium">
                  Session Theme
                </label>
                <Input
                  id="session-theme"
                  value={sessionTheme}
                  onChange={(e) => setSessionTheme(e.target.value)}
                  placeholder="What is this session about?"
                  className="mt-1"
                />
              </div>

              <div>
                <label htmlFor="session-notes" className="text-sm font-medium">
                  Notes
                </label>
                <Textarea
                  id="session-notes"
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="Take notes about your session here..."
                  className="mt-1 min-h-[120px]"
                />
              </div>

              <Button onClick={saveSessionData} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Save Session Details
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="goals">
            <div className="space-y-4">
              <div>
                <label htmlFor="new-goal" className="text-sm font-medium">
                  Add New Goal
                </label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="new-goal"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    placeholder="Enter a new goal or focus area..."
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        addSessionGoal();
                      }
                    }}
                  />
                  <Button onClick={addSessionGoal} disabled={!newGoal.trim()}>
                    Add
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Current Goals</h4>
                {sessionGoals.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No goals set for this session yet.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {sessionGoals.map((goal, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between bg-secondary/50 p-3 rounded-md border border-border/50 hover:bg-secondary/70 transition-colors"
                      >
                        <span className="text-sm flex-1 mr-2">{goal}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSessionGoal(index)}
                          className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                          title="Remove goal"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <Button onClick={saveSessionData} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Save Goals
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="info">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/30 p-3 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Session Date
                  </p>
                  <div className="flex items-center text-sm font-medium">
                    <Calendar className="mr-2 h-4 w-4 text-primary" />
                    {format(sessionDate, "PPP")}
                  </div>
                </div>

                <div className="bg-secondary/30 p-3 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Session Time
                  </p>
                  <div className="flex items-center text-sm font-medium">
                    <Clock className="mr-2 h-4 w-4 text-primary" />
                    {format(sessionDate, "p")}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Session Summary</p>
                <div className="bg-gradient-to-r from-secondary/50 to-secondary/30 p-4 rounded-lg border border-border/50">
                  <h3 className="font-medium text-base mb-2">
                    {sessionTheme || "Untitled Session"}
                  </h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Messages: {messages.length}</p>
                    {sessionGoals.length > 0 && (
                      <p>
                        Goals: {sessionGoals.length} active goal
                        {sessionGoals.length !== 1 ? "s" : ""}
                      </p>
                    )}
                    {sessionNotes.trim() && (
                      <p>Notes: {sessionNotes.length} characters</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleExportSessionAsText}
                  variant="outline"
                  className="flex-1 hover:bg-secondary/80"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export TXT
                </Button>
                <Button
                  onClick={handleExportSessionAsPDF}
                  variant="outline"
                  className="flex-1 hover:bg-secondary/80"
                  disabled={isExportingPDF}
                >
                  {isExportingPDF ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="mr-2 h-4 w-4" />
                  )}
                  {isExportingPDF ? "Generating..." : "Export PDF"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
