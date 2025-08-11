"use client";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Checkbox } from "@/components/ui/checkbox";
import { useSessionStore } from "@/stores";

interface AISettingsProps {
  isSettingsOpen: boolean;
  setIsSettingsOpen: (value: boolean) => void;
}

export const AISettings = ({
  isSettingsOpen,
  setIsSettingsOpen,
}: AISettingsProps) => {
  const {
    aiResponseStyle,
    setAiResponseStyle,
    showSuggestions,
    setShowSuggestions,
  } = useSessionStore();

  return (
    <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>AI Assistant Settings</DialogTitle>
          <DialogDescription>
            Customize how your AI therapy assistant communicates with you
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Response Style</h3>
            <Select value={aiResponseStyle} onValueChange={setAiResponseStyle}>
              <SelectTrigger>
                <SelectValue placeholder="Select response style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compassionate">
                  Compassionate & Warm
                </SelectItem>
                <SelectItem value="balanced">Balanced & Neutral</SelectItem>
                <SelectItem value="direct">
                  Direct & Solution-Focused
                </SelectItem>
                <SelectItem value="reflective">
                  Reflective & Analytical
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose how your AI assistant should respond to your messages
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Chat Preferences</h3>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="suggestions"
                checked={showSuggestions}
                onCheckedChange={(checked) =>
                  setShowSuggestions(checked as boolean)
                }
              />
              <label
                htmlFor="suggestions"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Show message suggestions
              </label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => setIsSettingsOpen(false)}>
            Apply Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
