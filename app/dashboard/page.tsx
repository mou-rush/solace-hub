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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <DashboardHeader
        userData={userData}
        mood={userData?.lastMood}
        userJournalEntries={userData?.journalEntries}
        userTherapySessions={userData?.therapySessions}
      />

      <StatCard userData={userData} />

      <div className="grid gap-6 md:grid-cols-3">
        <ActionCard />
        <DailyTipCard userData={userData} />
      </div>
    </div>
  );
}
