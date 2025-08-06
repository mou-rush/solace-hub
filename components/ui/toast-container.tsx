"use client";

import { useAppStore } from "@/stores";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/utils";

export function ToastContainer() {
  const { notifications, removeNotification } = useAppStore();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={cn(
            "min-w-80 p-4 rounded-lg shadow-lg border animate-in slide-in-from-right-full",
            {
              "bg-green-50 border-green-200":
                notification.variant === "success",
              "bg-red-50 border-red-200": notification.variant === "error",
              "bg-yellow-50 border-yellow-200":
                notification.variant === "warning",
              "bg-blue-50 border-blue-200": notification.variant === "info",
            }
          )}
        >
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-sm">{notification.title}</h4>
              {notification.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.description}
                </p>
              )}
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
