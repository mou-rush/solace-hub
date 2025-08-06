"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Key, Paintbrush, Shield, User } from "lucide-react";
import { ProfileSittings } from "@/components/settings/profile-settings/ProfileSittings";
import { SecuritySettings } from "@/components/settings/security-settings/SecuritySettings";
import { NotificationsSettings } from "@/components/settings/notifications-settings/NotificationsSettings";
import { AppearanceSettings } from "@/components/settings/appearance-settings/AppearenceSettings";
import { PrivacySettings } from "@/components/settings/privacy-settings/PrivacySettings";
import { useAuthStore } from "@/stores";

export default function SettingsPage() {
  const { user } = useAuthStore();

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [sessionReminders, setSessionReminders] = useState(true);
  const [journalReminders, setJournalReminders] = useState(true);

  const [dataSharing, setDataSharing] = useState(false);
  const [anonymousAnalytics, setAnonymousAnalytics] = useState(true);

  useEffect(() => {
    if (user) {
      setUserName(user.displayName || "");
      setEmail(user.email || "");

      const fetchUserPreferences = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();

            if (userData.preferences?.notifications) {
              setEmailNotifications(
                userData.preferences.notifications.email ?? true
              );
              setSessionReminders(
                userData.preferences.notifications.sessions ?? true
              );
              setJournalReminders(
                userData.preferences.notifications.journal ?? true
              );
            }

            if (userData.preferences?.privacy) {
              setDataSharing(userData.preferences.privacy.dataSharing ?? false);
              setAnonymousAnalytics(
                userData.preferences.privacy.anonymousAnalytics ?? true
              );
            }
          }
        } catch (error) {
          console.error("Error fetching user preferences:", error);
        }
      };

      fetchUserPreferences();
    }
  }, [user]);

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

        <ProfileSittings
          user={user}
          email={email}
          setUserName={setUserName}
          userName={userName}
          setEmail={setEmail}
        />

        <SecuritySettings />

        <NotificationsSettings
          emailNotifications={emailNotifications}
          sessionReminders={sessionReminders}
          journalReminders={journalReminders}
          setJournalReminders={setJournalReminders}
          setSessionReminders={setSessionReminders}
          setEmailNotifications={setEmailNotifications}
        />

        <AppearanceSettings />

        <PrivacySettings
          dataSharing={dataSharing}
          setDataSharing={setDataSharing}
          anonymousAnalytics={anonymousAnalytics}
          setAnonymousAnalytics={setAnonymousAnalytics}
        />
      </Tabs>
    </div>
  );
}
