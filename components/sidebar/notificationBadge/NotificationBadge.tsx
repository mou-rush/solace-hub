"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface NotificationBadgeProps {
  count: number;
  className?: string;
}
export const NotificationBadge = ({
  count,
  className = "",
}: NotificationBadgeProps) => {
  if (!count) return null;

  return (
    <Badge
      variant="destructive"
      className={cn(
        "absolute -top-1.5 -right-1.5 h-5 min-w-5 p-0 flex items-center justify-center text-[10px] font-medium",
        "bg-gradient-to-r from-red-500 to-pink-500 border-0 shadow-sm",
        className
      )}
    >
      {count > 99 ? "99+" : count}
    </Badge>
  );
};
