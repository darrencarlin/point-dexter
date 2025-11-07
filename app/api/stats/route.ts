import { db } from "@/lib/db";
import { user, planningSessions } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export const GET = async () => {
  try {
    // Count total users from Neon
    const userCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(user);
    const totalUsers = Number(userCountResult[0]?.count || 0);

    // Count archived sessions from Neon
    const archivedSessionsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(planningSessions);
    const archivedSessions = Number(archivedSessionsResult[0]?.count || 0);

    // Count active sessions from Convex
    const convexClient = new ConvexHttpClient(
      process.env.NEXT_PUBLIC_CONVEX_URL!
    );
    const activeSessions = await convexClient.query(
      api.sessions.getActiveSessionCount
    );

    // Total sessions = active + archived
    const totalSessions = activeSessions + archivedSessions;

    return new Response(
      JSON.stringify({
        totalUsers,
        totalSessions,
        activeSessions,
        archivedSessions,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          // Cache for 1 hour to reduce load
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching stats:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch stats" }), {
      status: 500,
    });
  }
};
