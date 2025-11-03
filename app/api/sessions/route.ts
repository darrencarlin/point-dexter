import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  planningSessions,
  planningSessionMembers,
  planningStories,
  planningVotes,
} from "@/lib/db/schema";
import { headers } from "next/headers";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

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
    const archivedSessions = await db.query.planningSessions.findMany({
      where: (sessions, { eq }) => eq(sessions.createdBy, session.user.id),
      with: {
        // Note: You may need to add relations in schema.ts to enable this
        // For now, we'll fetch them separately
      },
      orderBy: (sessions, { desc }) => [desc(sessions.endedAt)],
    });

    return new Response(JSON.stringify(archivedSessions), { status: 200 });
  } catch (error) {
    console.error("Error fetching archived sessions:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch archived sessions" }),
      { status: 500 }
    );
  }
};

export const POST = async (req: Request) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return new Response(JSON.stringify({ error: "Session ID is required" }), {
        status: 400,
      });
    }

    // Initialize Convex client
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

    // Get complete session data from Convex
    const sessionData = await convex.query(api.sessions.getCompleteSession, {
      sessionId: sessionId as Id<"sessions">,
    });

    if (!sessionData) {
      return new Response(JSON.stringify({ error: "Session not found" }), {
        status: 404,
      });
    }

    // Verify ownership
    if (sessionData.session.createdBy !== session.user.id) {
      return new Response(
        JSON.stringify({ error: "Only session owner can end the session" }),
        { status: 403 }
      );
    }

    // Archive to Neon DB
    const endedAt = Date.now();

    // Insert session
    await db.insert(planningSessions).values({
      id: sessionData.session._id,
      name: sessionData.session.name,
      isActive: false,
      createdBy: sessionData.session.createdBy,
      createdAt: sessionData.session.createdAt,
      endedAt,
    });

    // Insert session members
    if (sessionData.members.length > 0) {
      await db.insert(planningSessionMembers).values(
        sessionData.members.map((member) => ({
          id: member._id,
          sessionId: sessionData.session._id,
          userId: member.userId,
          name: member.name,
          joinedAt: member.joinedAt,
          isAdmin: member.isAdmin,
        }))
      );
    }

    // Insert stories
    if (sessionData.stories.length > 0) {
      await db.insert(planningStories).values(
        sessionData.stories.map((story) => ({
          id: story._id,
          sessionId: sessionData.session._id,
          title: story.title,
          description: story.description,
          status: story.status,
          createdAt: story.createdAt,
          points: story.points,
          jiraKey: story.jiraKey,
        }))
      );
    }

    // Insert votes
    if (sessionData.votes.length > 0) {
      await db.insert(planningVotes).values(
        sessionData.votes.map((vote) => ({
          id: vote._id,
          storyId: vote.storyId,
          userId: vote.userId,
          name: vote.name,
          points: String(vote.points), // Convert to string
          votedAt: vote.votedAt,
        }))
      );
    }

    // Mark session as ended in Convex
    await convex.mutation(api.sessions.endSession, {
      sessionId: sessionId as Id<"sessions">,
      userId: session.user.id,
    });

    // Delete all session data from Convex after archiving
    await convex.mutation(api.sessions.deleteSession, {
      sessionId: sessionId as Id<"sessions">,
      userId: session.user.id,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Session archived successfully",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error archiving session:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to archive session",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
};
