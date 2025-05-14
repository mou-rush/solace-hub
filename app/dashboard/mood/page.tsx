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
import { useToast } from "@/components/ui/use-toast";
import { BarChart } from "lucide-react";

const moodOptions = [
  { value: "😊 Great", label: "Great", emoji: "😊" },
  { value: "😌 Good", label: "Good", emoji: "😌" },
  { value: "😐 Okay", label: "Okay", emoji: "😐" },
  { value: "😔 Low", label: "Low", emoji: "😔" },
  { value: "😢 Struggling", label: "Struggling", emoji: "😢" },
];

export default function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState("");
  const [notes, setNotes] = useState("");
  const [moodHistory, setMoodHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchMoodData = async () => {
      if (!user) return;

      try {
        const moodDoc = await getDoc(doc(db, "moods", user.uid));
        if (moodDoc.exists()) {
          const moodData = moodDoc.data();
          setMoodHistory(moodData.entries || []);
        }
      } catch (error) {
        console.error("Error fetching mood data:", error);
        toast({
          title: "Error",
          description: "Failed to load mood history",
          variant: "destructive",
        });
      } finally {
        setDataLoading(false);
      }
    };

    fetchMoodData();
  }, [user, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood || !user) return;

    setLoading(true);

    try {
      const moodEntry = {
        mood: selectedMood,
        notes: notes,
        timestamp: new Date().toISOString(),
      };

      const moodRef = doc(db, "moods", user.uid);
      const docSnap = await getDoc(moodRef);
      if (docSnap.exists()) {
        await updateDoc(moodRef, {
          entries: arrayUnion(moodEntry),
        });
      } else {
        await setDoc(moodRef, {
          entries: [moodEntry],
        });
      }

      // Update local state
      setMoodHistory([...moodHistory, moodEntry]);

      // Reset form
      setSelectedMood("");
      setNotes("");

      toast({
        title: "Mood tracked",
        description: "Your mood has been recorded successfully",
      });
    } catch (error) {
      console.error("Error saving mood:", error);
      toast({
        title: "Error",
        description: "Failed to save your mood",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Mood Tracker</h1>
        <p className="text-muted-foreground mt-1">
          Track your emotional wellbeing over time
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>How are you feeling today?</CardTitle>
            <CardDescription>
              Select your current mood and add optional notes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-5 gap-2">
                {moodOptions.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={
                      selectedMood === option.value ? "default" : "outline"
                    }
                    className={`h-auto flex flex-col py-4 ${
                      selectedMood === option.value
                        ? "bg-teal-600 hover:bg-teal-700"
                        : ""
                    }`}
                    onClick={() => setSelectedMood(option.value)}
                  >
                    <span className="text-2xl mb-1">{option.emoji}</span>
                    <span className="text-xs">{option.label}</span>
                  </Button>
                ))}
              </div>

              <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-medium">
                  Notes (optional)
                </label>
                <Textarea
                  id="notes"
                  placeholder="What's contributing to your mood today?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700"
                disabled={!selectedMood || loading}
              >
                {loading ? "Saving..." : "Save Mood"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Mood History</CardTitle>
              <CardDescription>Your recent mood entries</CardDescription>
            </div>
            <BarChart className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
              </div>
            ) : moodHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No mood entries yet</p>
                <p className="text-sm">Track your first mood to see history</p>
              </div>
            ) : (
              <div className="space-y-4">
                {[...moodHistory]
                  .reverse()
                  .slice(0, 5)
                  .map((entry, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium">{entry.mood}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                      {entry.notes && <p className="text-sm">{entry.notes}</p>}
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
