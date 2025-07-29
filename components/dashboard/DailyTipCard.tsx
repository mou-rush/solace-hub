"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";

interface Quote {
  q: string;
  a: string;
}

export function DailyTipCard() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/daily-quote", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setQuote(data[0]);
      } else {
        throw new Error("Invalid response format from API");
      }
    } catch (err) {
      console.error("Error fetching quote:", err);
      setError("Could not load today's quote. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">Daily Tip</CardTitle>
        <CardDescription>Mental health insight for today</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">
            {error}
            <Button
              variant="outline"
              size="sm"
              className="mt-2 mx-auto flex items-center gap-2"
              onClick={fetchQuote}
            >
              <RefreshCw size={16} /> Try Again
            </Button>
          </div>
        ) : quote ? (
          <div className="space-y-4">
            <blockquote className="italic text-lg border-l-4 border-primary pl-4 py-2">
              "{quote.q}"
            </blockquote>
            <p className="text-right font-medium">— {quote.a}</p>
          </div>
        ) : (
          <div className="text-center py-4">No quote available</div>
        )}

        <Button
          asChild
          className="w-full mt-4 flex items-center justify-center gap-2"
        >
          <Link href="/tips">
            More tips <ArrowRight size={16} />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
