import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface SessionGoal {
  id: string;
  text: string;
  completed: boolean;
}

interface Session {
  id: string;
  theme: string;
  notes: string;
  goals: SessionGoal[];
  messages: Message[];
  date: Date;
  currentMood?: string;
}

interface SessionState {
  currentSession: Session | null;
  sessions: Session[];
  loading: boolean;
  aiResponseStyle: string;
  showSuggestions: boolean;
  enhancedMode: boolean;

  // Actions
  createSession: () => void;
  switchSession: (sessionId: string) => void;
  updateSession: (updates: Partial<Session>) => void;
  addMessage: (message: Omit<Message, "id">) => void;
  addGoal: (text: string) => void;
  removeGoal: (goalId: string) => void;
  toggleGoalCompletion: (goalId: string) => void;
  setLoading: (loading: boolean) => void;
  setAiResponseStyle: (style: string) => void;
  setShowSuggestions: (show: boolean) => void;
  setEnhancedMode: (enhanced: boolean) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      currentSession: null,
      sessions: [],
      loading: false,
      aiResponseStyle: "balanced",
      showSuggestions: true,
      enhancedMode: true,

      createSession: () => {
        const newSession: Session = {
          id: `session-${Date.now()}`,
          theme: "New Therapy Session",
          notes: "",
          goals: [],
          messages: [],
          date: new Date(),
        };

        set((state) => ({
          currentSession: newSession,
          sessions: [newSession, ...state.sessions],
        }));
      },

      switchSession: (sessionId) => {
        const session = get().sessions.find((s) => s.id === sessionId);
        if (session) {
          set({ currentSession: session });
        }
      },

      updateSession: (updates) => {
        const { currentSession } = get();
        if (!currentSession) return;

        const updatedSession = { ...currentSession, ...updates };

        set((state) => ({
          currentSession: updatedSession,
          sessions: state.sessions.map((s) =>
            s.id === currentSession.id ? updatedSession : s
          ),
        }));
      },

      addMessage: (messageData) => {
        const message: Message = {
          ...messageData,
          id: `msg-${Date.now()}`,
        };

        const { currentSession } = get();
        if (!currentSession) return;

        get().updateSession({
          messages: [...currentSession.messages, message],
        });
      },

      addGoal: (text) => {
        const goal: SessionGoal = {
          id: `goal-${Date.now()}`,
          text,
          completed: false,
        };

        const { currentSession } = get();
        if (!currentSession) return;

        get().updateSession({
          goals: [...currentSession.goals, goal],
        });
      },

      removeGoal: (goalId) => {
        const { currentSession } = get();
        if (!currentSession) return;

        get().updateSession({
          goals: currentSession.goals.filter((g) => g.id !== goalId),
        });
      },

      toggleGoalCompletion: (goalId) => {
        const { currentSession } = get();
        if (!currentSession) return;

        get().updateSession({
          goals: currentSession.goals.map((g) =>
            g.id === goalId ? { ...g, completed: !g.completed } : g
          ),
        });
      },

      setLoading: (loading) => set({ loading }),
      setAiResponseStyle: (aiResponseStyle) => set({ aiResponseStyle }),
      setShowSuggestions: (showSuggestions) => set({ showSuggestions }),
      setEnhancedMode: (enhancedMode) => set({ enhancedMode }),
    }),
    {
      name: "session-storage",
      partialize: (state) => ({
        sessions: state.sessions,
        aiResponseStyle: state.aiResponseStyle,
        showSuggestions: state.showSuggestions,
        enhancedMode: state.enhancedMode,
      }),
    }
  )
);
