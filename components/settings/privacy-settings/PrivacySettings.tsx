import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { Switch } from "@radix-ui/react-switch";
import { TabsContent } from "@radix-ui/react-tabs";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/lib/hooks/useToast";
import { useAuth } from "@/components/auth-provider";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface PrivacySettingsProps {
  dataSharing: boolean;
  setDataSharing: (value: boolean) => void;
  anonymousAnalytics: boolean;
  setAnonymousAnalytics: (value: boolean) => void;
}
export const PrivacySettings = ({
  dataSharing,
  anonymousAnalytics,
  setDataSharing,
  setAnonymousAnalytics,
}: PrivacySettingsProps) => {
  const { user } = useAuth();

  const { error, success } = useToast();

  const [privacyLoading, setPrivacyLoading] = useState(false);

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
                <Label htmlFor="data-sharing">Data Sharing for Research</Label>
                <p className="text-sm text-muted-foreground">
                  Allow anonymized data to be used for mental health research
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
                <Label htmlFor="anonymous-analytics">Anonymous Analytics</Label>
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
            Your privacy is important to us. We never sell your personal data or
            share it with third parties without your consent.
          </p>
        </CardFooter>
      </Card>
    </TabsContent>
  );
};
