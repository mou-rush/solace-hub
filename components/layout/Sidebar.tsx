"use client";

import { useState, useCallback, JSX, ComponentType, memo } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import { cn, playSuccessSound } from "@/lib/utils/utils";
import { UserProfile } from "@/components/sidebar/userProfile/UserProfile";
import { ProgressCard } from "@/components/progressCard/ProgressCard";
import { NavItem } from "@/components/sidebar/navItem/NavItem";
import { NAVIGATION_CONFIG } from "@/components/sidebar/sidebarConstantsAndConfigs";
import { Logo } from "@/components/logo/Logo";
import { useAppStore } from "@/stores";

import { LazyHelpDialog, LazyMobileSidebar } from "@/lib/lazy-components";

interface NavItemConfig {
  href: string;
  icon: ComponentType;
  label: string;
  badge?: string;
  color?: string;
}

interface NavSectionProps {
  items: NavItemConfig[];
  title: string;
  expanded: boolean;
  pathname: string;
}

const NavSection = memo(function NavSection({
  items,
  title,
  expanded,
  pathname,
}: NavSectionProps): JSX.Element {
  return (
    <div className="mb-6">
      {expanded && (
        <p className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mx-3 mb-3">
          {title}
        </p>
      )}
      <nav className="space-y-1 px-2">
        {items.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            isActive={pathname === item.href}
          />
        ))}
      </nav>
    </div>
  );
});

export function Sidebar() {
  const pathname = usePathname();

  const {
    sidebarExpanded,
    toggleSidebar,
    toggleMobileSidebar,
    addNotification,
  } = useAppStore();
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const streak = 7;
  const progressValue = 68;

  const handleSignOut = useCallback(async () => {
    try {
      await signOut(auth);
      playSuccessSound();
      addNotification({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
        variant: "success",
      });
    } catch (error) {
      console.error("Sign out error:", error);
      addNotification({
        title: "Sign out failed",
        description: "There was a problem signing out. Please try again.",
        variant: "error",
      });
    }
  }, [addNotification]);

  const handleHelpClick = useCallback(() => setHelpDialogOpen(true), []);

  const sidebarContent = (isMobile = false) => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className={cn(
          "p-4 border-b border-border/50 flex",
          sidebarExpanded || isMobile ? "justify-between" : "justify-center",
        )}
      >
        <Logo />
        <Button
          variant="ghost"
          size="icon"
          onClick={isMobile ? toggleMobileSidebar : toggleSidebar}
          className="h-8 w-8 hover:bg-secondary/50 rounded-lg"
        >
          {(() => {
            if (isMobile) return <X className="h-4 w-4" />;
            if (sidebarExpanded) return <ChevronLeft className="h-4 w-4" />;
            return <ChevronRight className="h-4 w-4" />;
          })()}
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-1 scrollbar-thin scrollbar-thumb-secondary">
        <NavSection
          items={NAVIGATION_CONFIG.main}
          title="Main"
          expanded={sidebarExpanded || isMobile}
          pathname={pathname}
        />

        {(sidebarExpanded || isMobile) && (
          <ProgressCard streak={streak} progressValue={progressValue} />
        )}

        <NavSection
          items={NAVIGATION_CONFIG.secondary}
          title="Features"
          expanded={sidebarExpanded || isMobile}
          pathname={pathname}
        />
      </div>

      {/* User Profile */}
      <UserProfile onSignOut={handleSignOut} onHelpClick={handleHelpClick} />
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-6 right-6 z-40 rounded-full shadow-xl bg-primary text-primary-foreground border-primary hover:bg-primary/90 lg:hidden h-14 w-14"
        onClick={toggleMobileSidebar}
      >
        <Menu className="h-6 w-6" />
      </Button>
      {/* Mobile sidebar */}
      <LazyMobileSidebar>{sidebarContent(true)}</LazyMobileSidebar>
      {/* Help dialog */}
      <LazyHelpDialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen} />

      {/* Desktop sidebar */}
      <div
        className={cn(
          "hidden lg:flex flex-col h-screen border-r border-border/50 bg-background/95 backdrop-blur-sm transition-all duration-300 ease-in-out",
          sidebarExpanded ? "w-72" : "w-[72px]",
        )}
      >
        {sidebarContent()}
      </div>
    </>
  );
}
