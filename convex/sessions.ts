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

export const createSession = mutation({
  args: {
    name: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const sessionId = await ctx.db.insert("sessions", {
      name: args.name,
      isActive: true,
      createdBy: args.userId,
      createdAt: Date.now(),
    });
    return sessionId;
  },
});
