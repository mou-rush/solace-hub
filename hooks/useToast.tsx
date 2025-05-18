"use client";

import { useContext } from "react";
import { ToastContext } from "@/components/toastComponent/ToastProvider";

export const useToast = () => {
  const context = useContext(ToastContext);

  if (context === null) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return {
    toast: context.toast,
    success: context.success,
    error: context.error,
    info: context.info,
    warning: context.warning,
    remove: context.remove,
    updatePosition: context.updatePosition,
  };
};
