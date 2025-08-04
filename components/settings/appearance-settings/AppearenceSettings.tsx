import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { TabsContent } from "@radix-ui/react-tabs";
import { Sun, Check, Moon } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";

export const AppearanceSettings = () => {
  const { theme, setTheme } = useTheme();
  return (
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
  );
};
