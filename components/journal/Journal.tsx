"use client";
import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/lib/hooks/useToast";

import { useAuth } from "@/components/auth-provider";
import {
  analyzeJournalEntry,
  getAdvancedJournalAnalysis,
} from "@/lib/ai/ai-service";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Lightbulb, BookOpen, Eye, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function JournalPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [entries, setEntries] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("");
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchJournal = async () => {
      try {
        const docSnap = await getDoc(
          doc(db, "users", user.uid, "journal", "entries")
        );
        if (docSnap.exists()) {
          setEntries(docSnap.data().entries || []);
        }
      } catch (errorMessage) {
        error({ title: "Error loading entries" });
      } finally {
        setDataLoading(false);
      }
    };
    fetchJournal();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !user) return;

    setLoading(true);

    const journalRef = doc(db, "users", user.uid, "journal", "entries");
    const newEntry = {
      title,
      content,
      tag,
      insight,
      timestamp: new Date().toISOString(),
    };

    try {
      const existing = await getDoc(journalRef);
      if (existing.exists()) {
        await updateDoc(journalRef, {
          entries: arrayUnion(newEntry),
        });
      } else {
        await setDoc(journalRef, { entries: [newEntry] });
      }

      setEntries((prev) => [...prev, newEntry]);
      setTitle("");
      setContent("");
      setTag("");
      setInsight("");

      success({ title: "Entry saved!" });
    } catch (err) {
      error({ title: "Failed to save entry" });
    } finally {
      setLoading(false);
    }
  };

  const getAIInsight = async () => {
    if (!content || !user) return;
    setAnalyzing(true);
    try {
      /* Using advanced analysis if available */
      const analysis = await getAdvancedJournalAnalysis(
        content,
        user.uid,
        entries.map((e) => e.content)
      );

      setInsight(analysis.insight);

      if (analysis.themes.length > 0) {
        console.log("Detected themes:", analysis.themes);
      }

      if (analysis.sentiment) {
        console.log("Sentiment analysis:", analysis.sentiment);
      }
    } catch (err) {
      error({ title: "Advanced analysis failed, using basic:" });
      console.error(err);
      /* Fallback to basic analysis */
      const response = await analyzeJournalEntry(content);
      setInsight(response);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async (entryToDelete: any) => {
    if (!user) return;

    try {
      const ref = doc(db, "users", user.uid, "journal", "entries");
      await updateDoc(ref, {
        entries: arrayRemove(entryToDelete),
      });
      setEntries((prev) => prev.filter((e) => e !== entryToDelete));
      success({ title: "Entry deleted" });
    } catch {
      error({ title: "Failed to delete entry" });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2">My Journal</h1>
      <p className="text-muted-foreground mb-6">Reflect, write, and grow.</p>

      <Tabs defaultValue="new">
        <TabsList className="mb-4">
          <TabsTrigger value="new">New Entry</TabsTrigger>
          <TabsTrigger value="history">My Entries</TabsTrigger>
        </TabsList>

        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle>Create New Entry</CardTitle>
              <CardDescription>
                Jot down your thoughts, feelings, or experiences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit}>
                <Input
                  placeholder="Entry title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <Textarea
                  placeholder="What's on your mind?"
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
                <Input
                  placeholder="Optional tag (e.g. Mood, Work, Travel)"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                />

                {insight && (
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <Lightbulb className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">
                        AI Insight
                      </span>
                    </div>
                    <p className="text-sm text-yellow-800">{insight}</p>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getAIInsight}
                    disabled={!content || analyzing}
                  >
                    {analyzing ? "Analyzing..." : "Get AI Insight"}
                  </Button>
                  <Button
                    type="submit"
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                    disabled={!title || !content || loading}
                  >
                    {loading ? "Saving..." : "Save Entry"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <div>
                <CardTitle>Journal History</CardTitle>
                <CardDescription>Your past reflections</CardDescription>
              </div>
              <BookOpen className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {dataLoading ? (
                <div className="text-center py-8">Loading entries...</div>
              ) : entries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No entries found.
                </div>
              ) : (
                <div className="grid gap-4">
                  {[...entries].reverse().map((entry, i) => (
                    <div
                      key={i}
                      className="p-4 border rounded-md flex justify-between items-start"
                    >
                      <div>
                        <div className="font-medium">{entry.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleDateString()}
                          {entry.tag ? ` • ${entry.tag}` : ""}
                        </div>
                        <p className="text-sm mt-2 line-clamp-2">
                          {entry.content}
                        </p>
                      </div>
                      <div className="flex gap-2 mt-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setSelectedEntry(entry)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => handleDelete(entry)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog
        open={!!selectedEntry}
        onOpenChange={() => setSelectedEntry(null)}
      >
        <DialogContent>
          {selectedEntry && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedEntry.title}</DialogTitle>
              </DialogHeader>
              <div className="text-sm text-muted-foreground mb-2">
                {new Date(selectedEntry.timestamp).toLocaleString()}{" "}
                {selectedEntry.tag && ` • ${selectedEntry.tag}`}
              </div>
              <p className="whitespace-pre-wrap">{selectedEntry.content}</p>
              {selectedEntry.insight && (
                <div className="mt-4 text-sm italic text-yellow-800 bg-yellow-50 p-2 rounded border border-yellow-200">
                  Insight: {selectedEntry.insight}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
