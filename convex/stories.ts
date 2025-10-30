import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getSessionStories = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const stories = await ctx.db
      .query("stories")
      .filter((q) => q.eq(q.field("sessionId"), args.sessionId))
      .collect();
    return stories;
  },
});

export const addStory = mutation({
  args: {
    sessionId: v.id("sessions"),
    title: v.string(),
    description: v.optional(v.string()),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the session to verify ownership
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    // Only session creator can add stories
    if (session.createdBy !== args.userId) {
      throw new Error("Only session owner can add stories");
    }

    const storyId = await ctx.db.insert("stories", {
      sessionId: args.sessionId,
      title: args.title,
      description: args.description,
      isActive: false,
      isFinished: false,
      createdAt: Date.now(),
    });

    return storyId;
  },
});

export const toggleStoryActive = mutation({
  args: {
    storyId: v.id("stories"),
    isActive: v.boolean(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the story to find the session
    const story = await ctx.db.get(args.storyId);
    if (!story) {
      throw new Error("Story not found");
    }

    // Get the session to verify ownership
    const session = await ctx.db.get(story.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    // Only session creator can toggle story active state
    if (session.createdBy !== args.userId) {
      throw new Error("Only session owner can toggle story active state");
    }

    await ctx.db.patch(args.storyId, {
      isActive: args.isActive,
    });

    return args.storyId;
  },
});

export const endVoting = mutation({
  args: {
    storyId: v.id("stories"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the story to find the session
    const story = await ctx.db.get(args.storyId);
    if (!story) {
      throw new Error("Story not found");
    }

    // Get the session to verify ownership
    const session = await ctx.db.get(story.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    // Only session creator can end the vote
    if (session.createdBy !== args.userId) {
      throw new Error("Only session owner can end voting");
    }

    // Mark story as inactive (vote ended)
    await ctx.db.patch(args.storyId, {
      isActive: false,
      isFinished: true,
    });
  },
});
