import {
  BarChart,
  BookOpen,
  Home,
  LifeBuoy,
  MessageSquare,
  Settings,
  CalendarHeart,
  Lightbulb,
  Award,
  HelpCircle,
} from "lucide-react";

export const HELP_LINKS = [
  { label: "FAQs", icon: HelpCircle, href: "/faq" },
  { label: "Tutorials", icon: BookOpen, href: "/tutorials" },
  { label: "Support", icon: LifeBuoy, href: "/support" },
  { label: "Contact Us", icon: MessageSquare, href: "/contact" },
];

export const NAVIGATION_CONFIG = {
  main: [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: Home,
      notification: null,
    },
    {
      href: "/dashboard/chat",
      label: "AI Therapy",
      icon: MessageSquare,
      notification: null,
      highlight: true,
    },
    {
      href: "/dashboard/journal",
      label: "Journal",
      icon: BookOpen,
      notification: 2,
    },
    {
      href: "/dashboard/mood",
      label: "Mood Tracker",
      icon: BarChart,
      notification: null,
    },
  ],
  secondary: [
    {
      href: "/dashboard/calendar",
      label: "Calendar",
      icon: CalendarHeart,
      notification: null,
    },
    {
      href: "/dashboard/exercises",
      label: "Exercises",
      icon: Lightbulb,
      notification: 3,
    },
    {
      href: "/dashboard/progress",
      label: "Progress",
      icon: Award,
      notification: null,
    },
    {
      href: "/dashboard/resources",
      label: "Resources",
      icon: LifeBuoy,
      notification: null,
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: Settings,
      notification: null,
    },
  ],
};
