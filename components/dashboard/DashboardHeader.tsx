"use client";
import { Clock, Users, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "../ui/card";

import { getMoodStatus, getTimeOfDay } from "@/lib/utils/utils";
import { useAuthStore } from "@/stores";

interface DashboardHeaderProps {
  userData: {
    lastMood: { mood: string } | null;
    therapySessions: number;
    journalEntries: number;
    streak: number;
  };
}
export function DashboardHeader({ userData }: DashboardHeaderProps) {
  const { user } = useAuthStore();

  const getEngagementLevel = () => {
    const total = userData.therapySessions + userData.journalEntries;
    if (total >= 10)
      return { level: "High", color: "text-green-600", progress: 85 };
    if (total >= 5)
      return { level: "Moderate", color: "text-blue-600", progress: 60 };
    return { level: "Getting Started", color: "text-orange-600", progress: 25 };
  };

  const moodStatus = getMoodStatus(userData);

  const engagement = getEngagementLevel();
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Good {getTimeOfDay()}, {user?.displayName?.split(" ")[0] || "there"}
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Your personalized mental wellness dashboard
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="bg-white/80 text-teal-700 border-teal-200"
          >
            <Clock className="w-3 h-3 mr-1" />
            {new Date().toLocaleDateString()}
          </Badge>
          <Badge className={`${engagement.color} bg-white/80 border`}>
            <Users className="w-3 h-3 mr-1" />
            {engagement.level} Engagement
          </Badge>
        </div>
      </div>
      {/* Wellness Overview Banner */}
      <Card className="bg-gray-50 border-0 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full -translate-y-16 translate-x-16"></div>
        <CardContent className="p-6 relative">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                Mental Health Dashboard
              </h3>
              <p className="text-gray-600 mb-6">
                Real-time wellness monitoring
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`w-2 h-2 rounded-full ${moodStatus.color}`}
                    ></div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Current Mood
                    </span>
                  </div>
                  <div
                    className={`text-sm font-semibold ${moodStatus.textColor}`}
                  >
                    {moodStatus.text}
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-3 h-3 text-gray-400" />
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Engagement
                    </span>
                  </div>
                  <div className={`text-sm font-semibold ${engagement.color}`}>
                    {engagement.level}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {Math.round(engagement.progress)}
                <span className="text-lg text-gray-500">%</span>
              </div>
              <div className="text-xs text-gray-500 mb-3 uppercase tracking-wide">
                Wellness Score
              </div>
              <div className="w-24 h-1 bg-gray-300 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-900 rounded-full transition-all duration-700"
                  style={{ width: `${engagement.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
