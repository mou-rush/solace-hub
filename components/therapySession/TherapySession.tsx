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
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/lib/hooks/useToast";
import { format } from "date-fns";
import { MoodSelector } from "./MoodSelector";
import { SessionControls } from "./SessionControls";
import { SessionNotesPanel } from "./SessionNotesPanel";
import { MessageFeedback } from "./MessageFeedback";
import { AISettings } from "./AISettings";
import { SessionHistory } from "./SessionHistory";
import { ChatForm } from "./ChatForm";
import { InsightsModal } from "@/components/ai-insights/InsightPanel"; // New modal import

export default function TherapySession() {
  const { success } = useToast();

  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionTheme, setSessionTheme] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");
  const [sessionDate, setSessionDate] = useState<Date>(new Date());
  const [currentMood, setCurrentMood] = useState<string | undefined>(undefined);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [savedSessions, setSavedSessions] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [sessionGoals, setSessionGoals] = useState<string[]>([]);
  const [newGoal, setNewGoal] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [aiResponseStyle, setAiResponseStyle] = useState("balanced");
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [hasNewInsights, setHasNewInsights] = useState(false);

  const [initializedSessions, setInitializedSessions] = useState<Set<string>>(
    new Set()
  );

  const [messagesLoaded, setMessagesLoaded] = useState(false);

  const { user } = useAuth();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* Check for new insights when messages change */
  useEffect(() => {
    if (messages.length >= 5 && messages.length % 5 === 0) {
      setHasNewInsights(true);
    }
  }, [messages.length]);

  /* Load chat history for current session */
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
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messages);
      setMessagesLoaded(true);
    });

    const loadSessionInfo = async () => {
      const sessionDoc = doc(db, "users", user.uid, "sessions", sessionId);
      const unsubscribeSession = onSnapshot(sessionDoc, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSessionTheme(data.theme || "");
          setSessionNotes(data.notes || "");
          if (data.date) {
            setSessionDate(data.date.toDate());
          }
          setSessionGoals(data.goals || []);
        }
      });

      return () => unsubscribeSession();
    };

    loadSessionInfo();
    return () => unsubscribe();
  }, [user, sessionId]);

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
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // NoteToMyself: We are only adding greeting message when:
  // 1. Messages have been loaded from Firebase
  // 2. The session has no messages
  // 3. We haven't already initialized this session
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
    setSessionTheme("New Therapy Session");
    setSessionNotes("");
    setSessionGoals([]);
    setMessagesLoaded(false);

    success({
      title: "New Session Created",
      description: "You've started a new therapy session.",
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

    success({
      title: "Session Updated",
      description: "Your session details have been saved.",
    });
  };

  const addSessionGoal = () => {
    if (!newGoal.trim()) return;
    setSessionGoals([...sessionGoals, newGoal.trim()]);
    setNewGoal("");
  };

  const removeSessionGoal = (index: number) => {
    const updatedGoals = [...sessionGoals];
    updatedGoals.splice(index, 1);
    setSessionGoals(updatedGoals);
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
    success({
      title: "Session Link Generated",
      description: "The link has been copied to your clipboard. (Demo only)",
    });
  };

  const getInsightsStatus = () => {
    const userMessageCount = messages.filter(
      (msg) => msg.sender === "user"
    ).length;

    if (userMessageCount < 3) {
      return {
        available: false,
        reason: `Need ${3 - userMessageCount} more messages`,
        color: "text-gray-400",
      };
    }

    if (hasNewInsights) {
      return {
        available: true,
        reason: "New insights available!",
        color: "text-purple-600",
      };
    }

    return {
      available: true,
      reason: "Ready for analysis",
      color: "text-green-600",
    };
  };

  const insightsStatus = getInsightsStatus();

  return (
    <div className="flex flex-col h-full max-h-screen overflow-hidden">
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 border-b p-4">
        <h1 className="text-2xl font-bold">AI Therapy Session</h1>
        <p className="text-muted-foreground text-sm">
          A safe space to reflect, process, and grow
        </p>
      </div>

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
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <SessionControls
                setShowHistory={setShowHistory}
                showHistory={showHistory}
                isNotesOpen={isNotesOpen}
                setIsNotesOpen={setIsNotesOpen}
                shareSessionLink={shareSessionLink}
                setIsSettingsOpen={setIsSettingsOpen}
                createNewSession={createNewSession}
                sessionGoals={sessionGoals}
                messages={messages}
                sessionTheme={sessionTheme}
                sessionDate={sessionDate}
                sessionNotes={sessionNotes}
                setShowInsightsModal={setShowInsightsModal}
                showInsightsModal={showInsightsModal}
                setHasNewInsights={setHasNewInsights}
                hasNewInsights={hasNewInsights}
                insightsStatus={insightsStatus}
              />
            </div>

            <SessionNotesPanel
              sessionTheme={sessionTheme}
              setSessionTheme={setSessionTheme}
              saveSessionData={saveSessionData}
              sessionNotes={sessionNotes}
              setSessionNotes={setSessionNotes}
              newGoal={newGoal}
              setNewGoal={setNewGoal}
              sessionGoals={sessionGoals}
              addSessionGoal={addSessionGoal}
              removeSessionGoal={removeSessionGoal}
              sessionDate={sessionDate}
              isNotesOpen={isNotesOpen}
              messages={messages}
            />
          </div>

          <div className="flex-1 overflow-hidden flex flex-col relative">
            <div className="flex-1 overflow-y-auto p-4">
              {currentMood === null && messages.length <= 2 && (
                <div className="mb-6">
                  <MoodSelector
                    currentMood={currentMood}
                    setCurrentMood={setCurrentMood}
                  />
                </div>
              )}

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
                          <MessageFeedback
                            user={user}
                            sessionId={sessionId}
                            success={success}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}

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

            <ChatForm
              sessionId={sessionId}
              user={user}
              setShowSuggestions={setShowSuggestions}
              aiResponseStyle={aiResponseStyle}
              showSuggestions={showSuggestions}
              messages={messages}
              setLoading={setLoading}
              loading={loading}
              currentMood={currentMood}
              sessionGoals={sessionGoals}
            />
          </div>
        </>
      )}

      {/* AI Settings Modal */}
      <AISettings
        setAiResponseStyle={setAiResponseStyle}
        isSettingsOpen={isSettingsOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        aiResponseStyle={aiResponseStyle}
        setShowSuggestions={setShowSuggestions}
        showSuggestions={showSuggestions}
      />

      {/* AI Insights Full-Screen Modal */}
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
