/**
 * Centralized lazy-loaded components.
 * Import from here instead of using next/dynamic inline at call sites.
 */

import dynamic from "next/dynamic";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { PageSkeleton } from "@/components/ui/PageSkeleton";

// ── Dashboard layout

export const LazySidebar = dynamic(
  () => import("@/components/layout/Sidebar").then((m) => m.Sidebar),
  {
    ssr: false,
    loading: () => (
      <div className="hidden lg:flex flex-col h-screen w-[72px] border-r border-border/50 bg-background/95 animate-pulse" />
    ),
  },
);

// ── Dashboard sub-pages

export const LazyTherapySession = dynamic(
  () => import("@/components/therapySession/TherapySession"),
  {
    ssr: false,
    loading: () => <DashboardSkeleton />,
  },
);

export const LazyJournal = dynamic(
  () => import("@/components/journal/Journal"),
  {
    ssr: false,
    loading: () => <PageSkeleton />,
  },
);

export const LazyMood = dynamic(() => import("@/components/mood/Mood"), {
  ssr: false,
  loading: () => <PageSkeleton />,
});

export const LazyResources = dynamic(
  () => import("@/components/resources/Resources"),
  {
    ssr: false,
    loading: () => <PageSkeleton />,
  },
);

export const LazySettings = dynamic(
  () => import("@/components/settings/Settings"),
  {
    ssr: false,
    loading: () => <PageSkeleton />,
  },
);

// ── Sidebar sub-components

export const LazyHelpDialog = dynamic(
  () =>
    import("@/components/sidebar/helpDialog/HelpDialog").then(
      (m) => m.HelpDialog,
    ),
  { ssr: false },
);

export const LazyMobileSidebar = dynamic(
  () =>
    import("@/components/sidebar/mobileSidebar/MobileSidebar").then(
      (m) => m.MobileSidebar,
    ),
  { ssr: false },
);
