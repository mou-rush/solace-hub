"use client";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils/utils";

interface Session {
  id: string;
  theme?: string;
  date: Date;
  goals?: string[];
}

interface SessionHistoryProps {
  sessionId: string | null;
  switchToSession: (id: string) => void;
  createNewSession: () => void;
  savedSessions: Session[];
}

export const SessionHistory = ({
  sessionId,
  switchToSession,
  createNewSession,
  savedSessions,
}: SessionHistoryProps) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold">Session History</h2>
      <Button onClick={createNewSession} variant="default" size="sm">
        New Session
      </Button>
    </div>

    {savedSessions.length === 0 ? (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No previous sessions found.</p>
      </div>
    ) : (
      <div className="space-y-2">
        {savedSessions.map((session) => (
          <Card
            key={session.id}
            className={cn(
              "cursor-pointer hover:bg-secondary/50 transition-colors",
              sessionId === session.id ? "border-primary bg-secondary/50" : ""
            )}
            onClick={() => switchToSession(session.id)}
          >
            <CardHeader className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">
                    {session.theme || "Untitled Session"}
                  </CardTitle>
                  <CardDescription>
                    {format(session.date, "PPP")}
                  </CardDescription>
                </div>
                {session.goals && session.goals.length > 0 && (
                  <Badge variant="outline">
                    {session.goals.length} Goal
                    {session.goals.length !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    )}
  </div>
);
