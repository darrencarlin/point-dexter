import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const sessions = defineTable({
  name: v.string(),
  isActive: v.boolean(),
  createdBy: v.string(),
  createdAt: v.number(),
});

const sessionMembers = defineTable({
  sessionId: v.id("sessions"),
  userId: v.string(),
  name: v.string(),
  joinedAt: v.number(),
  isAdmin: v.boolean(),
})
  .index("by_session", ["sessionId"])
  .index("by_user", ["userId"]);

const stories = defineTable({
  sessionId: v.id("sessions"),
  title: v.string(),
  description: v.optional(v.string()),
  isActive: v.boolean(),
  isFinished: v.boolean(),
  createdAt: v.number(),
});

const votes = defineTable({
  storyId: v.id("stories"),
  userId: v.string(),
  name: v.string(), // display name for anonymous users
  points: v.union(v.number(), v.string()), // 1, 2, 3, 4, 5, 8, 13, 21, or "?"
  votedAt: v.number(),
}).index("by_story", ["storyId"]);

export default defineSchema({
  sessions,
  sessionMembers,
  stories,
  votes,
});
