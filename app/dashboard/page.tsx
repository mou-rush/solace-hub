import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/services/auth";
import { getDashboardData } from "@/lib/services/dashboard";
import { getDailyQuote } from "@/lib/services/quote";
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

  // Verify token and fetch all data in parallel.
  // Both calls are wrapped in React cache() — if any other Server Component
  // in this render tree calls the same service with the same args, the result
  // is shared with no extra network requests.
  const [user, quote] = await Promise.all([
    verifySession(sessionCookie.value),
    getDailyQuote(),
  ]);

  if (!user) {
    redirect("/login");
  }

  const userData = await getDashboardData(user.uid, sessionCookie.value);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <DashboardHeader userData={userData} userName={user.userName} />

      <StatCard userData={userData} />

      <div className="grid gap-6 md:grid-cols-3">
        <ActionCard />
        <DailyTipCard userData={userData} tip={quote.text} />
      </div>
    </div>
  );
}
