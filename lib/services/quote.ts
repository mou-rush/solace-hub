import { cache } from "react";

const FALLBACK_QUOTE = "Take a moment to breathe and be present.";

export interface DailyQuote {
  text: string;
}

/**
 * Fetches the daily quote from ZenQuotes.
 * `next: { revalidate: 86400 }` lets Next.js cache the response for 24 h at
 * the fetch level, so the external request fires at most once per day per
 * deployment.
 * Wrapped in React `cache()` so multiple server components within the same
 * render that call this receive the same in-flight promise.
 */
export const getDailyQuote = cache(async (): Promise<DailyQuote> => {
  try {
    const res = await fetch("https://zenquotes.io/api/today", {
      next: { revalidate: 86400 },
    });

    if (!res.ok) return { text: FALLBACK_QUOTE };

    const data = await res.json();
    const q = data[0]?.q;
    const a = data[0]?.a;

    if (!q) return { text: FALLBACK_QUOTE };

    return { text: `${q} — ${a}` };
  } catch {
    return { text: FALLBACK_QUOTE };
  }
});
