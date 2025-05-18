"use client";

import { useState, useRef, useEffect } from "react";

import {
  collection,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Send, Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/useToast";

import { generateTherapyResponse } from "@/lib/ai-service";
import { Badge } from "@/components/ui/badge";
import { User } from "firebase/auth";

interface ChatFormProps {
  sessionId: string | null;
  user: User | null;
  setShowSuggestions: (value: boolean) => void;
  aiResponseStyle: string;
  showSuggestions: boolean;
  messages: Array<{ text: string; sender: string; timestamp: Timestamp }>;
  loading: boolean;
  setLoading: (value: boolean) => void;
}

export const ChatForm = ({
  sessionId,
  user,
  setShowSuggestions,
  aiResponseStyle,
  showSuggestions,
  messages,
  loading,
  setLoading,
}: ChatFormProps) => {
  const { error, success } = useToast();
  const [input, setInput] = useState("");
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);

  const suggestions = [
    "I've been feeling anxious lately",
    "I'm having trouble sleeping",
    "I need help with work stress",
    "How can I improve my relationships?",
    "I'm feeling overwhelmed",
  ];
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [sessionId]);

  useEffect(() => {
    if (
      (typeof window !== "undefined" && "SpeechRecognition" in window) ||
      "webkitSpeechRecognition" in window
    ) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
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
        error({
          title: "Voice Recording Error",
          description: `Error: ${event.error}. Please try again.`,
        });
      };

      setSpeechRecognition(recognition);
    }
  }, []);
  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  const handleSendMessage = async () => {
    if (!input.trim() || !user || !sessionId) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    const chatRef = collection(
      db,
      "users",
      user.uid,
      "sessions",
      sessionId,
      "messages"
    );

    await addDoc(chatRef, {
      text: userMessage,
      sender: "user",
      timestamp: serverTimestamp(),
    });

    try {
      const aiResponse = await generateTherapyResponse(
        userMessage,
        aiResponseStyle
      );

      await addDoc(chatRef, {
        text: aiResponse,
        sender: "ai",
        timestamp: serverTimestamp(),
      });
    } catch (errorMessage) {
      console.error("Error getting AI response:", errorMessage);
      error({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
      });
    } finally {
      setLoading(false);
      setShowSuggestions(false);
    }
  };

  const toggleRecording = () => {
    if (!speechRecognition) {
      error({
        title: "Speech Recognition Not Available",
        description: "Your browser does not support speech recognition.",
      });
      return;
    }

    if (isRecording) {
      speechRecognition.stop();
      setIsRecording(false);
      success({
        title: "Voice recording stopped",
        description: "Your voice input has been captured.",
      });
    } else {
      speechRecognition.start();
      setIsRecording(true);
      success({
        title: "Voice recording started",
        description: "Speak clearly into your microphone.",
      });
    }
  };

  return (
    <>
      {showSuggestions && messages.length < 5 && !loading && (
        <div className="p-4 border-t bg-background/80 backdrop-blur-sm">
          <p className="text-sm font-medium mb-2">Suggested topics:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-secondary px-3 py-1.5"
                onClick={() => handleSuggestion(suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </div>
      )}
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
            className={isRecording ? "bg-red-500 hover:bg-red-600" : ""}
            onClick={toggleRecording}
          >
            {isRecording ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>

          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            disabled={loading || isRecording}
          />

          <Button type="submit" size="icon" disabled={!input.trim() || loading}>
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </>
  );
};
