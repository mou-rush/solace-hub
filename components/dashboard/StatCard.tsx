"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { BookOpen, Brain, ChevronRight, Heart, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getMoodStatus } from "@/lib/utils/utils";

interface StatCardProps {
  readonly userData: {
    lastMood?: { mood: string; timestamp: string };
    therapySessions: number;
    journalEntries: number;
    streak: number;
  };
}

export function StatCard({ userData }: StatCardProps) {
  const moodStatus = getMoodStatus(userData);
  const enhancedStatCards = [
    {
      title: "Mental Wellness Score",
      value: userData.lastMood ? userData.lastMood.mood : "Not assessed",
      icon: <Heart className="h-5 w-5" />,
      subtext: userData.lastMood
        ? `Last check: ${new Date(
            userData.lastMood.timestamp
          ).toLocaleDateString()}`
        : "Complete your first mood assessment",
      linkText: "Update Status",
      linkHref: "/dashboard/mood",
      status: moodStatus,
    },
    {
      title: "Active Sessions",
      value: userData.therapySessions,
      icon: <Brain className="h-5 w-5" />,
      subtext:
        userData.therapySessions === 0
          ? "Start your therapeutic journey"
          : `${userData.therapySessions} session${
              userData.therapySessions !== 1 ? "s" : ""
            } completed`,
      linkText: "New Session",
      linkHref: "/dashboard/chat",
      trend: userData.therapySessions > 0 ? "increasing" : "stable",
    },
    {
      title: "Journal Insights",
      value: userData.journalEntries,
      icon: <BookOpen className="h-5 w-5" />,
      subtext:
        userData.journalEntries === 0
          ? "Begin documenting your thoughts"
          : "Tracking your mental health journey",
      linkText: "Write Entry",
      linkHref: "/dashboard/journal",
      trend: userData.journalEntries > 0 ? "increasing" : "stable",
    },
    {
      title: "Consistency Streak",
      value: `${userData.streak} day${userData.streak !== 1 ? "s" : ""}`,
      icon: <TrendingUp className="h-5 w-5" />,
      subtext:
        userData.streak > 0
          ? "Excellent progress! Keep it up"
          : "Start building healthy habits",
      trend:
        userData.streak > 3
          ? "increasing"
          : userData.streak > 0
          ? "stable"
          : "neutral",
    },
  ];
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {enhancedStatCards.map((card, index) => (
        <Card
          key={index}
          className="bg-white/70 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300 group"
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-teal-100 to-blue-100 text-teal-600 group-hover:scale-110 transition-transform">
                  {card.icon}
                </div>
                <div>
                  <CardTitle className="text-sm font-medium text-gray-700">
                    {card.title}
                  </CardTitle>
                  {card.status && (
                    <Badge
                      variant="outline"
                      className={`mt-1 text-xs ${card.status.color} ${card.status.textColor} border-current`}
                    >
                      {card.status.text}
                    </Badge>
                  )}
                </div>
              </div>
              {card.trend && (
                <div
                  className={`p-1 rounded-full ${
                    card.trend === "increasing"
                      ? "text-green-600 bg-green-100"
                      : card.trend === "stable"
                      ? "text-blue-600 bg-blue-100"
                      : "text-gray-600 bg-gray-100"
                  }`}
                >
                  <TrendingUp
                    className={`w-3 h-3 ${
                      card.trend === "neutral" ? "opacity-50" : ""
                    }`}
                  />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {card.value}
            </div>
            <p className="text-xs text-gray-600 mb-3">{card.subtext}</p>
            {card.linkText && card.linkHref && (
              <a
                href={card.linkHref}
                className="inline-flex items-center text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors group"
              >
                {card.linkText}
                <ChevronRight className="ml-1 h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </a>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
