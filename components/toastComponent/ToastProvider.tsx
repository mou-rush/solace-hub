"use client";
import React, { createContext, useReducer, ReactNode, useMemo } from "react";
import { ToastContainer } from "./ToastContainer";

export type ToastVariant = "success" | "error" | "info" | "warning";
export type ToastPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left"
  | "top-center"
  | "bottom-center";

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  onClose?: () => void;
  action?: React.ReactNode;
  className?: string;
}

export interface ToastOptions extends Omit<ToastProps, "id"> {
  position?: ToastPosition;
  id?: string;
}

type ToastState = {
  toasts: Array<ToastProps>;
  position: ToastPosition;
};

type ToastAction =
  | { type: "ADD_TOAST"; toast: ToastProps }
  | { type: "REMOVE_TOAST"; id: string }
  | { type: "UPDATE_POSITION"; position: ToastPosition };

interface ToastContextValue {
  state: ToastState;
  toast: (options: ToastOptions) => string;
  remove: (id: string) => void;
  success: (options: Omit<ToastOptions, "variant">) => string;
  error: (options: Omit<ToastOptions, "variant">) => string;
  info: (options: Omit<ToastOptions, "variant">) => string;
  warning: (options: Omit<ToastOptions, "variant">) => string;
  updatePosition: (position: ToastPosition) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

const toastReducer = (state: ToastState, action: ToastAction): ToastState => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [...state.toasts, action.toast],
      };
    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter((toast) => toast.id !== action.id),
      };
    case "UPDATE_POSITION":
      return {
        ...state,
        position: action.position,
      };
    default:
      return state;
  }
};

interface ToastProviderProps {
  children: ReactNode;
  defaultPosition?: ToastPosition;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  defaultPosition = "bottom-right",
}) => {
  const [state, dispatch] = useReducer(toastReducer, {
    toasts: [],
    position: defaultPosition,
  });

  const generateId = () =>
    `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const toast = (options: ToastOptions) => {
    const id = options.id || generateId();

    dispatch({
      type: "ADD_TOAST",
      toast: { ...options, id },
    });

    return id;
  };

  const remove = (id: string) => {
    dispatch({ type: "REMOVE_TOAST", id });
  };

  const success = (options: Omit<ToastOptions, "variant">) => {
    return toast({ ...options, variant: "success" });
  };

  const error = (options: Omit<ToastOptions, "variant">) => {
    return toast({ ...options, variant: "error" });
  };

  const info = (options: Omit<ToastOptions, "variant">) => {
    return toast({ ...options, variant: "info" });
  };

  const warning = (options: Omit<ToastOptions, "variant">) => {
    return toast({ ...options, variant: "warning" });
  };

  const updatePosition = (position: ToastPosition) => {
    dispatch({ type: "UPDATE_POSITION", position });
  };

  const contextValue: ToastContextValue = useMemo(
    () => ({
      state,
      toast,
      remove,
      success,
      error,
      info,
      warning,
      updatePosition,
    }),
    [state, toast, remove, success, error, info, warning, updatePosition]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer
        position={state.position}
        toasts={state.toasts}
        removeToast={remove}
      />
    </ToastContext.Provider>
  );
};
