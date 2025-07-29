"use client";

import Link from "next/link";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationBadge } from "../notificationBadge/NotificationBadge";
import { ElementType } from "react";

interface NavItemProps {
  item: {
    href: string;
    icon: ElementType;
    label: string;
    highlight?: boolean;
    notification?: number;
  };
  expanded: boolean;
  isActive: boolean;
}
export const NavItem = ({ item, expanded, isActive }: NavItemProps) => {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-in-out",
        "hover:scale-[1.02] active:scale-[0.98]",
        isActive
          ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25"
          : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground",
        item.highlight &&
          !isActive &&
          "ring-1 ring-primary/20 hover:ring-primary/40",
        !expanded && "justify-center"
      )}
      title={expanded ? "" : item.label}
    >
      <div className="relative flex-shrink-0">
        <Icon
          className={cn(
            "h-5 w-5 transition-all duration-200",
            isActive ? "scale-110" : "group-hover:scale-105",
            item.highlight && !isActive && "text-primary"
          )}
        />
        <NotificationBadge count={item.notification} />
        {item.highlight && (
          <Zap className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500 animate-pulse" />
        )}
      </div>

      <span
        className={cn(
          "transition-all duration-200 truncate",
          expanded
            ? "opacity-100 translate-x-0"
            : "opacity-0 -translate-x-2 w-0 hidden lg:inline-block lg:group-hover:opacity-100 lg:group-hover:translate-x-0"
        )}
      >
        {item.label}
      </span>

      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-foreground rounded-r-full" />
      )}
    </Link>
  );
};
