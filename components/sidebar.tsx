"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Heart,
  Home,
  LifeBuoy,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Settings,
  Sun,
  User,
  CalendarHeart,
  Lightbulb,
  Award,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/useToast";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [streak, setStreak] = useState(7);
  const [progressValue, setProgressValue] = useState(68);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setExpanded(false);
      } else {
        setExpanded(true);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

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

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const mainNavItems = [
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
  ];

  const secondaryNavItems = [
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
  ];

  const renderNavItem = (item, index) => {
    const Icon = item.icon;
    const isActive = pathname === item.href;

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        )}
        title={expanded ? "" : item.label}
      >
        <div className="relative">
          <Icon className={cn("h-5 w-5", isActive ? "" : "stroke-[1.5px]")} />
          {item.notification && (
            <Badge
              variant="destructive"
              className={cn(
                "absolute -top-1.5 -right-1.5 h-4 min-w-4 p-0 flex items-center justify-center text-[10px]",
                expanded ? "" : ""
              )}
            >
              {item.notification}
            </Badge>
          )}
        </div>
        <span
          className={cn(
            "transition-opacity",
            expanded
              ? "opacity-100"
              : "opacity-0 w-0 hidden lg:inline-block lg:opacity-0 lg:group-hover:opacity-100"
          )}
        >
          {item.label}
        </span>
      </Link>
    );
  };

  const MobileSidebar = () => (
    <div
      className={`lg:hidden fixed inset-0 z-50 ${
        mobileOpen ? "" : "pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity ${
          mobileOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={toggleMobileSidebar}
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-background border-r shadow-lg transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold">SolaceHub</span>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleMobileSidebar}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4 px-3">
            <div className="mb-6">
              <p className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mx-3 mb-2">
                Main
              </p>
              <nav className="space-y-1">
                {mainNavItems.map((item) => renderNavItem(item))}
              </nav>
            </div>

            <div className="mb-6">
              <p className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mx-3 mb-2">
                Features
              </p>
              <nav className="space-y-1">
                {secondaryNavItems.map((item) => renderNavItem(item))}
              </nav>
            </div>

            <div className="px-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase text-muted-foreground font-semibold">
                  Dark Mode
                </span>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="dark-mode-mobile"
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* User section */}
          <div className="p-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage
                    src={user?.photoURL || ""}
                    alt={user?.displayName || "User"}
                  />
                  <AvatarFallback>
                    {getInitials(user?.displayName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {user?.displayName || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                    {user?.email}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Help Dialog
  const HelpDialog = () => (
    <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Need Help?</DialogTitle>
          <DialogDescription>
            Find resources and support to help you get the most out of
            SolaceHub.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h3 className="font-medium">Quick Links</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => window.open("/faq", "_blank")}
              >
                <HelpCircle className="mr-2 h-4 w-4" />
                FAQs
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => window.open("/tutorials", "_blank")}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Tutorials
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => window.open("/support", "_blank")}
              >
                <LifeBuoy className="mr-2 h-4 w-4" />
                Support
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => window.open("/contact", "_blank")}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Contact Us
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Need immediate help?</h3>
            <p className="text-sm text-muted-foreground">
              If you're experiencing a mental health emergency, please call the
              crisis helpline:
            </p>
            <div className="bg-secondary p-3 rounded-md">
              <p className="font-medium text-center">988</p>
              <p className="text-xs text-center text-muted-foreground">
                Suicide & Crisis Lifeline (US)
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => setHelpDialogOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-40 rounded-full shadow-lg lg:hidden"
        onClick={toggleMobileSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile sidebar */}
      <MobileSidebar />

      {/* Help dialog */}
      <HelpDialog />

      {/* Desktop sidebar */}
      <div
        className={cn(
          "hidden lg:flex flex-col h-screen border-r transition-all duration-300",
          expanded ? "w-64" : "w-[70px]"
        )}
      >
        {/* Logo and expand/collapse */}
        <div
          className={cn(
            "p-4 border-b flex",
            expanded ? "justify-between" : "justify-center"
          )}
        >
          {expanded && (
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold">SolaceHub</span>
            </div>
          )}
          {!expanded && <Heart className="w-6 h-6 text-primary" />}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8"
          >
            {expanded ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Main navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="mb-6">
            {expanded && (
              <p className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mx-3 mb-2">
                Main
              </p>
            )}
            <nav className="space-y-1 px-2">
              {mainNavItems.map(renderNavItem)}
            </nav>
          </div>

          {expanded && (
            <div className="mx-3 mb-4">
              <div className="bg-secondary/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Daily Streak</span>
                  <Badge variant="outline" className="bg-primary/10">
                    {streak} days
                  </Badge>
                </div>
                <Progress value={progressValue} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {progressValue}% towards your weekly goal
                </p>
              </div>
            </div>
          )}

          <div className="mb-6">
            {expanded && (
              <p className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mx-3 mb-2">
                Features
              </p>
            )}
            <nav className="space-y-1 px-2">
              {secondaryNavItems.map(renderNavItem)}
            </nav>
          </div>
        </div>

        {/* Footer with user info */}
        <div className={cn("border-t", expanded ? "p-4" : "py-4 px-2")}>
          <div
            className={cn(
              "flex",
              expanded
                ? "items-center justify-between"
                : "flex-col items-center"
            )}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "p-0 h-auto",
                    expanded
                      ? "flex items-center gap-3"
                      : "flex flex-col items-center gap-1"
                  )}
                >
                  <Avatar className={expanded ? "h-9 w-9" : "h-8 w-8"}>
                    <AvatarImage
                      src={user?.photoURL || ""}
                      alt={user?.displayName || "User"}
                    />
                    <AvatarFallback>
                      {getInitials(user?.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  {expanded && (
                    <div className="text-left">
                      <p className="text-sm font-medium line-clamp-1">
                        {user?.displayName || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-[130px]">
                        {user?.email}
                      </p>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {darkMode ? (
                        <Moon className="h-4 w-4" />
                      ) : (
                        <Sun className="h-4 w-4" />
                      )}
                      <span className="text-sm">Dark Mode</span>
                    </div>
                    <Switch
                      id="dark-mode"
                      checked={darkMode}
                      onCheckedChange={setDarkMode}
                    />
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setHelpDialogOpen(true)}
                  className="cursor-pointer"
                >
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-500 focus:text-red-500 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {expanded && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  {darkMode ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Sun className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setHelpDialogOpen(true)}
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
