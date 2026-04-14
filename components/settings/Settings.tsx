"use client";

import type React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Key, Paintbrush, Shield, User } from "lucide-react";
import { ProfileSittings } from "@/components/settings/profile-settings/ProfileSittings";
import { SecuritySettings } from "@/components/settings/security-settings/SecuritySettings";
import { NotificationsSettings } from "@/components/settings/notifications-settings/NotificationsSettings";
import { AppearanceSettings } from "@/components/settings/appearance-settings/AppearenceSettings";
import { PrivacySettings } from "@/components/settings/privacy-settings/PrivacySettings";

export default function SettingsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account preferences and settings
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden md:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <span className="hidden md:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            <span className="hidden md:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Paintbrush className="h-4 w-4" />
            <span className="hidden md:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden md:inline">Privacy</span>
          </TabsTrigger>
        </TabsList>

        <ProfileSittings />

        <SecuritySettings />

        <NotificationsSettings />

        <AppearanceSettings />

        <PrivacySettings />
      </Tabs>
    </div>
  );
}
