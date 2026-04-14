import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/services/auth";
import { getDashboardData } from "@/lib/services/dashboard";

/**
 * GET /api/dashboard
 * Kept as an API route so client components can still fetch dashboard data
 * (e.g. after a mutation). Uses the same shared, cache()-wrapped services
 * as the Server Component page, so there is zero duplicated logic.
 */
export async function GET(_request: NextRequest) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session");

  if (!sessionCookie?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await verifySession(sessionCookie.value);

  if (!user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    const data = await getDashboardData(user.uid, sessionCookie.value);
    return NextResponse.json({ ...data, userName: user.userName });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
