import { NextResponse } from "next/server";

export const revalidate = 86400;

let quoteCache = {
  data: null,
  timestamp: null,
};

export async function GET() {
  try {
    const now = new Date();

    if (quoteCache.data && quoteCache.timestamp) {
      const cachedDate = new Date(quoteCache.timestamp);

      if (
        cachedDate.getDate() === now.getDate() &&
        cachedDate.getMonth() === now.getMonth() &&
        cachedDate.getFullYear() === now.getFullYear()
      ) {
        console.log("Returning cached quote");
        return NextResponse.json(quoteCache.data);
      }
    }

    console.log("Fetching new quote from API");
    const response = await fetch("https://zenquotes.io/api/today", {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    quoteCache = {
      data,
      timestamp: now.toISOString(),
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching quote:", error);

    if (quoteCache.data) {
      console.log("API call failed, returning cached data");
      return NextResponse.json(quoteCache.data);
    }

    return NextResponse.json(
      { error: "Failed to fetch quote" },
      { status: 500 }
    );
  }
}
