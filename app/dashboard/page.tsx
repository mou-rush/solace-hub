import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActionCard } from "@/components/dashboard/ActionCard";
import { DailyTipCard } from "@/components/dashboard/DailyTipCard";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session");

  if (!sessionCookie?.value) {
    redirect("/login");
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  const [dashboardRes, tipResponse] = await Promise.all([
    fetch(`${baseUrl}/api/dashboard`, {
      headers: { Cookie: `__session=${sessionCookie.value}` },
      cache: "no-store",
    }),
    fetch(`${baseUrl}/api/daily-quote`, {
      next: { revalidate: 86400 },
    }),
  ]);

  if (!dashboardRes.ok) {
    redirect("/login");
  }

  const dashboardData = await dashboardRes.json();

  let tip = "Take a moment to breathe and be present.";
  try {
    const tipData = await tipResponse.json();
    tip = `${tipData[0]?.q} — ${tipData[0]?.a}`;
  } catch {}

  const userData = {
    lastMood: dashboardData.lastMood,
    therapySessions: dashboardData.therapySessions,
    journalEntries: dashboardData.journalEntries,
    streak: dashboardData.streak,
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <DashboardHeader userData={userData} userName={dashboardData.userName} />

      <StatCard userData={userData} />

      <div className="grid gap-6 md:grid-cols-3">
        <ActionCard />
        <DailyTipCard userData={userData} tip={tip} />
      </div>
    </div>
  );
}
