import { adminDb } from "@/lib/firebase-admin";

export interface DashboardData {
  lastMood: { mood: string; timestamp: string } | null;
  therapySessions: number;
  journalEntries: number;
  streak: number;
}

export async function getDashboardData(uid: string): Promise<DashboardData> {
  let lastMood: { mood: string; timestamp: string } | null = null;
  let streak = 0;

  const moodDoc = await adminDb.doc(`moods/${uid}`).get();

  if (moodDoc.exists) {
    const entries: { mood: string; timestamp: string }[] =
      moodDoc.data()?.entries ?? [];

    if (entries.length > 0) {
      lastMood = entries[entries.length - 1];

      const today = new Date().toDateString();
      const days = new Set(
        entries.map((e) => new Date(e.timestamp).toDateString()),
      );
      streak = days.has(today) ? days.size : 0;
    }
  }

  const journalSnapshot = await adminDb
    .collection(`users/${uid}/journal`)
    .get();

  let journalEntries = 0;
  journalSnapshot.forEach((doc) => {
    journalEntries += (doc.data().entries ?? []).length;
  });

  const chatSnapshot = await adminDb.collection(`users/${uid}/sessions`).get();

  return {
    lastMood,
    therapySessions: chatSnapshot.size,
    journalEntries,
    streak,
  };
}
