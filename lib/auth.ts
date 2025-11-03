import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["atlassian"],
    },
  },
  socialProviders: {
    atlassian: {
      clientId: process.env.ATLASSIAN_CLIENT_ID as string,
      clientSecret: process.env.ATLASSIAN_CLIENT_SECRET as string,
      disableDefaultScope: true,
      scope: [
        // User Identity
        "read:me",
        "read:account",
        // JIRA API Scopes
        "read:jira-user",
        "read:issue:jira",
        "read:issue-details:jira",
        "read:jira-work",
        "write:jira-work",
        "read:project:jira",
        "read:issue:jira-software",
        "read:sprint:jira-software",
        "read:board-scope:jira-software",
        "write:issue:jira",
      ],
    },
  },
});
