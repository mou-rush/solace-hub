"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, Moon, Settings, Sun, User, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useAppStore, useAuthStore } from "@/stores";

interface UserProfileProps {
  onSignOut: () => void;
  onHelpClick: () => void;
}

export const UserProfile = ({ onSignOut, onHelpClick }: UserProfileProps) => {
  const { sidebarExpanded, sidebarMobileOpen, theme } = useAppStore();
  const { user } = useAuthStore();

  const expanded = sidebarExpanded || sidebarMobileOpen;
  const newTheme = theme === "dark" ? "light" : "dark";
  const handleChangeTheme = (theme: "light" | "dark" | "system") =>
    useAppStore.getState().setTheme(theme);

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div
      className={cn("border-t bg-secondary/30", expanded ? "p-4" : "py-4 px-2")}
    >
      <div
        className={cn(
          "flex",
          expanded
            ? "items-center justify-between"
            : "flex-col items-center gap-2"
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "p-0 h-auto hover:bg-secondary/50 rounded-xl transition-all duration-200",
                expanded
                  ? "flex items-center gap-3"
                  : "flex flex-col items-center gap-1"
              )}
            >
              <div className="relative">
                <Avatar
                  className={cn(
                    "ring-2 ring-primary/20",
                    expanded ? "h-10 w-10" : "h-8 w-8"
                  )}
                >
                  <AvatarImage
                    src={user?.photoURL || ""}
                    alt={user?.displayName || "User"}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-primary-foreground">
                    {getInitials(user?.displayName || "")}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full ring-2 ring-background" />
              </div>
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
          <DropdownMenuContent
            align="end"
            className="w-56 bg-background/95 backdrop-blur-sm"
          >
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/dashboard/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {theme ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Sun className="h-4 w-4" />
                  )}
                  <span className="text-sm">Dark Mode</span>
                </div>
                <Switch
                  id="dark-mode"
                  checked={theme === "dark"}
                  onCheckedChange={(checked) =>
                    handleChangeTheme(checked ? "dark" : "light")
                  }
                />
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onHelpClick} className="cursor-pointer">
              <HelpCircle className="mr-2 h-4 w-4" />
              Help & Support
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onSignOut}
              className="text-red-500 focus:text-red-500 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {expanded && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-secondary/50 rounded-lg"
              onClick={() => handleChangeTheme(newTheme)}
            >
              {theme ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-secondary/50 rounded-lg"
              onClick={onHelpClick}
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
