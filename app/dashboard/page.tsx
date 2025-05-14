"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowRight,
  BarChart,
  BookOpen,
  Calendar,
  MessageSquare,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  interface Mood {
    mood: string;
    timestamp: string;
  }

  const [lastMood, setLastMood] = useState<Mood | null>(null);
  const [therapySessions, setTherapySessions] = useState(0);
  const [journalEntries, setJournalEntries] = useState(0);
  const [streak, setStreak] = useState(0);

  const [loading, setLoading] = useState(true);
  const [tip, setTip] = useState("Loading...");

  useEffect(() => {
    const fetchTip = async () => {
      try {
        const res = await fetch("https://zenquotes.io/api/today");
        const data = await res.json();
        setTip(`${data[0]?.q} — ${data[0]?.a}`);
      } catch (err) {
        console.error("Failed to fetch tip:", err);
        setTip("Take a moment to breathe and be present.");
      }
    };

    fetchTip();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      setLoading(true);

      try {
        // ✅ Mood
        const moodDoc = await getDoc(doc(db, "moods", user.uid));
        if (moodDoc.exists()) {
          const moodData = moodDoc.data();
          const entries = moodData.entries || [];
          if (entries.length > 0) {
            setLastMood(entries[entries.length - 1]);

            // Optional: Simple streak logic
            const today = new Date().toDateString();
            const days = new Set(
              entries.map((e: any) => new Date(e.timestamp).toDateString())
            );
            setStreak(days.has(today) ? days.size : 0);
          }
        }

        // ✅ Journal entries (from subcollection)
        const journalSnapshot = await getDocs(
          collection(db, "users", user.uid, "journal")
        );
        setJournalEntries(journalSnapshot.size);

        // ✅ Therapy sessions (from "chats" subcollection)
        const chatSnapshot = await getDocs(
          collection(db, "users", user.uid, "chats")
        );
        setTherapySessions(chatSnapshot.size);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
      </div>
    );
  }

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Good {getTimeOfDay()}, {user?.displayName?.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome to your mental health dashboard
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Mood</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lastMood ? lastMood.mood : "Not tracked yet"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {lastMood
                ? `Last updated: ${new Date(
                    lastMood.timestamp
                  ).toLocaleDateString()}`
                : "Track your first mood"}
            </p>
            <Button variant="link" className="p-0 h-auto mt-2" asChild>
              <Link href="/dashboard/mood">
                Update <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Therapy Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{therapySessions}</div>

            <p className="text-xs text-muted-foreground mt-1">
              {therapySessions === 0
                ? "Start your first session"
                : " Continue your journey"}
            </p>

            <Button variant="link" className="p-0 h-auto mt-2" asChild>
              <Link href="/dashboard/chat">
                Begin therapy <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Journal Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{journalEntries}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Write your thoughts
            </p>
            <Button variant="link" className="p-0 h-auto mt-2" asChild>
              <Link href="/dashboard/journal">
                New entry <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {`${streak} day${streak === 1 ? "" : "s"}`}
            </div>

            <p className="text-xs text-muted-foreground mt-1">
              Keep up your daily check-ins
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Access your most important tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Link href="/dashboard/chat">
                <div className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="mr-4 rounded-full bg-teal-100 p-2">
                    <MessageSquare className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Talk to AI Therapist</h3>
                    <p className="text-sm text-muted-foreground">
                      Start a supportive conversation
                    </p>
                  </div>
                </div>
              </Link>
              <Link href="/dashboard/journal">
                <div className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="mr-4 rounded-full bg-teal-100 p-2">
                    <BookOpen className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Journal Entry</h3>
                    <p className="text-sm text-muted-foreground">
                      Record your thoughts and feelings
                    </p>
                  </div>
                </div>
              </Link>
              <Link href="/dashboard/mood">
                <div className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="mr-4 rounded-full bg-teal-100 p-2">
                    <BarChart className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Track Mood</h3>
                    <p className="text-sm text-muted-foreground">
                      Log how you're feeling today
                    </p>
                  </div>
                </div>
              </Link>
              <Link href="/dashboard/resources">
                <div className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="mr-4 rounded-full bg-teal-100 p-2">
                    <Calendar className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Resources</h3>
                    <p className="text-sm text-muted-foreground">
                      Access helpful mental health content
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Tip</CardTitle>
            <CardDescription>Mental health insight for today</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{tip}</p>
            <Button variant="link" className="p-0 h-auto mt-4" asChild>
              <Link href="/dashboard/resources">
                More tips <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
