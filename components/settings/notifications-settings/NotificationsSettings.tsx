import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { TabsContent } from "@/components/ui/tabs";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { useAppStore, useAuthStore } from "@/stores";

interface NotificationsSettingsProps {
  emailNotifications: boolean;
  setEmailNotifications: (value: boolean) => void;
  sessionReminders: boolean;
  journalReminders: boolean;
  setSessionReminders: (value: boolean) => void;
  setJournalReminders: (value: boolean) => void;
}

export const NotificationsSettings = ({
  emailNotifications,
  setEmailNotifications,
  sessionReminders,
  journalReminders,
  setSessionReminders,
  setJournalReminders,
}: NotificationsSettingsProps) => {
  const { addNotification } = useAppStore();
  const { user } = useAuthStore();

  const [notificationLoading, setNotificationLoading] = useState(false);

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

      addNotification({
        title: "Notification preferences updated",
        description: "Your notification settings have been saved",

        variant: "success",
      });
    } catch (errorMessage: any) {
      addNotification({
        title: "Error updating preferences",
        description: errorMessage.message,
        variant: "error",
      });
    } finally {
      setNotificationLoading(false);
    }
  };

  return (
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
                <Label htmlFor="email-notifications">Email Notifications</Label>
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
  );
};
