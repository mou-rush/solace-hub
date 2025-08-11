"use client";
import { useState, useRef, useEffect, ReactNode } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Send,
  Mic,
  MicOff,
  Brain,
  Lightbulb,
  BookOpen,
  TrendingUp,
  Sparkles,
} from "lucide-react";

import {
  getEnhancedTherapyResponse,
  analyzeSentiment,
} from "@/lib/ai/ai-service";
import { ConversationContext } from "@/lib/ai/enhanced-ai-service";
import { User } from "firebase/auth";
import { useAppStore, useSessionStore } from "@/stores";

interface Message {
  text: string;
  sender: string;
  timestamp: Timestamp;
}

interface SmartSuggestion {
  text: string;
  type: "follow-up" | "coping" | "exploration" | "reflection";
  icon: ReactNode;
}

interface ChatFormProps {
  user: User | null;
  messages: Message[];
}

export const ChatForm = ({ user, messages }: ChatFormProps) => {
  const { addNotification } = useAppStore();
  const {
    sessionId,
    loading,
    setLoading,
    enhancedMode,
    setEnhancedMode,
    aiResponseStyle,
    showSuggestions,
    setShowSuggestions,
    currentMood,
    sessionGoals,
  } = useSessionStore();

  const [input, setInput] = useState("");
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [sentimentPreview, setSentimentPreview] = useState<any>(null);
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>(
    []
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [sessionId]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("");
      setInput(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
      addNotification({
        variant: "error",
        title: "Voice Recording Error",
        description: `Error: ${event.error}. Please try again.`,
      });
    };

    setSpeechRecognition(recognition);
  }, [addNotification]);

  useEffect(() => {
    if (messages.length > 0 && !loading) {
      generateSmartSuggestions();
    }
  }, [messages.length, currentMood, loading]);

  useEffect(() => {
    if (!enhancedMode || input.length <= 10) {
      setSentimentPreview(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const sentiment = await analyzeSentiment(input);
        setSentimentPreview(sentiment);
      } catch {
        setSentimentPreview(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [input, enhancedMode]);

  const generateSmartSuggestions = async () => {
    const suggestions: SmartSuggestion[] = [];
    const lastUserMessage = messages
      .filter((msg) => msg.sender === "user")
      .slice(-1)[0]?.text;

    if (lastUserMessage) {
      const lowerText = lastUserMessage.toLowerCase();

      if (lowerText.includes("anxious") || lowerText.includes("worried")) {
        suggestions.push(
          {
            text: "Can you tell me more about what's making you feel anxious?",
            type: "follow-up",
            icon: <Brain className="h-3 w-3" />,
          },
          {
            text: "I'd like to try some breathing exercises",
            type: "coping",
            icon: <Lightbulb className="h-3 w-3" />,
          }
        );
      }

      if (lowerText.includes("sad") || lowerText.includes("down")) {
        suggestions.push(
          {
            text: "What would help me feel a bit better right now?",
            type: "coping",
            icon: <TrendingUp className="h-3 w-3" />,
          },
          {
            text: "I want to understand why I'm feeling this way",
            type: "exploration",
            icon: <BookOpen className="h-3 w-3" />,
          }
        );
      }

      if (lowerText.includes("better") || lowerText.includes("good")) {
        suggestions.push({
          text: "What specifically helped me feel better?",
          type: "reflection",
          icon: <Sparkles className="h-3 w-3" />,
        });
      }
    }

    if (currentMood) {
      const moodSuggestions = getMoodBasedSuggestions(currentMood);
      suggestions.push(...moodSuggestions);
    }

    if (sessionGoals.length > 0) {
      suggestions.push({
        text: `How am I progressing on my goal: ${sessionGoals[0]}?`,
        type: "reflection",
        icon: <TrendingUp className="h-3 w-3" />,
      });
    }

    setSmartSuggestions(suggestions.slice(0, 4));
  };

  const getMoodBasedSuggestions = (mood: string): SmartSuggestion[] => {
    const moodSuggestions: Record<string, SmartSuggestion[]> = {
      anxious: [
        {
          text: "Can you help me with grounding techniques?",
          type: "coping",
          icon: <Lightbulb className="h-3 w-3" />,
        },
      ],
      sad: [
        {
          text: "What are some small steps I can take today?",
          type: "coping",
          icon: <TrendingUp className="h-3 w-3" />,
        },
      ],
      stressed: [
        {
          text: "How can I manage my stress better?",
          type: "coping",
          icon: <Brain className="h-3 w-3" />,
        },
      ],
    };

    return moodSuggestions[mood.toLowerCase()] || [];
  };

  const handleSuggestion = (suggestion: SmartSuggestion) => {
    setInput(suggestion.text);
    inputRef.current?.focus();
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !user || !sessionId) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);
    setIsAnalyzing(true);

    const chatRef = collection(
      db,
      "users",
      user.uid,
      "sessions",
      sessionId,
      "messages"
    );

    try {
      await addDoc(chatRef, {
        text: userMessage,
        sender: "user",
        timestamp: serverTimestamp(),
      });

      let aiResponse: string;

      if (enhancedMode) {
        const context: ConversationContext = {
          userId: user.uid,
          conversationHistory: messages.map((msg) => ({
            text: msg.text,
            sender: msg.sender,
            timestamp: msg.timestamp?.toDate() || new Date(),
          })),
          currentMood,
          sessionGoals,
          responseStyle: aiResponseStyle,
        };

        const enhancedResponse = await getEnhancedTherapyResponse(
          userMessage,
          context
        );
        aiResponse = enhancedResponse.response;

        if (enhancedResponse.sources?.length) {
          addNotification({
            title: "Enhanced Response",
            description: `Response enhanced with ${enhancedResponse.sources.length} knowledge sources`,
            variant: "success",
          });
        }
      } else {
        const { generateTherapyResponse } = await import("@/lib/ai/ai-service");
        aiResponse = await generateTherapyResponse(
          userMessage,
          aiResponseStyle
        );
      }

      await addDoc(chatRef, {
        text: aiResponse,
        sender: "ai",
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error getting AI response:", error);
      addNotification({
        title: "AI Response Error",
        description: "Failed to get AI response. Please try again.",
        variant: "error",
      });
    } finally {
      setLoading(false);
      setIsAnalyzing(false);
      setShowSuggestions(false);
      setSentimentPreview(null);
    }
  };

  const toggleRecording = () => {
    if (!speechRecognition) {
      addNotification({
        variant: "error",
        title: "Speech Recognition Not Available",
        description: "Your browser does not support speech recognition.",
      });
      return;
    }

    if (isRecording) {
      speechRecognition.stop();
      setIsRecording(false);
      addNotification({
        variant: "success",
        title: "Voice recording stopped",
        description: "Your voice input has been captured.",
      });
    } else {
      speechRecognition.start();
      setIsRecording(true);
      addNotification({
        variant: "info",
        title: "Voice recording started",
        description: "Speak clearly into your microphone.",
      });
    }
  };

  const getSentimentColor = (sentiment: any) => {
    if (!sentiment) return "";
    if (sentiment.label === "positive")
      return "text-green-600 bg-green-50 border-green-200";
    if (sentiment.label === "negative")
      return "text-red-600 bg-red-50 border-red-200";
    return "text-blue-600 bg-blue-50 border-blue-200";
  };

  return (
    <>
      {/* Enhanced Mode Toggle */}
      <div className="px-4 py-2 border-t bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-purple-600" />
          <span className="text-xs font-medium">Enhanced AI Mode</span>
          <Badge
            variant={enhancedMode ? "default" : "outline"}
            className="text-xs"
          >
            {enhancedMode ? "ON" : "OFF"}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEnhancedMode(!enhancedMode)}
          className="text-xs"
        >
          {enhancedMode ? "Disable" : "Enable"}
        </Button>
      </div>

      {/* Sentiment Preview */}
      {sentimentPreview && enhancedMode && (
        <div className="px-4 py-2 border-t">
          <div className="flex items-center gap-2">
            <Badge className={`text-xs ${getSentimentColor(sentimentPreview)}`}>
              {sentimentPreview.label} (
              {(sentimentPreview.confidence * 100).toFixed(0)}%)
            </Badge>
            {sentimentPreview.emotions && (
              <div className="flex gap-1">
                {Object.entries(sentimentPreview.emotions)
                  .filter(([, value]) => (value as number) > 0.1)
                  .slice(0, 2)
                  .map(([emotion, intensity]) => (
                    <Badge key={emotion} variant="outline" className="text-xs">
                      {emotion}: {((intensity as number) * 100).toFixed(0)}%
                    </Badge>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Smart Suggestions */}
      {showSuggestions && smartSuggestions.length > 0 && !loading && (
        <div className="p-4 border-t bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">
              Smart Suggestions
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {smartSuggestions.map((suggestion, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:bg-white/80 transition-all border-purple-200 hover:border-purple-300"
                onClick={() => handleSuggestion(suggestion)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 text-purple-600">
                      {suggestion.icon}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {suggestion.text}
                      </div>
                      <div className="text-xs text-purple-600 capitalize mt-1">
                        {suggestion.type.replace("-", " ")}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Main Input Form */}
      <div className="p-4 border-t bg-background">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <Button
            type="button"
            size="icon"
            variant={isRecording ? "default" : "outline"}
            className={`${
              isRecording
                ? "bg-red-500 hover:bg-red-600 animate-pulse"
                : "hover:bg-secondary"
            } transition-all`}
            onClick={toggleRecording}
            disabled={loading}
          >
            {isRecording ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>

          <div className="relative flex-1">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                enhancedMode
                  ? "Type your message... (Enhanced AI will provide deeper insights)"
                  : "Type your message..."
              }
              className={`pr-10 ${
                sentimentPreview
                  ? `border-2 ${
                      getSentimentColor(sentimentPreview).includes("green")
                        ? "border-green-300"
                        : getSentimentColor(sentimentPreview).includes("red")
                        ? "border-red-300"
                        : "border-blue-300"
                    }`
                  : ""
              }`}
              disabled={loading || isRecording}
            />

            {enhancedMode && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Brain className="h-4 w-4 text-purple-600" />
              </div>
            )}
          </div>

          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || loading || isRecording}
            className={`${
              enhancedMode
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-teal-600 hover:bg-teal-700"
            } transition-all`}
          >
            {isAnalyzing ? (
              <Brain className="h-5 w-5 animate-pulse" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>

        {/* Status Indicators */}
        {enhancedMode && (
          <div className="mt-2 text-xs text-purple-600 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            <span>
              Enhanced with RAG, sentiment analysis, and contextual memory
            </span>
          </div>
        )}

        {isRecording && (
          <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span>Recording... Speak clearly into your microphone</span>
          </div>
        )}

        {isAnalyzing && enhancedMode && (
          <div className="mt-2 flex items-center gap-2 text-sm text-purple-600">
            <Brain className="h-4 w-4 animate-spin" />
            <span>Analyzing with enhanced AI and knowledge base...</span>
          </div>
        )}
      </div>
    </>
  );
};
