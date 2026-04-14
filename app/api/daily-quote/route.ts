import { NextResponse } from "next/server";
import { getDailyQuote } from "@/lib/services/quote";

/**
 * Next.js revalidates this route's cache every 24 h (86400 s).
 * The upstream fetch inside getDailyQuote() also carries
 * `next: { revalidate: 86400 }`, so ZenQuotes is hit at most once a day.
 */
export const revalidate = 86400;

export async function GET() {
  try {
    const quote = await getDailyQuote();
    return NextResponse.json([{ q: quote.text, a: "" }]);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch quote" },
      { status: 500 },
    );
  }
}
