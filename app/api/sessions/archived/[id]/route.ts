import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  planningSessions,
  planningSessionMembers,
  planningStories,
  planningVotes,
} from "@/lib/db/schema";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

export const GET = async (
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const { id } = await params;

  try {
    // Get the archived session
    const archivedSession = await db
      .select()
      .from(planningSessions)
      .where(eq(planningSessions.id, id))
      .limit(1);

    if (archivedSession.length === 0) {
      return new Response(JSON.stringify({ error: "Session not found" }), {
        status: 404,
      });
    }

    const sessionData = archivedSession[0];

    // Verify ownership
    if (sessionData.createdBy !== session.user.id) {
      return new Response(
        JSON.stringify({ error: "You don't have access to this session" }),
        { status: 403 }
      );
    }

    // Get all related data
    const members = await db
      .select()
      .from(planningSessionMembers)
      .where(eq(planningSessionMembers.sessionId, id));

    const stories = await db
      .select()
      .from(planningStories)
      .where(eq(planningStories.sessionId, id));

    // Get votes for all stories
    const storyIds = stories.map((s) => s.id);
    let votes: (typeof planningVotes.$inferSelect)[] = [];

    if (storyIds.length > 0) {
      // Fetch votes for all stories
      const allVotes = await Promise.all(
        storyIds.map((storyId) =>
          db
            .select()
            .from(planningVotes)
            .where(eq(planningVotes.storyId, storyId))
        )
      );
      votes = allVotes.flat();
    }

    return new Response(
      JSON.stringify({
        session: sessionData,
        members,
        stories,
        votes,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching archived session:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch archived session" }),
      { status: 500 }
    );
  }
};
