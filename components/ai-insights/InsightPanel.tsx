"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  Lightbulb,
  Heart,
  Target,
  BookOpen,
  RefreshCw,
  AlertCircle,
  Download,
  BarChart3,
  Users,
  Calendar,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getConversationInsights,
  getMoodBasedRecommendations,
  searchMentalHealthResources,
} from "@/lib/ai/ai-service";

interface InsightsModalProps {
  userId: string;
  conversationHistory: Array<{ text: string; sender: string; timestamp: Date }>;
  currentMood?: string;
  isOpen: boolean;
  onClose: () => void;
}

interface InsightData {
  sentimentTrend: {
    trend: "improving" | "declining" | "stable";
    averageScore: number;
    emotionalProfile: Record<string, number>;
    volatility: number;
  };
  keyThemes: string[];
  recommendations: string[];
  resources: Array<{
    id: string;
    metadata: {
      title: string;
      category: string;
      tags: string[];
    };
    content: string;
  }>;
  riskFactors: string[];
  progressIndicators: string[];
}

export function InsightsModal({
  userId,
  conversationHistory,
  currentMood,
  isOpen,
  onClose,
}: InsightsModalProps) {
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (isOpen && conversationHistory.length > 3) {
      generateInsights();
    }
  }, [isOpen, conversationHistory.length, userId]);

  const generateInsights = async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const convInsights = await getConversationInsights(
        userId,
        conversationHistory
      );

      const recommendations = currentMood
        ? await getMoodBasedRecommendations(
            currentMood,
            userId,
            conversationHistory
          )
        : [];

      /* Extract key themes from recent messages */
      const recentUserMessages = conversationHistory
        .filter((msg) => msg.sender === "user")
        .slice(-10)
        .map((msg) => msg.text)
        .join(" ");

      /* Search for relevant resources */
      const resources = await searchMentalHealthResources(recentUserMessages);

      /* Analyze for risk factors and progress indicators */
      const { riskFactors, progressIndicators } = analyzeConversationPatterns(
        conversationHistory
          .filter((msg) => msg.sender === "user")
          .map((msg) => msg.text)
      );

      const keyThemes = extractThemes(
        conversationHistory
          .filter((msg) => msg.sender === "user")
          .map((msg) => msg.text)
      );

      setInsights({
        sentimentTrend: convInsights.moodTrend,
        keyThemes,
        recommendations: recommendations.slice(0, 5),
        resources: resources.slice(0, 6),
        riskFactors,
        progressIndicators,
      });
    } catch (err) {
      console.error("Failed to generate insights:", err);
      setError("Unable to generate insights. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const extractThemes = (messages: string[]): string[] => {
    const themes = new Set<string>();
    const themeKeywords = {
      "Anxiety Management": ["anxious", "worry", "nervous", "panic", "fear"],
      "Depression Support": ["sad", "depressed", "down", "hopeless", "empty"],
      "Stress Relief": ["stressed", "overwhelmed", "pressure", "burden"],
      "Relationship Issues": ["relationship", "family", "friends", "conflict"],
      "Work-Life Balance": ["work", "job", "career", "workplace", "boss"],
      "Self-Care": [
        "sleep",
        "exercise",
        "nutrition",
        "relaxation",
        "meditation",
      ],
      "Goal Setting": ["goal", "objective", "plan", "future", "improve"],
      "Coping Strategies": [
        "cope",
        "manage",
        "handle",
        "deal with",
        "strategy",
      ],
    };

    const allText = messages.join(" ").toLowerCase();

    for (const [theme, keywords] of Object.entries(themeKeywords)) {
      const matchCount = keywords.filter((keyword) =>
        allText.includes(keyword)
      ).length;
      if (matchCount >= 2) {
        themes.add(theme);
      }
    }

    return Array.from(themes);
  };

  const analyzeConversationPatterns = (
    messages: string[]
  ): {
    riskFactors: string[];
    progressIndicators: string[];
  } => {
    const riskFactors: string[] = [];
    const progressIndicators: string[] = [];
    const allText = messages.join(" ").toLowerCase();

    /* Risk factor analysis */
    const riskKeywords = {
      "Persistent negative mood": [
        "always sad",
        "never happy",
        "constantly down",
      ],
      "Social isolation": [
        "alone",
        "lonely",
        "no friends",
        "isolated",
        "withdrawn",
      ],
      "Sleep disruption": [
        "can't sleep",
        "insomnia",
        "nightmares",
        "tired all day",
      ],
      Hopelessness: ["hopeless", "pointless", "give up", "no future"],
      "Self-harm ideation": ["hurt myself", "end it all", "not worth living"],
    };

    /* Progress indicator analysis */
    const progressKeywords = {
      "Increased self-awareness": [
        "i realize",
        "i understand",
        "makes sense",
        "insight",
      ],
      "Active coping": [
        "trying to",
        "working on",
        "practicing",
        "using techniques",
      ],
      "Social engagement": ["talked to", "reached out", "spending time with"],
      "Mood improvement": [
        "feeling better",
        "good day",
        "more positive",
        "improving",
      ],
      "Goal achievement": [
        "accomplished",
        "completed",
        "achieved",
        "progress made",
      ],
    };

    /* Check for risk factors */
    for (const [factor, keywords] of Object.entries(riskKeywords)) {
      if (keywords.some((keyword) => allText.includes(keyword))) {
        riskFactors.push(factor);
      }
    }

    /* Check for progress indicators */
    for (const [indicator, keywords] of Object.entries(progressKeywords)) {
      if (keywords.some((keyword) => allText.includes(keyword))) {
        progressIndicators.push(indicator);
      }
    }

    return { riskFactors, progressIndicators };
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case "declining":
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      default:
        return <Minus className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "improving":
        return "text-green-600 bg-green-50 border-green-200";
      case "declining":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  const getEmotionColor = (emotion: string, intensity: number) => {
    const colors = {
      anxiety:
        intensity > 0.1
          ? "bg-orange-100 text-orange-800"
          : "bg-gray-100 text-gray-600",
      depression:
        intensity > 0.1
          ? "bg-purple-100 text-purple-800"
          : "bg-gray-100 text-gray-600",
      happiness:
        intensity > 0.1
          ? "bg-green-100 text-green-800"
          : "bg-gray-100 text-gray-600",
      anger:
        intensity > 0.1
          ? "bg-red-100 text-red-800"
          : "bg-gray-100 text-gray-600",
      fear:
        intensity > 0.1
          ? "bg-yellow-100 text-yellow-800"
          : "bg-gray-100 text-gray-600",
    };
    return (
      colors[emotion as keyof typeof colors] || "bg-gray-100 text-gray-600"
    );
  };

  const exportInsights = () => {
    if (!insights) return;

    const exportData = {
      timestamp: new Date().toISOString(),
      userId: userId,
      sessionSummary: {
        totalMessages: conversationHistory.length,
        userMessages: conversationHistory.filter((msg) => msg.sender === "user")
          .length,
        currentMood: currentMood,
      },
      insights: insights,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `solace-insights-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-[95vw] h-[90vh] p-0 gap-0">
        {/* Header */}
        <DialogHeader className="p-6 border-b bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-xl">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">
                  AI Insights & Analysis
                </DialogTitle>
                <p className="text-muted-foreground mt-1">
                  Comprehensive analysis of your therapy session
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={generateInsights}
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                {loading ? "Analyzing..." : "Refresh"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportInsights}
                disabled={!insights}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              {/* <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button> */}
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {error && (
            <div className="flex items-center gap-2 p-4 mx-6 mt-4 text-red-700 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Brain className="h-12 w-12 mx-auto mb-4 text-purple-600 animate-pulse" />
                <p className="text-lg font-medium mb-2">
                  Analyzing conversation patterns...
                </p>
                <p className="text-sm text-muted-foreground">
                  Processing sentiment, themes, and insights
                </p>
              </div>
            </div>
          )}

          {insights && !loading && (
            <div className="h-full flex flex-col">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex-1 flex flex-col"
              >
                <TabsList className="grid w-full grid-cols-5 mx-6 mt-4">
                  <TabsTrigger
                    value="overview"
                    className="flex items-center gap-2"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="emotions"
                    className="flex items-center gap-2"
                  >
                    <Heart className="h-4 w-4" />
                    Emotions
                  </TabsTrigger>
                  <TabsTrigger
                    value="themes"
                    className="flex items-center gap-2"
                  >
                    <Target className="h-4 w-4" />
                    Themes
                  </TabsTrigger>
                  <TabsTrigger
                    value="recommendations"
                    className="flex items-center gap-2"
                  >
                    <Lightbulb className="h-4 w-4" />
                    Resources
                  </TabsTrigger>
                  <TabsTrigger
                    value="progress"
                    className="flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Progress
                  </TabsTrigger>
                </TabsList>

                <ScrollArea className="flex-1 px-6 pb-6">
                  <TabsContent value="overview" className="mt-6 space-y-6">
                    {/* Key Metrics Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            {getTrendIcon(insights.sentimentTrend.trend)}
                            Mood Trend
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getTrendColor(
                              insights.sentimentTrend.trend
                            )}`}
                          >
                            {insights.sentimentTrend.trend
                              .charAt(0)
                              .toUpperCase() +
                              insights.sentimentTrend.trend.slice(1)}
                          </div>
                          <div className="mt-2">
                            <div className="text-2xl font-bold">
                              {insights.sentimentTrend.averageScore > 0
                                ? "+"
                                : ""}
                              {(
                                insights.sentimentTrend.averageScore * 100
                              ).toFixed(1)}
                              %
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Average sentiment
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Session Stats
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {conversationHistory.length}
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">
                            Total messages
                          </div>
                          <div className="text-sm font-medium">
                            {
                              conversationHistory.filter(
                                (msg) => msg.sender === "user"
                              ).length
                            }{" "}
                            from you
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Active Themes
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {insights.keyThemes.length}
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">
                            Identified
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {insights.keyThemes
                              .slice(0, 2)
                              .map((theme, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {theme.split(" ")[0]}
                                </Badge>
                              ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Heart className="h-4 w-4" />
                            Emotional Stability
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {insights.sentimentTrend.volatility < 0.3
                              ? "High"
                              : insights.sentimentTrend.volatility < 0.6
                              ? "Moderate"
                              : "Variable"}
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">
                            Stability level
                          </div>
                          <Progress
                            value={Math.max(
                              10,
                              (1 - insights.sentimentTrend.volatility) * 100
                            )}
                            className="h-2"
                          />
                        </CardContent>
                      </Card>
                    </div>

                    {/* Risk Factors & Progress */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {insights.riskFactors.length > 0 && (
                        <Card className="border-orange-200 bg-orange-50">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
                              <AlertCircle className="h-5 w-5" />
                              Areas of Concern
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {insights.riskFactors.map((factor, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2 text-orange-700"
                                >
                                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                  <span className="text-sm">{factor}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}

                      {insights.progressIndicators.length > 0 && (
                        <Card className="border-green-200 bg-green-50">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                              <Heart className="h-5 w-5" />
                              Positive Signs
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {insights.progressIndicators.map(
                                (indicator, index) => (
                                  <li
                                    key={index}
                                    className="flex items-start gap-2 text-green-700"
                                  >
                                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <span className="text-sm">{indicator}</span>
                                  </li>
                                )
                              )}
                            </ul>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="emotions" className="mt-6 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Emotional Profile Analysis
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Based on language patterns and sentiment analysis of
                          your conversation
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                          {Object.entries(
                            insights.sentimentTrend.emotionalProfile
                          ).map(([emotion, intensity]) => (
                            <div key={emotion} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium capitalize">
                                  {emotion}
                                </span>
                                <Badge
                                  className={getEmotionColor(
                                    emotion,
                                    intensity
                                  )}
                                >
                                  {(intensity * 100).toFixed(1)}%
                                </Badge>
                              </div>
                              <Progress
                                value={intensity * 100}
                                className="h-3"
                              />
                            </div>
                          ))}
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                          <div className="text-sm font-medium text-blue-800 mb-2">
                            Emotional Volatility Analysis
                          </div>
                          <div className="text-sm text-blue-600">
                            Your emotional patterns show{" "}
                            {insights.sentimentTrend.volatility < 0.3
                              ? "low volatility (stable emotions)"
                              : insights.sentimentTrend.volatility < 0.6
                              ? "moderate volatility (some emotional variation)"
                              : "high volatility (significant emotional fluctuation)"}
                            . Volatility score:{" "}
                            {(insights.sentimentTrend.volatility * 100).toFixed(
                              1
                            )}
                            %
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="themes" className="mt-6 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Conversation Themes
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Key topics and areas of focus identified in your
                          session
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                          {insights.keyThemes.map((theme, index) => (
                            <div
                              key={index}
                              className="p-3 border rounded-lg bg-gradient-to-br from-purple-50 to-blue-50"
                            >
                              <div className="font-medium text-sm mb-1">
                                {theme}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Theme #{index + 1}
                              </div>
                            </div>
                          ))}
                        </div>

                        {insights.keyThemes.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>
                              No specific themes detected yet. Continue your
                              conversation to identify patterns.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent
                    value="recommendations"
                    className="mt-6 space-y-6"
                  >
                    {/* AI Recommendations */}
                    {insights.recommendations.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-yellow-500" />
                            AI Recommendations
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Personalized suggestions based on your conversation
                          </p>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {insights.recommendations.map((rec, index) => (
                              <div
                                key={index}
                                className="p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                              >
                                <div className="text-sm">{rec}</div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Resource Suggestions */}
                    {insights.resources.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-blue-500" />
                            Relevant Resources
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Curated mental health resources matched to your
                            conversation
                          </p>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-4 md:grid-cols-2">
                            {insights.resources.map((resource, index) => (
                              <div
                                key={index}
                                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="text-sm font-medium line-clamp-2">
                                    {resource.metadata.title}
                                  </h4>
                                  <Badge
                                    variant="outline"
                                    className="text-xs ml-2 flex-shrink-0"
                                  >
                                    {resource.metadata.category}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
                                  {resource.content.substring(0, 150)}...
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {resource.metadata.tags
                                    .slice(0, 3)
                                    .map((tag, tagIndex) => (
                                      <Badge
                                        key={tagIndex}
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {tag}
                                      </Badge>
                                    ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="progress" className="mt-6 space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">
                            Session Progress Summary
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b">
                              <span className="text-sm font-medium">
                                Overall Trend
                              </span>
                              <div className="flex items-center gap-2">
                                {getTrendIcon(insights.sentimentTrend.trend)}
                                <span className="text-sm font-medium capitalize">
                                  {insights.sentimentTrend.trend}
                                </span>
                              </div>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b">
                              <span className="text-sm font-medium">
                                Emotional Stability
                              </span>
                              <span className="text-sm font-medium">
                                {insights.sentimentTrend.volatility < 0.3
                                  ? "Stable"
                                  : insights.sentimentTrend.volatility < 0.6
                                  ? "Moderate"
                                  : "Variable"}
                              </span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b">
                              <span className="text-sm font-medium">
                                Active Themes
                              </span>
                              <span className="text-sm font-medium">
                                {insights.keyThemes.length} identified
                              </span>
                            </div>

                            <div className="flex justify-between items-center py-2">
                              <span className="text-sm font-medium">
                                Progress Indicators
                              </span>
                              <span className="text-sm font-medium text-green-600">
                                {insights.progressIndicators.length} positive
                                signs
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Next Steps</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <div className="text-sm font-medium text-blue-800 mb-1">
                                Continue Engagement
                              </div>
                              <div className="text-xs text-blue-600">
                                Keep engaging with therapeutic conversations to
                                build on these insights and track your progress
                                over time.
                              </div>
                            </div>

                            <div className="p-3 bg-green-50 rounded-lg">
                              <div className="text-sm font-medium text-green-800 mb-1">
                                Explore Resources
                              </div>
                              <div className="text-xs text-green-600">
                                Review the recommended resources to deepen your
                                understanding and develop new coping strategies.
                              </div>
                            </div>

                            <div className="p-3 bg-purple-50 rounded-lg">
                              <div className="text-sm font-medium text-purple-800 mb-1">
                                Track Patterns
                              </div>
                              <div className="text-xs text-purple-600">
                                Use the mood tracker and journal features to
                                monitor your emotional patterns between
                                sessions.
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
