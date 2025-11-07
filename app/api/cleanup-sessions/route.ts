import { db } from "@/lib/db";
import {
  planningSessions,
  planningSessionMembers,
  planningStories,
  planningVotes,
} from "@/lib/db/schema";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export const GET = async (req: Request) => {
  try {
    // Verify request is authorized with CRON_SECRET
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return new Response(
        JSON.stringify({ error: "CRON_SECRET not configured" }),
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    // Initialize Convex client
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

    // Get all stale sessions (older than 3 days)
    const staleSessions = await convex.query(api.sessions.getStaleSessions);

    if (staleSessions.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No stale sessions found",
          archived: 0,
        }),
        { status: 200 }
      );
    }

    const archivedSessions: string[] = [];
    const errors: { sessionId: string; error: string }[] = [];

    // Process each stale session
    for (const session of staleSessions) {
      try {
        // Get complete session data from Convex
        const sessionData = await convex.query(
          api.sessions.getCompleteSession,
          {
            sessionId: session._id as Id<"sessions">,
          }
        );

        if (!sessionData) {
          errors.push({
            sessionId: session._id,
            error: "Session data not found",
          });
          continue;
        }

        const endedAt = Date.now();

        // Archive to Neon DB - Insert session
        await db.insert(planningSessions).values({
          id: sessionData.session._id,
          name: sessionData.session.name,
          isActive: false,
          createdBy: sessionData.session.createdBy,
          createdAt: new Date(sessionData.session.createdAt),
          updatedAt: new Date(sessionData.session.createdAt),
          endedAt: new Date(endedAt),
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
              createdAt: new Date(story.createdAt),
              updatedAt: new Date(story.createdAt),
              points: story.points ?? -1,
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
              points: String(vote.points),
              votedAt: vote.votedAt,
            }))
          );
        }

        // Mark session as ended in Convex
        await convex.mutation(api.sessions.endSession, {
          sessionId: session._id as Id<"sessions">,
          userId: session.createdBy,
        });

        // Delete session from Convex
        await convex.mutation(api.sessions.deleteSession, {
          sessionId: session._id as Id<"sessions">,
          userId: session.createdBy,
        });

        archivedSessions.push(session._id);
      } catch (error) {
        console.error(`Error archiving session ${session._id}:`, error);
        errors.push({
          sessionId: session._id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Archived ${archivedSessions.length} stale sessions`,
        archived: archivedSessions.length,
        archivedSessions,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in cleanup-sessions:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to cleanup sessions",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
};
