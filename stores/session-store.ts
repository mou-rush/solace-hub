import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SessionState {
  // Current session data //
  sessionId: string | null;
  sessionTheme: string;
  sessionNotes: string;
  sessionGoals: string[];
  sessionDate: Date;
  currentMood?: string;

  // UI state //
  loading: boolean;
  isNotesOpen: boolean;
  showHistory: boolean;
  isSettingsOpen: boolean;
  showInsightsModal: boolean;
  hasNewInsights: boolean;
  showSuggestions: boolean;

  // AI settings //
  enhancedMode: boolean;
  aiResponseStyle: "compassionate" | "balanced" | "direct" | "reflective";

  // Actions //
  setSessionId: (id: string | null) => void;
  setSessionTheme: (theme: string) => void;
  setSessionNotes: (notes: string) => void;
  setSessionGoals: (goals: string[]) => void;
  addSessionGoal: (goal: string) => void;
  removeSessionGoal: (index: number) => void;
  setCurrentMood: (mood: string | undefined) => void;

  setLoading: (loading: boolean) => void;
  setIsNotesOpen: (isOpen: boolean) => void;
  setShowHistory: (show: boolean) => void;
  setIsSettingsOpen: (isOpen: boolean) => void;
  setShowInsightsModal: (show: boolean) => void;
  setHasNewInsights: (hasNew: boolean) => void;
  setShowSuggestions: (show: boolean) => void;

  setEnhancedMode: (enhanced: boolean) => void;
  setAiResponseStyle: (
    style: "compassionate" | "balanced" | "direct" | "reflective"
  ) => void;

  resetSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      // Initial state //
      sessionId: null,
      sessionTheme: "",
      sessionNotes: "",
      sessionGoals: [],
      sessionDate: new Date(),
      currentMood: undefined,

      loading: false,
      isNotesOpen: false,
      showHistory: false,
      isSettingsOpen: false,
      showInsightsModal: false,
      hasNewInsights: false,
      showSuggestions: true,

      enhancedMode: false,
      aiResponseStyle: "compassionate",

      // Actions //
      setSessionId: (id) => set({ sessionId: id }),
      setSessionTheme: (theme) => set({ sessionTheme: theme }),
      setSessionNotes: (notes) => set({ sessionNotes: notes }),
      setSessionGoals: (goals) => set({ sessionGoals: goals }),

      addSessionGoal: (goal) => {
        const trimmed = goal.trim();
        if (!trimmed) return;
        set((state) => ({
          sessionGoals: [...state.sessionGoals, trimmed],
        }));
      },

      removeSessionGoal: (index) => {
        set((state) => ({
          sessionGoals: state.sessionGoals.filter((_, i) => i !== index),
        }));
      },

      setCurrentMood: (mood) => set({ currentMood: mood }),

      setLoading: (loading) => set({ loading }),
      setIsNotesOpen: (isOpen) => set({ isNotesOpen: isOpen }),
      setShowHistory: (show) => set({ showHistory: show }),
      setIsSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
      setShowInsightsModal: (show) => set({ showInsightsModal: show }),
      setHasNewInsights: (hasNew) => set({ hasNewInsights: hasNew }),
      setShowSuggestions: (show) => set({ showSuggestions: show }),

      setEnhancedMode: (enhanced) => set({ enhancedMode: enhanced }),
      setAiResponseStyle: (style) => set({ aiResponseStyle: style }),

      resetSession: () =>
        set({
          sessionTheme: "",
          sessionNotes: "",
          sessionGoals: [],
          sessionDate: new Date(),
          currentMood: undefined,
          isNotesOpen: false,
          hasNewInsights: false,
        }),
    }),
    {
      name: "session-storage",
      partialize: (state) => ({
        enhancedMode: state.enhancedMode,
        aiResponseStyle: state.aiResponseStyle,
        showSuggestions: state.showSuggestions,
      }),
    }
  )
);
