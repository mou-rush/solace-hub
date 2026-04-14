"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";
import { LazySidebar } from "@/lib/lazy-components";
import { PageSkeleton } from "@/components/ui/PageSkeleton";

export default function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        {/* Placeholder sidebar column */}
        <div className="hidden lg:flex flex-col h-screen w-[72px] border-r border-border/50 bg-background/95 animate-pulse" />
        <main className="flex-1 overflow-y-auto bg-muted/30">
          <PageSkeleton />
        </main>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <LazySidebar />
      <main className="flex-1 overflow-y-auto bg-muted/30">{children}</main>
    </div>
  );
}
