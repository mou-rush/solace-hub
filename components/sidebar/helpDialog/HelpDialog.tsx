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
import { HELP_LINKS } from "../sidebarConstantsAndConfigs";

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const HelpDialog = ({ open, onOpenChange }: HelpDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-[500px] bg-background/95 backdrop-blur-sm">
      <DialogHeader>
        <DialogTitle className="text-xl">Need Help?</DialogTitle>
        <DialogDescription>
          Find resources and support to help you get the most out of SolaceHub.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-6 py-4">
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Quick Links</h3>
          <div className="grid grid-cols-2 gap-3">
            {HELP_LINKS.map(({ label, icon: Icon, href }) => (
              <Button
                key={href}
                variant="outline"
                className="justify-start h-12 hover:bg-secondary/80"
                onClick={() => window.open(href, "_blank")}
              >
                <Icon className="mr-2 h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-lg text-red-600 dark:text-red-400">
            Need immediate help?
          </h3>
          <p className="text-sm text-muted-foreground">
            If you're experiencing a mental health emergency, please call the
            crisis helpline:
          </p>
          <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
            <p className="font-bold text-2xl text-center text-red-600 dark:text-red-400">
              988
            </p>
            <p className="text-sm text-center text-muted-foreground">
              Suicide Prevention Crisis Lines (NA)
            </p>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={() => onOpenChange(false)} className="w-full">
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
