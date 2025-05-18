"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import {
  updateProfile,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/useToast";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  Bell,
  Check,
  Key,
  Moon,
  Paintbrush,
  Shield,
  Sun,
  User,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ProfileSittings } from "./ProfileSettings/ProfileSittings";

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { error, success } = useToast();

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [sessionReminders, setSessionReminders] = useState(true);
  const [journalReminders, setJournalReminders] = useState(true);
  const [notificationLoading, setNotificationLoading] = useState(false);

  const [dataSharing, setDataSharing] = useState(false);
  const [anonymousAnalytics, setAnonymousAnalytics] = useState(true);
  const [privacyLoading, setPrivacyLoading] = useState(false);

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

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;

    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    setPasswordLoading(true);

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      success({
        title: "Password updated",
        description: "Your password has been changed successfully",
      });
    } catch (errorMessage: any) {
      if (errorMessage.code === "auth/wrong-password") {
        setPasswordError("Current password is incorrect");
      } else {
        setPasswordError(errorMessage.message);
      }

      error({
        title: "Error updating password",
        description: errorMessage.message,
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleUpdateNotifications = async () => {
    if (!user) return;

    setNotificationLoading(true);

    try {
      await updateDoc(doc(db, "users", user.uid), {
        "preferences.notifications": {
          email: emailNotifications,
          sessions: sessionReminders,
          journal: journalReminders,
        },
        updatedAt: new Date().toISOString(),
      });

      success({
        title: "Notification preferences updated",
        description: "Your notification settings have been saved",
      });
    } catch (errorMessage: any) {
      error({
        title: "Error updating preferences",
        description: errorMessage.message,
      });
    } finally {
      setNotificationLoading(false);
    }
  };

  const handleUpdatePrivacy = async () => {
    if (!user) return;

    setPrivacyLoading(true);

    try {
      await updateDoc(doc(db, "users", user.uid), {
        "preferences.privacy": {
          dataSharing,
          anonymousAnalytics,
        },
        updatedAt: new Date().toISOString(),
      });

      success({
        title: "Privacy preferences updated",
        description: "Your privacy settings have been saved",
      });
    } catch (errorMessage: any) {
      error({
        title: "Error updating preferences",
        description: errorMessage.message,
      });
    } finally {
      setPrivacyLoading(false);
    }
  };

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

        {/* Profile Settings */}
        <ProfileSittings
          user={user}
          email={email}
          setUserName={setUserName}
          userName={userName}
          setEmail={setEmail}
        />

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Change your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdatePassword}>
              <CardContent className="space-y-4">
                {passwordError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{passwordError}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password"
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    required
                    minLength={6}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? "Updating..." : "Update Password"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how and when you receive notifications from SolaceHub
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive important updates and summaries via email
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="session-reminders">Session Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get reminders for scheduled therapy sessions
                    </p>
                  </div>
                  <Switch
                    id="session-reminders"
                    checked={sessionReminders}
                    onCheckedChange={setSessionReminders}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="journal-reminders">Journal Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive daily reminders to write in your journal
                    </p>
                  </div>
                  <Switch
                    id="journal-reminders"
                    checked={journalReminders}
                    onCheckedChange={setJournalReminders}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleUpdateNotifications}
                className="bg-teal-600 hover:bg-teal-700"
                disabled={notificationLoading}
              >
                {notificationLoading ? "Saving..." : "Save Preferences"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how SolaceHub looks for you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex flex-wrap gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    className={`flex flex-col items-center justify-center gap-2 h-auto py-4 px-6 ${
                      theme === "light" ? "border-teal-600 bg-teal-50" : ""
                    }`}
                    onClick={() => setTheme("light")}
                  >
                    <Sun className="h-6 w-6" />
                    <span>Light</span>
                    {theme === "light" && (
                      <Check className="absolute top-2 right-2 h-4 w-4 text-teal-600" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className={`flex flex-col items-center justify-center gap-2 h-auto py-4 px-6 ${
                      theme === "dark"
                        ? "border-teal-600 bg-gray-800 text-white"
                        : ""
                    }`}
                    onClick={() => setTheme("dark")}
                  >
                    <Moon className="h-6 w-6" />
                    <span>Dark</span>
                    {theme === "dark" && (
                      <Check className="absolute top-2 right-2 h-4 w-4 text-teal-600" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className={`flex flex-col items-center justify-center gap-2 h-auto py-4 px-6 ${
                      theme === "system" ? "border-teal-600 bg-gray-100" : ""
                    }`}
                    onClick={() => setTheme("system")}
                  >
                    <div className="flex">
                      <Sun className="h-6 w-6" />
                      <Moon className="h-6 w-6 ml-1" />
                    </div>
                    <span>System</span>
                    {theme === "system" && (
                      <Check className="absolute top-2 right-2 h-4 w-4 text-teal-600" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Data</CardTitle>
              <CardDescription>
                Manage how your data is used and shared
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="data-sharing">
                      Data Sharing for Research
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Allow anonymized data to be used for mental health
                      research
                    </p>
                  </div>
                  <Switch
                    id="data-sharing"
                    checked={dataSharing}
                    onCheckedChange={setDataSharing}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="anonymous-analytics">
                      Anonymous Analytics
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Help improve SolaceHub with anonymous usage data
                    </p>
                  </div>
                  <Switch
                    id="anonymous-analytics"
                    checked={anonymousAnalytics}
                    onCheckedChange={setAnonymousAnalytics}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-4">
              <Button
                onClick={handleUpdatePrivacy}
                className="bg-teal-600 hover:bg-teal-700"
                disabled={privacyLoading}
              >
                {privacyLoading ? "Saving..." : "Save Privacy Settings"}
              </Button>
              <p className="text-sm text-muted-foreground">
                Your privacy is important to us. We never sell your personal
                data or share it with third parties without your consent.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
