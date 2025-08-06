import { create } from "zustand";
import { persist } from "zustand/middleware";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  tag?: string;
  insight?: string;
  timestamp: Date;
}

interface JournalState {
  entries: JournalEntry[];
  loading: boolean;

  addEntry: (entry: Omit<JournalEntry, "id" | "timestamp">) => void;
  updateEntry: (id: string, updates: Partial<JournalEntry>) => void;
  removeEntry: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      entries: [],
      loading: false,

      addEntry: (entryData) => {
        const entry: JournalEntry = {
          ...entryData,
          id: `journal-${Date.now()}`,
          timestamp: new Date(),
        };

        set((state) => ({
          entries: [entry, ...state.entries],
        }));
      },

      updateEntry: (id, updates) => {
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id ? { ...entry, ...updates } : entry
          ),
        }));
      },

      removeEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
        }));
      },

      setLoading: (loading) => set({ loading }),
    }),
    {
      name: "journal-storage",
    }
  )
);
