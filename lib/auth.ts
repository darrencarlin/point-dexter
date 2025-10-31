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

  socialProviders: {
            atlassian: { 
            clientId: process.env.ATLASSIAN_CLIENT_ID as string, 
            clientSecret: process.env.ATLASSIAN_CLIENT_SECRET as string, 
        }, 
  }
});
