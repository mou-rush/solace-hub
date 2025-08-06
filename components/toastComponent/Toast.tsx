"use client";

import React, { useState, useEffect } from "react";
import { Check, AlertCircle, Info, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { ToastProps } from "./ToastProvider";

export const Toast: React.FC<ToastProps & { onClose: () => void }> = ({
  id,
  title,
  description,
  variant = "info",
  duration = 5000,
  onClose,
  action,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration !== Infinity) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          onClose?.();
        }, 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (variant) {
      case "success":
        return <Check className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "info":
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20";
      case "error":
        return "border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20";
      case "warning":
        return "border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20";
      case "info":
      default:
        return "border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20";
    }
  };

  return (
    <div
      className={cn(
        "pointer-events-auto relative flex w-full max-w-sm items-center overflow-hidden rounded-md shadow-lg",
        getVariantStyles(),
        isVisible ? "animate-enter" : "animate-leave",
        className
      )}
      role="alert"
    >
      <div className="flex flex-1 items-center p-4">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3 flex-1">
          {title && (
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {title}
            </h4>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        <div className="ml-4 flex flex-shrink-0">
          {action}
          <button
            type="button"
            className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => {
                onClose?.();
              }, 300);
            }}
          >
            <span className="sr-only">Close</span>
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
