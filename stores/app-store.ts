import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface AppState {
  theme: "light" | "dark" | "system";
  sidebarExpanded: boolean;
  sidebarMobileOpen: boolean;
  notifications: Notification[];
  setTheme: (theme: "light" | "dark" | "system") => void;
  toggleSidebar: () => void;
  setSidebarExpanded: (expanded: boolean) => void;
  toggleMobileSidebar: () => void;
  addNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
}

interface Notification {
  id: string;
  title: string;
  description: string;
  variant: "success" | "error" | "warning" | "info";
  duration?: number;
}

export const useAppStore = create<AppState>()(
  subscribeWithSelector((set, get) => ({
    theme: "light",
    sidebarExpanded: true,
    sidebarMobileOpen: false,
    notifications: [],

    setTheme: (theme) => {
      set({ theme });
      if (typeof window !== "undefined") {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");

        if (theme === "system") {
          const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
            .matches
            ? "dark"
            : "light";
          root.classList.add(systemTheme);
        } else {
          root.classList.add(theme);
        }
      }
    },

    toggleSidebar: () =>
      set((state) => ({
        sidebarExpanded: !state.sidebarExpanded,
      })),

    setSidebarExpanded: (expanded) => set({ sidebarExpanded: expanded }),

    toggleMobileSidebar: () =>
      set((state) => ({
        sidebarMobileOpen: !state.sidebarMobileOpen,
      })),

    addNotification: (notification) => {
      const id = `notification-${Date.now()}`;
      set((state) => ({
        notifications: [...state.notifications, { ...notification, id }],
      }));

      // Auto-remove notification after duration
      if (notification.duration !== Infinity) {
        setTimeout(() => {
          get().removeNotification(id);
        }, notification.duration || 5000);
      }
    },

    removeNotification: (id) =>
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      })),
  }))
);
