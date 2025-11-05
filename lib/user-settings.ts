import { db } from "./db";
import { planningSettings } from "./db/schema";
import { eq } from "drizzle-orm";
import { UserSettings } from "./types";

export async function getUserSettings(userId: string) {
  const settings = await db
    .select()
    .from(planningSettings)
    .where(eq(planningSettings.userId, userId))
    .limit(1);

  return {
    timedVoting: settings[0]?.timedVoting ?? false,
    votingTimeLimit: settings[0]?.votingTimeLimit ?? 300,
  };
}

export async function updateUserSettings(
  userId: string,
  settings: UserSettings
) {
  const existing = await db
    .select()
    .from(planningSettings)
    .where(eq(planningSettings.userId, userId))
    .limit(1);

  if (existing[0]) {
    const data = await db
      .update(planningSettings)
      .set({
        ...settings,
        updatedAt: new Date(),
      })
      .where(eq(planningSettings.userId, userId))
      .returning();

    return data;
  } else {
    const data = await db
      .insert(planningSettings)
      .values({
        id: crypto.randomUUID(),
        userId,
        timedVoting: settings?.timedVoting ?? false,
        votingTimeLimit: settings?.votingTimeLimit ?? 300,
      })
      .returning();

    return data;
  }
}
