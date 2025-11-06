import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getStoryVotes = query({
  args: { storyId: v.id("stories") },
  handler: async (ctx, args) => {
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_story", (q) => q.eq("storyId", args.storyId))
      .collect();
    return votes;
  },
});

export const getUserVote = query({
  args: { storyId: v.id("stories"), userId: v.string() },
  handler: async (ctx, args) => {
    const vote = await ctx.db
      .query("votes")
      .withIndex("by_story", (q) => q.eq("storyId", args.storyId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();
    return vote ?? null;
  },
});

export const vote = mutation({
  args: {
    storyId: v.id("stories"),
    userId: v.string(),
    name: v.string(),
    points: v.union(v.number(), v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user has already voted on this story
    const existingVote = await ctx.db
      .query("votes")
      .withIndex("by_story", (q) => q.eq("storyId", args.storyId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (existingVote) {
      // Update existing vote
      await ctx.db.patch(existingVote._id, {
        points: args.points,
        votedAt: Date.now(),
      });
      return existingVote._id;
    }

    // Create new vote
    const voteId = await ctx.db.insert("votes", {
      storyId: args.storyId,
      userId: args.userId,
      name: args.name,
      points: args.points,
      votedAt: Date.now(),
    });
    return voteId;
  },
});

export const resetVotes = mutation({
  args: { storyId: v.id("stories") },
  handler: async (ctx, args) => {
    // Get all votes for this story
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_story", (q) => q.eq("storyId", args.storyId))
      .collect();

    // Delete all votes for this story
    const deletePromises = votes.map((vote) => ctx.db.delete(vote._id));
    await Promise.all(deletePromises);

    return { deletedCount: votes.length };
  },
});
