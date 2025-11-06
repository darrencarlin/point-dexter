import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const DEFAULT_SCORING_TYPE = "planning_poker";

/**
 * Get session settings (admin's timer settings for the session)
 */
export const getSessionSettings = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("sessionSettings")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!settings) {
      // Return default values if no settings exist
      return {
        timedVoting: false,
        votingTimeLimit: 300,
        scoringType: DEFAULT_SCORING_TYPE,
      };
    }

    return {
      timedVoting: settings.timedVoting,
      votingTimeLimit: settings.votingTimeLimit,
      scoringType: settings.scoringType ?? DEFAULT_SCORING_TYPE,
    };
  },
});

/**
 * Update session settings (only admin can do this)
 */
export const updateSessionSettings = mutation({
  args: {
    sessionId: v.id("sessions"),
    userId: v.string(),
    timedVoting: v.optional(v.boolean()),
    votingTimeLimit: v.optional(v.number()),
    scoringType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify user is admin of the session
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    if (session.createdBy !== args.userId) {
      throw new Error("Only session admin can update settings");
    }

    // Get existing settings or create new
    const existing = await ctx.db
      .query("sessionSettings")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    const updatedAt = Date.now();

    if (existing) {
      // Update existing settings
      await ctx.db.patch(existing._id, {
        timedVoting: args.timedVoting ?? existing.timedVoting,
        votingTimeLimit: args.votingTimeLimit ?? existing.votingTimeLimit,
        scoringType: args.scoringType ?? existing.scoringType ?? DEFAULT_SCORING_TYPE,
        updatedAt,
      });
      return existing._id;
    } else {
      // Create new settings
      const id = await ctx.db.insert("sessionSettings", {
        sessionId: args.sessionId,
        timedVoting: args.timedVoting ?? false,
        votingTimeLimit: args.votingTimeLimit ?? 300,
        scoringType: args.scoringType ?? DEFAULT_SCORING_TYPE,
        updatedAt,
      });
      return id;
    }
  },
});

