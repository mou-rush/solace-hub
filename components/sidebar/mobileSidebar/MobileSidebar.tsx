"use client";

import { cn } from "@/lib/utils/utils";
import { useAppStore } from "@/stores";
import { ReactNode } from "react";

interface MobileSidebarProps {
  children: ReactNode;
}

export const MobileSidebar = ({ children }: MobileSidebarProps) => {
  const { sidebarMobileOpen, toggleMobileSidebar } = useAppStore();
  return (
    <div
      className={cn(
        "lg:hidden fixed inset-0 z-50",
        !sidebarMobileOpen && "pointer-events-none"
      )}
    >
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300",
          sidebarMobileOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={toggleMobileSidebar}
      />

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 bg-background/95 backdrop-blur-xl border-r shadow-2xl transform transition-transform duration-300 ease-out",
          sidebarMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {children}
      </div>
    </div>
  );
};
