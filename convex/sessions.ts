import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getSession = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    return session;
  },
});

export const getSessions = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("sessions")
      .filter((q) => q.eq(q.field("createdBy"), args.userId))
      .collect();
    return sessions;
  },
});

export const getCompleteSession = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      return null;
    }

    // Get all session members
    const members = await ctx.db
      .query("sessionMembers")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    // Get all stories
    const stories = await ctx.db
      .query("stories")
      .filter((q) => q.eq(q.field("sessionId"), args.sessionId))
      .collect();

    // Get all votes for all stories
    const storyIds = stories.map((s) => s._id);
    const allVotes = await Promise.all(
      storyIds.map((storyId) =>
        ctx.db
          .query("votes")
          .withIndex("by_story", (q) => q.eq("storyId", storyId))
          .collect()
      )
    );
    const votes = allVotes.flat();

    return {
      session,
      members,
      stories,
      votes,
    };
  },
});

export const createSession = mutation({
  args: {
    name: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const sessionId = await ctx.db.insert("sessions", {
      name: args.name,
      createdBy: args.userId,
      createdAt: Date.now(),
    });
    return sessionId;
  },
});

export const endSession = mutation({
  args: {
    sessionId: v.id("sessions"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    // Only session creator can end the session
    if (session.createdBy !== args.userId) {
      throw new Error("Only session owner can end the session");
    }

    // No need to patch - we'll delete the session entirely
    return args.sessionId;
  },
});

export const deleteSession = mutation({
  args: {
    sessionId: v.id("sessions"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    // Only session creator can delete the session
    if (session.createdBy !== args.userId) {
      throw new Error("Only session owner can delete the session");
    }

    // Get all stories for this session
    const stories = await ctx.db
      .query("stories")
      .filter((q) => q.eq(q.field("sessionId"), args.sessionId))
      .collect();

    // Delete all votes for all stories
    for (const story of stories) {
      const votes = await ctx.db
        .query("votes")
        .withIndex("by_story", (q) => q.eq("storyId", story._id))
        .collect();

      for (const vote of votes) {
        await ctx.db.delete(vote._id);
      }
    }

    // Delete all stories
    for (const story of stories) {
      await ctx.db.delete(story._id);
    }

    // Delete all session members
    const members = await ctx.db
      .query("sessionMembers")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    // Delete the session itself
    await ctx.db.delete(args.sessionId);

    return { success: true };
  },
});
