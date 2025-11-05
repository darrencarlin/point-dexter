import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Update user's presence in a session
export const updatePresence = mutation({
  args: {
    sessionId: v.id("sessions"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if user already has a presence record
    const existingPresence = await ctx.db
      .query("presence")
      .withIndex("by_user_session", (q) =>
        q.eq("userId", args.userId).eq("sessionId", args.sessionId)
      )
      .first();

    if (existingPresence) {
      // Update existing presence
      await ctx.db.patch(existingPresence._id, {
        lastSeen: now,
      });
      return existingPresence._id;
    } else {
      // Create new presence record
      return await ctx.db.insert("presence", {
        sessionId: args.sessionId,
        userId: args.userId,
        lastSeen: now,
      });
    }
  },
});

// Get all active users in a session (seen within last 30 seconds)
export const getActiveUsers = query({
  args: {
    sessionId: v.id("sessions"),
    thresholdMs: v.optional(v.number()), // How long before considering user inactive (default 30s)
  },
  handler: async (ctx, args) => {
    const threshold = args.thresholdMs ?? 30000; // Default 30 seconds
    const cutoffTime = Date.now() - threshold;

    const allPresence = await ctx.db
      .query("presence")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .filter((q) => q.gte(q.field("lastSeen"), cutoffTime))
      .collect();

    return allPresence.map((p) => p.userId);
  },
});

// Clean up old presence records (called periodically)
export const cleanupPresence = mutation({
  args: {
    sessionId: v.id("sessions"),
    olderThanMs: v.optional(v.number()), // Remove records older than this (default 5 minutes)
  },
  handler: async (ctx, args) => {
    const threshold = args.olderThanMs ?? 300000; // Default 5 minutes
    const cutoffTime = Date.now() - threshold;

    const oldPresence = await ctx.db
      .query("presence")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .filter((q) => q.lt(q.field("lastSeen"), cutoffTime))
      .collect();

    for (const record of oldPresence) {
      await ctx.db.delete(record._id);
    }

    return oldPresence.length;
  },
});
