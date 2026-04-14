import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session");

  if (!sessionCookie?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const verifyUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`;
    const verifyRes = await fetch(verifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: sessionCookie.value }),
    });

    if (!verifyRes.ok) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { users } = await verifyRes.json();
    const uid = users[0]?.localId;

    if (!uid) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const baseUrl = `https://firestore.googleapis.com/v1/projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents`;

    const [moodRes, journalRes, sessionsRes] = await Promise.all([
      fetch(`${baseUrl}/moods/${uid}`, {
        headers: { Authorization: `Bearer ${sessionCookie.value}` },
      }),
      fetch(`${baseUrl}/users/${uid}/journal`, {
        headers: { Authorization: `Bearer ${sessionCookie.value}` },
      }),
      fetch(`${baseUrl}/users/${uid}/sessions`, {
        headers: { Authorization: `Bearer ${sessionCookie.value}` },
      }),
    ]);

    let lastMood = null;
    let streak = 0;

    if (moodRes.ok) {
      const moodData = await moodRes.json();
      const entries = moodData.fields?.entries?.arrayValue?.values ?? [];

      if (entries.length > 0) {
        const lastEntry = entries[entries.length - 1].mapValue.fields;
        lastMood = {
          mood: lastEntry.mood?.stringValue ?? "",
          timestamp: lastEntry.timestamp?.stringValue ?? "",
        };

        const today = new Date().toDateString();
        const days = new Set(
          entries.map((e: any) =>
            new Date(e.mapValue.fields.timestamp.stringValue).toDateString(),
          ),
        );
        streak = days.has(today) ? days.size : 0;
      }
    }

    let journalEntries = 0;
    if (journalRes.ok) {
      const journalData = await journalRes.json();
      const docs = journalData.documents ?? [];
      docs.forEach((doc: any) => {
        journalEntries += doc.fields?.entries?.arrayValue?.values?.length ?? 0;
      });
    }

    let therapySessions = 0;
    if (sessionsRes.ok) {
      const sessionsData = await sessionsRes.json();
      therapySessions = sessionsData.documents?.length ?? 0;
    }

    return NextResponse.json({
      lastMood,
      therapySessions,
      journalEntries,
      streak,
      userName: users[0]?.displayName ?? null,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
