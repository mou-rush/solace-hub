"use client";

import { useState, useRef, useEffect } from "react";
import {
  doc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format } from "date-fns";
import { MoodSelector } from "./MoodSelector";
import { SessionControls } from "./SessionControls";
import { SessionNotesPanel } from "./SessionNotesPanel";
import { MessageFeedback } from "./MessageFeedback";
import { AISettings } from "./AISettings";
import { SessionHistory } from "./SessionHistory";
import { ChatForm } from "./ChatForm";
import { InsightsModal } from "@/components/ai-insights/InsightPanel";
import { useAppStore, useAuthStore, useSessionStore } from "@/stores";

export default function TherapySession() {
  const { addNotification } = useAppStore();
  const { user } = useAuthStore();
  const {
    sessionId,
    setSessionId,
    sessionTheme,
    setSessionTheme,
    sessionNotes,
    setSessionNotes,
    sessionGoals,
    setSessionGoals,
    sessionDate,
    currentMood,
    setCurrentMood,
    loading,
    showHistory,
    setShowHistory,
    isSettingsOpen,
    setIsSettingsOpen,
    showInsightsModal,
    setShowInsightsModal,
    setHasNewInsights,
    resetSession,
  } = useSessionStore();

  const [messages, setMessages] = useState<any[]>([]);
  const [savedSessions, setSavedSessions] = useState<any[]>([]);
  const [initializedSessions, setInitializedSessions] = useState<Set<string>>(
    new Set()
  );
  const [messagesLoaded, setMessagesLoaded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length >= 5 && messages.length % 5 === 0) {
      setHasNewInsights(true);
    }
  }, [messages.length, setHasNewInsights]);

  useEffect(() => {
    if (!user || !sessionId) return;

    setMessagesLoaded(false);

    const chatRef = collection(
      db,
      "users",
      user.uid,
      "sessions",
      sessionId,
      "messages"
    );
    const q = query(chatRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messagesData);
      setMessagesLoaded(true);
    });

    const sessionDoc = doc(db, "users", user.uid, "sessions", sessionId);
    const unsubscribeSession = onSnapshot(sessionDoc, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSessionTheme(data.theme || "");
        setSessionNotes(data.notes || "");
        setSessionGoals(data.goals || []);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeSession();
    };
  }, [user, sessionId, setSessionTheme, setSessionNotes, setSessionGoals]);

  useEffect(() => {
    if (!user) return;

    const sessionsRef = collection(db, "users", user.uid, "sessions");
    const q = query(sessionsRef, orderBy("date", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date(),
      }));
      setSavedSessions(sessions);

      if (!sessionId && sessions.length > 0) {
        setSessionId(sessions[0].id);
      } else if (!sessionId) {
        createNewSession();
      }
    });

    return () => unsubscribe();
  }, [user, sessionId, setSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (
      messagesLoaded &&
      messages.length === 0 &&
      user &&
      sessionId &&
      !initializedSessions.has(sessionId)
    ) {
      const chatRef = collection(
        db,
        "users",
        user.uid,
        "sessions",
        sessionId,
        "messages"
      );

      addDoc(chatRef, {
        text: `Hello ${
          user.displayName?.split(" ")[0] || "there"
        }! I'm your AI therapy assistant. How are you feeling today?`,
        sender: "ai",
        timestamp: serverTimestamp(),
      });

      setInitializedSessions((prev) => new Set([...prev, sessionId]));
    }
  }, [user, messages.length, sessionId, messagesLoaded, initializedSessions]);

  const createNewSession = async () => {
    if (!user) return;

    const sessionsRef = collection(db, "users", user.uid, "sessions");
    const newSessionRef = await addDoc(sessionsRef, {
      theme: "New Therapy Session",
      date: serverTimestamp(),
      notes: "",
      goals: [],
    });

    setSessionId(newSessionRef.id);
    setMessages([]);
    resetSession();
    setMessagesLoaded(false);

    addNotification({
      title: "New Session Created",
      description: "You've started a new therapy session.",
      variant: "success",
    });
  };

  const saveSessionData = async () => {
    if (!user || !sessionId) return;

    const sessionRef = doc(db, "users", user.uid, "sessions", sessionId);
    await updateDoc(sessionRef, {
      theme: sessionTheme,
      notes: sessionNotes,
      goals: sessionGoals,
      lastUpdated: serverTimestamp(),
    });

    addNotification({
      title: "Session Updated",
      description: "Your session details have been saved.",
      variant: "success",
    });
  };

  const switchToSession = (id: string) => {
    setSessionId(id);
    setShowHistory(false);
  };

  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, "h:mm a");
  };

  const shareSessionLink = () => {
    addNotification({
      title: "Session Link Generated",
      description: "The link has been copied to your clipboard. (Demo only)",
      variant: "info",
    });
  };

  return (
    <div className="flex flex-col h-full max-h-screen overflow-hidden">
      {/* Header */}
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 border-b p-4">
        <h1 className="text-2xl font-bold">AI Therapy Session</h1>
        <p className="text-muted-foreground text-sm">
          A safe space to reflect, process, and grow
        </p>
      </div>

      {/* Main Content */}
      {showHistory ? (
        <div className="flex-1 overflow-y-auto p-4">
          <SessionHistory
            savedSessions={savedSessions}
            createNewSession={createNewSession}
            switchToSession={switchToSession}
            sessionId={sessionId}
          />
        </div>
      ) : (
        <>
          {/* Controls and Notes */}
          <div className="p-4">
            <SessionControls
              shareSessionLink={shareSessionLink}
              createNewSession={createNewSession}
              messages={messages}
              sessionDate={sessionDate}
            />

            <SessionNotesPanel
              messages={messages}
              saveSessionData={saveSessionData}
            />
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-hidden flex flex-col relative">
            <div className="flex-1 overflow-y-auto p-4">
              {/* Mood Selector - only show if mood not set and few messages */}
              {currentMood === undefined && messages.length <= 2 && (
                <div className="mb-6">
                  <MoodSelector
                    currentMood={currentMood}
                    setCurrentMood={setCurrentMood}
                  />
                </div>
              )}

              {/* Messages */}
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`group max-w-[85%] rounded-lg px-4 py-2 ${
                        message.sender === "user"
                          ? "bg-primary/90 text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.text}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs opacity-70">
                          {formatMessageTime(message.timestamp)}
                        </span>
                        {message.sender === "ai" && (
                          <MessageFeedback user={user} sessionId={sessionId} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {loading && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-lg px-4 py-3 bg-secondary">
                      <div className="flex space-x-2">
                        <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"></div>
                        <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]"></div>
                        <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Chat Input */}
            <ChatForm user={user} messages={messages} />
          </div>
        </>
      )}

      {/* Modals */}
      <AISettings
        isSettingsOpen={isSettingsOpen}
        setIsSettingsOpen={setIsSettingsOpen}
      />

      <InsightsModal
        userId={user?.uid || ""}
        conversationHistory={messages.map((msg) => ({
          text: msg.text,
          sender: msg.sender,
          timestamp: msg.timestamp?.toDate() || new Date(),
        }))}
        currentMood={currentMood}
        isOpen={showInsightsModal}
        onClose={() => setShowInsightsModal(false)}
      />
    </div>
  );
}
