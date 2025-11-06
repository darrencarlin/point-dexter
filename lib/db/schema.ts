import {
  pgTable,
  text,
  timestamp,
  boolean,
  bigint,
  real,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Planning poker sessions (archived from Convex)
export const planningSessions = pgTable("planning_sessions", {
  id: text("id").primaryKey(), // Original Convex _id
  name: text("name").notNull(),
  isActive: boolean("is_active").notNull(),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  endedAt: timestamp("ended_at").defaultNow().notNull(), // When session was archived
});

export const planningSessionMembers = pgTable("planning_session_members", {
  id: text("id").primaryKey(), // Original Convex _id
  sessionId: text("session_id")
    .notNull()
    .references(() => planningSessions.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  joinedAt: bigint("joined_at", { mode: "number" }).notNull(),
  isAdmin: boolean("is_admin").notNull(),
});

export const planningStories = pgTable("planning_stories", {
  id: text("id").primaryKey(), // Original Convex _id
  sessionId: text("session_id")
    .notNull()
    .references(() => planningSessions.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status"), // "new", "voting", "pending", "completed"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  points: real("points").notNull(),
  jiraKey: text("jira_key"),
});

export const planningVotes = pgTable("planning_votes", {
  id: text("id").primaryKey(), // Original Convex _id
  storyId: text("story_id")
    .notNull()
    .references(() => planningStories.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  points: text("points").notNull(), // Store as text to handle both numbers and "?"
  votedAt: bigint("voted_at", { mode: "number" }).notNull(),
});

export const planningSettings = pgTable("planning_settings", {
  id: text("id").primaryKey(), // Original Convex _id
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  timedVoting: boolean("timed_voting").notNull(), // True/False
  votingTimeLimit: bigint("voting_time_limit", { mode: "number" })
    .notNull()
    .default(300), // In seconds 10, 20, 30, 60
  scoringType: text("scoring_type").notNull().default("fibonacci"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
