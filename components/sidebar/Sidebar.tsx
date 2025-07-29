"use client";

import { useState, JSX, ComponentType } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import { UserProfile } from "./userProfile/UserProfile";
import { MobileSidebar } from "./mobileSidebar/MobileSidebar";
import { HelpDialog } from "./helpDialog/HelpDialog";
import { ProgressCard } from "../progressCard/ProgressCard";
import { NavItem } from "./navItem/NavItem";
import { useResponsiveSidebar } from "@/hooks/useResponsiveSidebar";
import { useDarkMode } from "@/hooks/useDarkMode";
import { NAVIGATION_CONFIG } from "./sidebarConstantsAndConfigs";
import { Logo } from "../logo/Logo";

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
  const { user } = useAuth();
  const { success, error } = useToast();

  const { darkMode, setDarkMode } = useDarkMode();
  const {
    expanded,
    mobileOpen,
    toggleSidebar,
    toggleMobileSidebar,
    closeMobileSidebar,
  } = useResponsiveSidebar();

  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  //ToDo: Replace with actual data
  const [streak] = useState(7);
  const [progressValue] = useState(68);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      success({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (errorMessage) {
      console.error("Sign out error:", errorMessage);
      error({
        title: "Sign out failed",
        description: "There was a problem signing out. Please try again.",
      });
    }
  };

  const renderNavSection = ({
    items,
    title,
    expanded,
  }: NavSectionProps): JSX.Element => (
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
            expanded={expanded}
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
          expanded || isMobile ? "justify-between" : "justify-center"
        )}
      >
        <Logo expanded={expanded || isMobile} />
        <Button
          variant="ghost"
          size="icon"
          onClick={isMobile ? toggleMobileSidebar : toggleSidebar}
          className="h-8 w-8 hover:bg-secondary/50 rounded-lg"
        >
          {(() => {
            if (isMobile) return <X className="h-4 w-4" />;
            if (expanded) return <ChevronLeft className="h-4 w-4" />;
            return <ChevronRight className="h-4 w-4" />;
          })()}
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-1 scrollbar-thin scrollbar-thumb-secondary">
        {renderNavSection({
          items: NAVIGATION_CONFIG.main,
          title: "Main",
          expanded: expanded || isMobile,
        })}

        {(expanded || isMobile) && (
          <ProgressCard streak={streak} progressValue={progressValue} />
        )}

        {renderNavSection({
          items: NAVIGATION_CONFIG.secondary,
          title: "Features",
          expanded: expanded || isMobile,
        })}
      </div>

      {/* User Profile */}
      <UserProfile
        user={user}
        expanded={expanded || isMobile}
        onSignOut={handleSignOut}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
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
      <MobileSidebar
        mobileOpen={mobileOpen}
        toggleMobileSidebar={toggleMobileSidebar}
      >
        {sidebarContent(true)}
      </MobileSidebar>

      {/* Help dialog */}
      <HelpDialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen} />

      {/* Desktop sidebar */}
      <div
        className={cn(
          "hidden lg:flex flex-col h-screen border-r border-border/50 bg-background/95 backdrop-blur-sm transition-all duration-300 ease-in-out",
          expanded ? "w-72" : "w-[72px]"
        )}
      >
        {sidebarContent()}
      </div>
    </>
  );
}
