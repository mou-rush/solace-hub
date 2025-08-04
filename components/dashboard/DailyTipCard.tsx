"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
interface DailyTipCardProps {
  userData: {
    therapySessions: number;
    journalEntries: number;
    streak: number;
  };
}

export function DailyTipCard({ userData }: DailyTipCardProps) {
  const [tip, setTip] = useState("Loading...");

  useEffect(() => {
    const fetchTip = async () => {
      try {
        const response = await fetch("https://zenquotes.io/api/today");
        const data = await response.json();
        setTip(`${data[0]?.q} — ${data[0]?.a}`);
      } catch (err) {
        console.error("Failed to fetch tip:", err);
        setTip(
          "Your mental health journey is a marathon, not a sprint. Every small step counts."
        );
      }
    };

    fetchTip();
  }, []);

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            Daily Insight
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <blockquote className="text-sm italic text-gray-700 border-l-4 border-teal-300 pl-4 py-2 bg-teal-50/50 rounded-r-lg">
            {tip}
          </blockquote>
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-800 font-medium">
              💡 Therapeutic Note
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Remember that healing is not linear. Every step forward, no matter
              how small, is progress worth celebrating.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Quick Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">
                This Week
              </span>
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                Active
              </Badge>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">
                  Sessions completed
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {userData.therapySessions}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Journal entries</span>
                <span className="text-sm font-semibold text-gray-900">
                  {userData.journalEntries}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Consistency</span>
                <span className="text-sm font-semibold text-gray-900">
                  {userData.streak} days
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
