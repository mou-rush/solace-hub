"use client";

import { ReactNode, useEffect } from "react";
import { useAuthStore, useAppStore } from "@/stores";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const { setUser, setLoading } = useAuthStore();
  const { setTheme } = useAppStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  useEffect(() => {
    const savedTheme =
      (localStorage.getItem("theme") as "light" | "dark" | "system") || "light";
    setTheme(savedTheme);
  }, [setTheme]);

  return <>{children}</>;
}
