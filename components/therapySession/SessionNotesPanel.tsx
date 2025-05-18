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
} from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { exportSessionAsText } from "@/lib/utils";

interface SessionNotesPanelProps {
  isNotesOpen: boolean;
  sessionTheme: string;
  setSessionTheme: (value: string) => void;
  messages: string[];
  sessionNotes: string;
  saveSessionData: () => void;
  setSessionNotes: (value: string) => void;
  setNewGoal: (value: string) => void;
  newGoal: string;
  addSessionGoal: () => void;
  sessionGoals: string[];
  removeSessionGoal: (index: number) => void;
  sessionDate: Date;
  shareSessionLink: () => void;
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
  shareSessionLink,
  sessionGoals,
  messages,
  sessionTheme,
  sessionDate,
  sessionNotes,
}: SessionNotesPanelProps) => {
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
                  />
                  <Button onClick={addSessionGoal}>Add</Button>
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
                        className="flex items-center justify-between bg-secondary/50 p-2 rounded-md"
                      >
                        <span className="text-sm">{goal}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSessionGoal(index)}
                          className="h-6 w-6 p-0"
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
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm font-medium">Session Date</p>
                  <div className="flex items-center mt-1 text-sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(sessionDate, "PPP")}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium">Session Time</p>
                  <div className="flex items-center mt-1 text-sm">
                    <Clock className="mr-2 h-4 w-4" />
                    {format(sessionDate, "p")}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium">Session Summary</p>
                <div className="bg-secondary/50 p-3 rounded-md mt-1">
                  <p className="text-sm">
                    {sessionTheme || "Untitled Session"}
                    {sessionGoals.length > 0 && (
                      <>
                        <br />
                        <span className="text-muted-foreground">
                          Working on {sessionGoals.length} goal
                          {sessionGoals.length !== 1 ? "s" : ""}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleExportSessionAsText}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button
                  onClick={shareSessionLink}
                  variant="outline"
                  className="flex-1"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  PDF Report
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
