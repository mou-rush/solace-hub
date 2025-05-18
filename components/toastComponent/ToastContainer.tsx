"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { Toast } from "./Toast";
import { ToastPosition, ToastProps } from "./ToastProvider";

interface ToastContainerProps {
  position: ToastPosition;
  toasts: ToastProps[];
  removeToast: (id: string) => void;
  className?: string;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  position = "bottom-right",
  toasts,
  removeToast,
  className,
}) => {
  const getPositionClasses = () => {
    switch (position) {
      case "top-left":
        return "top-0 left-0";
      case "top-center":
        return "top-0 left-1/2 transform -translate-x-1/2";
      case "top-right":
        return "top-0 right-0";
      case "bottom-left":
        return "bottom-0 left-0";
      case "bottom-center":
        return "bottom-0 left-1/2 transform -translate-x-1/2";
      case "bottom-right":
      default:
        return "bottom-0 right-0";
    }
  };

  return (
    <div
      className={cn(
        "fixed z-50 flex flex-col gap-2 p-4 max-h-screen overflow-hidden",
        getPositionClasses(),
        className
      )}
      id="toast-container"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};
