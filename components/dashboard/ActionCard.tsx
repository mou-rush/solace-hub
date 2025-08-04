"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Clock,
  ChevronRight,
  Activity,
  BookOpen,
  MessageSquare,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
interface ActionCardProps {
  readonly title: string;
  readonly description?: string;
  readonly children?: React.ReactNode;
  readonly className?: string;
}
export function ActionCard() {
  const priorityActions = [
    {
      title: "AI Therapy Session",
      description: "Connect with your AI therapeutic assistant",
      icon: <MessageSquare className="h-5 w-5" />,
      href: "/dashboard/chat",
      priority: "high",
      estimatedTime: "15-30 min",
    },
    {
      title: "Mood Assessment",
      description: "Log your current emotional state",
      icon: <Activity className="h-5 w-5" />,
      href: "/dashboard/mood",
      priority: "medium",
      estimatedTime: "2-5 min",
    },
    {
      title: "Reflective Journaling",
      description: "Process your thoughts and experiences",
      icon: <BookOpen className="h-5 w-5" />,
      href: "/dashboard/journal",
      priority: "medium",
      estimatedTime: "10-20 min",
    },
    {
      title: "Wellness Resources",
      description: "Explore curated mental health content",
      icon: <Shield className="h-5 w-5" />,
      href: "/dashboard/resources",
      priority: "low",
      estimatedTime: "5-15 min",
    },
  ];
  return (
    <div className="lg:col-span-2">
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Today's Focus
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Prioritized mental wellness activities
              </p>
            </div>
            <Badge
              variant="outline"
              className="bg-teal-50 text-teal-700 border-teal-200"
            >
              <Plus className="w-3 h-3 mr-1" />
              Personalized
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {priorityActions.map((action, index) => (
              <a key={index} href={action.href} className="block group">
                <div className="flex items-center p-4 rounded-xl border border-gray-100 hover:border-teal-200 hover:bg-teal-50/50 transition-all duration-200 group-hover:shadow-sm">
                  <div
                    className={`p-3 rounded-xl mr-4 ${
                      action.priority === "high"
                        ? "bg-gradient-to-br from-red-100 to-orange-100 text-red-600"
                        : action.priority === "medium"
                        ? "bg-gradient-to-br from-blue-100 to-teal-100 text-blue-600"
                        : "bg-gradient-to-br from-gray-100 to-slate-100 text-gray-600"
                    } group-hover:scale-105 transition-transform`}
                  >
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">
                        {action.title}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          action.priority === "high"
                            ? "border-red-200 text-red-600 bg-red-50"
                            : action.priority === "medium"
                            ? "border-blue-200 text-blue-600 bg-blue-50"
                            : "border-gray-200 text-gray-600 bg-gray-50"
                        }`}
                      >
                        {action.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {action.description}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{action.estimatedTime}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                </div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
