"use client";

import { useState, JSX, ComponentType } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { UserProfile } from "@/components/sidebar/userProfile/UserProfile";
import { MobileSidebar } from "@/components/sidebar/mobileSidebar/MobileSidebar";
import { HelpDialog } from "@/components/sidebar/helpDialog/HelpDialog";
import { ProgressCard } from "@/components/progressCard/ProgressCard";
import { NavItem } from "@/components/sidebar/navItem/NavItem";
import { NAVIGATION_CONFIG } from "@/components/sidebar/sidebarConstantsAndConfigs";
import { Logo } from "@/components/logo/Logo";
import { useAppStore } from "@/stores";

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
}

export function Sidebar() {
  const pathname = usePathname();

  const {
    sidebarExpanded,
    toggleSidebar,
    toggleMobileSidebar,
    addNotification,
  } = useAppStore();
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  //ToDo: Replace with actual data
  const [streak] = useState(7);
  const [progressValue] = useState(68);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
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
  };

  const renderNavSection = ({ items, title }: NavSectionProps): JSX.Element => (
    <div className="mb-6">
      {sidebarExpanded && (
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

  const sidebarContent = (isMobile = false) => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className={cn(
          "p-4 border-b border-border/50 flex",
          sidebarExpanded || isMobile ? "justify-between" : "justify-center"
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
        {renderNavSection({
          items: NAVIGATION_CONFIG.main,
          title: "Main",
          expanded: sidebarExpanded || isMobile,
        })}

        {(sidebarExpanded || isMobile) && (
          <ProgressCard streak={streak} progressValue={progressValue} />
        )}

        {renderNavSection({
          items: NAVIGATION_CONFIG.secondary,
          title: "Features",
          expanded: sidebarExpanded || isMobile,
        })}
      </div>

      {/* User Profile */}
      <UserProfile
        onSignOut={handleSignOut}
        onHelpClick={() => setHelpDialogOpen(true)}
      />
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
      <MobileSidebar>{sidebarContent(true)}</MobileSidebar>
      {/* Help dialog */}
      <HelpDialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen} />

      {/* Desktop sidebar */}
      <div
        className={cn(
          "hidden lg:flex flex-col h-screen border-r border-border/50 bg-background/95 backdrop-blur-sm transition-all duration-300 ease-in-out",
          sidebarExpanded ? "w-72" : "w-[72px]"
        )}
      >
        {sidebarContent()}
      </div>
    </>
  );
}
