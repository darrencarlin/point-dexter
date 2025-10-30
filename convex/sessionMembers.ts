import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getSessionMembers = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("sessionMembers")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();
    return members;
  },
});

export const joinSession = mutation({
  args: {
    sessionId: v.id("sessions"),
    userId: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user is already a member
    const existingMember = await ctx.db
      .query("sessionMembers")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (existingMember) {
      return existingMember._id;
    }

    // Check if user is admin (creator of the session)
    const session = await ctx.db.get(args.sessionId);
    const isAdmin = session?.createdBy === args.userId;

    const memberId = await ctx.db.insert("sessionMembers", {
      sessionId: args.sessionId,
      userId: args.userId,
      isAdmin,
      name: args.name,
      joinedAt: Date.now(),
    });

    return memberId;
  },
});
