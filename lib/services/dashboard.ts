import { cache } from "react";

const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents`;

export interface MoodEntry {
  mood: string;
  timestamp: string;
}

export interface DashboardData {
  lastMood: MoodEntry | null;
  therapySessions: number;
  journalEntries: number;
  streak: number;
}

function firestoreArray<T>(
  field: Record<string, unknown> | undefined,
  mapper: (v: Record<string, unknown>) => T,
): T[] {
  const values =
    (
      field as {
        arrayValue?: { values?: Record<string, unknown>[] };
      }
    )?.arrayValue?.values ?? [];
  return values.map(mapper);
}

/**
 * Fetches all dashboard data for a user from Firestore REST API.
 * Wrapped in React `cache()` so multiple server components that need the same
 * uid's data within one render share a single set of network requests.
 */
export const getDashboardData = cache(
  async (uid: string, idToken: string): Promise<DashboardData> => {
    const authHeader = { Authorization: `Bearer ${idToken}` };

    const [moodRes, journalRes, sessionsRes] = await Promise.all([
      fetch(`${FIRESTORE_BASE}/moods/${uid}`, {
        headers: authHeader,
        cache: "no-store",
      }),
      fetch(`${FIRESTORE_BASE}/users/${uid}/journal`, {
        headers: authHeader,
        cache: "no-store",
      }),
      fetch(`${FIRESTORE_BASE}/users/${uid}/sessions`, {
        headers: authHeader,
        cache: "no-store",
      }),
    ]);

    // ── Mood + streak
    let lastMood: MoodEntry | null = null;
    let streak = 0;

    if (moodRes.ok) {
      const moodData = await moodRes.json();
      const entries = firestoreArray(
        moodData.fields?.entries,
        (v: Record<string, unknown>) => {
          const fields = (
            v as {
              mapValue: { fields: Record<string, { stringValue: string }> };
            }
          ).mapValue.fields;
          return {
            mood: fields.mood?.stringValue ?? "",
            timestamp: fields.timestamp?.stringValue ?? "",
          };
        },
      );

      if (entries.length > 0) {
        lastMood = entries[entries.length - 1];
        const today = new Date().toDateString();
        const days = new Set(
          entries.map((e) => new Date(e.timestamp).toDateString()),
        );
        streak = days.has(today) ? days.size : 0;
      }
    }

    // ── Journal entries
    let journalEntries = 0;
    if (journalRes.ok) {
      const journalData = await journalRes.json();
      for (const doc of journalData.documents ?? []) {
        journalEntries += doc.fields?.entries?.arrayValue?.values?.length ?? 0;
      }
    }

    // ── Therapy sessions
    let therapySessions = 0;
    if (sessionsRes.ok) {
      const sessionsData = await sessionsRes.json();
      therapySessions = sessionsData.documents?.length ?? 0;
    }

    return { lastMood, therapySessions, journalEntries, streak };
  },
);
