import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MoodEntry {
  id: string;
  mood: string;
  notes: string;
  timestamp: Date;
}

interface MoodState {
  entries: MoodEntry[];
  currentMood?: string;
  loading: boolean;

  addEntry: (mood: string, notes: string) => void;
  setCurrentMood: (mood: string) => void;
  setLoading: (loading: boolean) => void;
  getMoodTrend: () => "improving" | "declining" | "stable";
}

export const useMoodStore = create<MoodState>()(
  persist(
    (set, get) => ({
      entries: [],
      currentMood: undefined,
      loading: false,

      addEntry: (mood, notes) => {
        const entry: MoodEntry = {
          id: `mood-${Date.now()}`,
          mood,
          notes,
          timestamp: new Date(),
        };

        set((state) => ({
          entries: [entry, ...state.entries],
          currentMood: mood,
        }));
      },

      setCurrentMood: (mood) => set({ currentMood: mood }),
      setLoading: (loading) => set({ loading }),

      getMoodTrend: () => {
        const { entries } = get();
        if (entries.length < 3) return "stable";

        const recent = entries.slice(0, 5);
        const older = entries.slice(5, 10);

        const getMoodScore = (mood: string) => {
          if (mood.includes("Great") || mood.includes("😊")) return 5;
          if (mood.includes("Good") || mood.includes("😌")) return 4;
          if (mood.includes("Okay") || mood.includes("😐")) return 3;
          if (mood.includes("Low") || mood.includes("😔")) return 2;
          if (mood.includes("Struggling") || mood.includes("😢")) return 1;
          return 3;
        };

        const recentAvg =
          recent.reduce((sum, entry) => sum + getMoodScore(entry.mood), 0) /
          recent.length;
        const olderAvg =
          older.length > 0
            ? older.reduce((sum, entry) => sum + getMoodScore(entry.mood), 0) /
              older.length
            : recentAvg;

        const diff = recentAvg - olderAvg;
        if (diff > 0.3) return "improving";
        if (diff < -0.3) return "declining";
        return "stable";
      },
    }),
    {
      name: "mood-storage",
    }
  )
);
