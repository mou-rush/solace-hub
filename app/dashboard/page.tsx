"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActionCard } from "@/components/dashboard/ActionCard";
import { DailyTipCard } from "@/components/dashboard/DailyTipCard";
import { QuickActionsGrid } from "@/components/dashboard/QuickActionsGrid";
import {
  BarChart,
  BookOpen,
  MessageSquare,
  Calendar,
  Smile,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();

  const [userData, setUserData] = useState({
    lastMood: null,
    therapySessions: 0,
    journalEntries: 0,
    streak: 0,
  });

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
        const moodDoc = await getDoc(doc(db, "moods", user.uid));
        let lastMood = null;
        let streak = 0;

        if (moodDoc.exists()) {
          const moodData = moodDoc.data();
          const entries = moodData.entries || [];

          if (entries.length > 0) {
            lastMood = entries[entries.length - 1];

            const today = new Date().toDateString();
            const days = new Set(
              entries.map((e) => new Date(e.timestamp).toDateString())
            );
            streak = days.has(today) ? days.size : 0;
          }
        }

        let totalJournalEntries = 0;
        const journalSnapshot = await getDocs(
          collection(db, "users", user.uid, "journal")
        );

        journalSnapshot.forEach((doc) => {
          const data = doc.data();
          const entries = data.entries || [];
          totalJournalEntries += entries.length;
        });

        const chatSnapshot = await getDocs(
          collection(db, "users", user.uid, "sessions")
        );
        console.log("totalJournalEntries", totalJournalEntries);
        setUserData({
          lastMood,
          therapySessions: chatSnapshot.size,
          journalEntries: totalJournalEntries,
          streak,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  };

  const statCards = [
    {
      title: "Current Mood",
      value: userData.lastMood ? userData.lastMood.mood : "Not tracked yet",
      icon: <Smile />,
      subtext: userData.lastMood
        ? `Last updated: ${new Date(
            userData.lastMood.timestamp
          ).toLocaleDateString()}`
        : "Track your first mood",
      linkText: "Update",
      linkHref: "/dashboard/mood",
    },
    {
      title: "Therapy Sessions",
      value: userData.therapySessions,
      icon: <MessageSquare />,
      subtext:
        userData.therapySessions === 0
          ? "Start your first session"
          : "Continue your journey",
      linkText: "Begin therapy",
      linkHref: "/dashboard/chat",
    },
    {
      title: "Journal Entries",
      value: userData.journalEntries,
      icon: <BookOpen />,
      subtext: "Write your thoughts",
      linkText: "New entry",
      linkHref: "/dashboard/journal",
    },
    {
      title: "Streak",
      value: `${userData.streak} day${userData.streak === 1 ? "" : "s"}`,
      icon: <Calendar />,
      subtext: "Keep up your daily check-ins",
    },
  ];

  const quickActions = [
    {
      title: "Talk to AI Therapist",
      description: "Start a supportive conversation",
      icon: <MessageSquare />,
      href: "/dashboard/chat",
    },
    {
      title: "Journal Entry",
      description: "Record your thoughts and feelings",
      icon: <BookOpen />,
      href: "/dashboard/journal",
    },
    {
      title: "Track Mood",
      description: "Log how you're feeling today",
      icon: <BarChart />,
      href: "/dashboard/mood",
    },
    {
      title: "Resources",
      description: "Access helpful mental health content",
      icon: <Calendar />,
      href: "/dashboard/resources",
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <DashboardHeader
        name={user?.displayName?.split(" ")[0]}
        timeOfDay={getTimeOfDay()}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <ActionCard
          title="Quick Actions"
          description="Access your most important tools"
          className="md:col-span-2"
        >
          <QuickActionsGrid actions={quickActions} />
        </ActionCard>

        <DailyTipCard tip={tip} />
      </div>
    </div>
  );
}
