"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { doc, getDoc, updateDoc, setDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { analyzeJournalEntry } from "@/lib/ai-service";
import { BookOpen, Lightbulb } from "lucide-react";

export default function JournalPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [insight, setInsight] = useState("");
  const [dataLoading, setDataLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchJournalData = async () => {
      if (!user) return;

      try {
        const journalDoc = await getDoc(
          doc(db, "users", user.uid, "journal", "entries")
        );
        if (journalDoc.exists()) {
          const journalData = journalDoc.data();
          setEntries(journalData.entries || []);
        }
      } catch (error) {
        console.error("Error fetching journal data:", error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchJournalData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || !title || !user) return;

    setLoading(true);

    try {
      const journalEntry = {
        title,
        content,
        timestamp: new Date().toISOString(),
      };

      const journalRef = doc(db, "users", user.uid, "journal", "entries");

      // Check if document exists first
      const docSnap = await getDoc(journalRef);

      if (docSnap.exists()) {
        // Document exists, update it
        await updateDoc(journalRef, {
          entries: arrayUnion(journalEntry),
        });
      } else {
        // Document doesn't exist, create it
        await setDoc(journalRef, {
          entries: [journalEntry],
        });
      }

      // Update local state
      setEntries([...entries, journalEntry]);

      // Reset form
      setTitle("");
      setContent("");
      setInsight("");

      toast({
        title: "Journal entry saved",
        description: "Your journal entry has been saved successfully",
      });
    } catch (error) {
      console.error("Error saving journal entry:", error);
      toast({
        title: "Error",
        description: "Failed to save your journal entry",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAIInsight = async () => {
    if (!content) return;

    setAnalyzing(true);

    try {
      const aiInsight = await analyzeJournalEntry(content);
      setInsight(aiInsight);
    } catch (error) {
      console.error("Error getting AI insight:", error);
      toast({
        title: "Error",
        description: "Failed to analyze your journal entry",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Journal</h1>
        <p className="text-muted-foreground mt-1">
          Express your thoughts and feelings in a private space
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>New Entry</CardTitle>
            <CardDescription>
              Write about your day, thoughts, or feelings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Title
                </label>
                <Input
                  id="title"
                  placeholder="Give your entry a title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">
                  Content
                </label>
                <Textarea
                  id="content"
                  placeholder="What's on your mind today?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  required
                />
              </div>

              {insight && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    <h3 className="font-medium text-yellow-800">AI Insight</h3>
                  </div>
                  <p className="text-sm text-yellow-800">{insight}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={getAIInsight}
                  disabled={!content || analyzing}
                  className="flex-1"
                >
                  {analyzing ? "Analyzing..." : "Get AI Insight"}
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-teal-600 hover:bg-teal-700"
                  disabled={!title || !content || loading}
                >
                  {loading ? "Saving..." : "Save Entry"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Journal History</CardTitle>
              <CardDescription>Your recent journal entries</CardDescription>
            </div>
            <BookOpen className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No journal entries yet</p>
                <p className="text-sm">Write your first entry to see history</p>
              </div>
            ) : (
              <div className="space-y-4">
                {[...entries]
                  .reverse()
                  .slice(0, 5)
                  .map((entry, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium">{entry.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                      <p className="text-sm line-clamp-2">{entry.content}</p>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
