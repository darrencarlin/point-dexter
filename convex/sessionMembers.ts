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

export const leaveSession = mutation({
  args: {
    sessionId: v.id("sessions"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Find the member record
    const member = await ctx.db
      .query("sessionMembers")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (!member) {
      throw new Error("User is not a member of this session");
    }

    // Prevent admin from leaving if they're the session creator
    // (They should use "End Session" instead)
    const session = await ctx.db.get(args.sessionId);
    if (session?.createdBy === args.userId) {
      throw new Error("Session creator cannot leave. Please end the session instead.");
    }

    // Delete the member record
    await ctx.db.delete(member._id);

    // Clean up presence records for this user in this session
    const presenceRecords = await ctx.db
      .query("presence")
      .withIndex("by_user_session", (q) =>
        q.eq("userId", args.userId).eq("sessionId", args.sessionId)
      )
      .collect();

    for (const presence of presenceRecords) {
      await ctx.db.delete(presence._id);
    }

    return { success: true };
  },
});
