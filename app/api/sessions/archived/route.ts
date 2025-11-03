import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { planningSessions } from "@/lib/db/schema";
import { headers } from "next/headers";
import { eq, desc } from "drizzle-orm";

export const GET = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    // Get all archived sessions for this user
    const archivedSessions = await db
      .select()
      .from(planningSessions)
      .where(eq(planningSessions.createdBy, session.user.id))
      .orderBy(desc(planningSessions.endedAt));

    return new Response(JSON.stringify(archivedSessions), { status: 200 });
  } catch (error) {
    console.error("Error fetching archived sessions:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch archived sessions" }),
      { status: 500 }
    );
  }
};
