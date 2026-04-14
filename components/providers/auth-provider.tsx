"use client";

import { ReactNode, useEffect } from "react";
import { useAuthStore, useAppStore } from "@/stores";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";

interface AppProviderProps {
  readonly children: ReactNode;
}

function syncSessionCookie(user: User | null): void {
  if (user) {
    user
      .getIdToken()
      .then((token) => {
        document.cookie = `__session=${token}; path=/; max-age=3600; SameSite=Strict`;
      })
      .catch(console.error);
  } else {
    document.cookie = `__session=; path=/; max-age=0`;
  }
}

export function AppProvider({ children }: Readonly<AppProviderProps>) {
  const { setUser, setLoading } = useAuthStore();
  const { setTheme } = useAppStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      syncSessionCookie(user);
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
