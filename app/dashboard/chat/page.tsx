"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import {
  doc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Send } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { generateTherapyResponse } from "@/lib/ai-service";

// Mock function for AI response - in a real app, this would call the Google Generative AI API
async function getAIResponse(message: string) {
  // This would be replaced with actual API call to Google Generative AI
  const responses = [
    "I understand how you're feeling. Would you like to explore that further?",
    "That sounds challenging. How has this been affecting your daily life?",
    "Thank you for sharing that with me. What do you think might help in this situation?",
    "I'm here to support you. Have you tried any coping strategies for this before?",
    "It's completely normal to feel that way. Would you like to discuss some techniques that might help?",
  ];

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return responses[Math.floor(Math.random() * responses.length)];
}

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history
  useEffect(() => {
    if (!user) return;

    const chatRef = collection(db, "users", user.uid, "chats");
    const q = query(chatRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messages);
    });

    return () => unsubscribe();
  }, [user]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial greeting message
  useEffect(() => {
    if (messages.length === 0 && user) {
      const userRef = doc(db, "users", user.uid);
      const chatRef = collection(userRef, "chats");

      addDoc(chatRef, {
        text: `Hello ${
          user.displayName?.split(" ")[0] || "there"
        }! I'm your AI therapy assistant. How are you feeling today?`,
        sender: "ai",
        timestamp: serverTimestamp(),
      });
    }
  }, [user, messages.length]);

  const handleSendMessage = async () => {
    if (!input.trim() || !user) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    // Add user message to Firestore
    const userRef = doc(db, "users", user.uid);
    const chatRef = collection(userRef, "chats");

    await addDoc(chatRef, {
      text: userMessage,
      sender: "user",
      timestamp: serverTimestamp(),
    });

    try {
      // Get AI response
      const aiResponse = await generateTherapyResponse(userMessage);

      // Add AI response to Firestore
      await addDoc(chatRef, {
        text: aiResponse,
        sender: "ai",
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // const toggleRecording = () => {
  //   // This would integrate with VAPI for voice interactions
  //   if (isRecording) {
  //     // Stop recording
  //     setIsRecording(false);
  //     toast({
  //       title: "Voice recording stopped",
  //       description:
  //         "Voice recording feature is not fully implemented in this demo.",
  //     });
  //   } else {
  //     // Start recording
  //     setIsRecording(true);
  //     toast({
  //       title: "Voice recording started",
  //       description:
  //         "Voice recording feature is not fully implemented in this demo.",
  //     });
  //   }
  // };

  return (
    <div className="flex flex-col h-full p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">AI Therapy Session</h1>
        <p className="text-muted-foreground mt-1">
          Chat with your AI therapist in a safe, confidential space
        </p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle>Conversation</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.sender === "user"
                      ? "bg-teal-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p>{message.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg px-4 py-2 bg-gray-100">
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"></div>
                    <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]"></div>
                    <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
        <div className="border-t p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* <Button
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
            </Button> */}
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              disabled={loading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || loading}
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
