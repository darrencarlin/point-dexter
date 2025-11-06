import { db } from "./db";
import { planningSettings } from "./db/schema";
import { eq } from "drizzle-orm";
import { UserSettings } from "./types";
import {
  DEFAULT_SCORING_TYPE,
  normalizeScoringType,
} from "./constants/scoring";

export async function getUserSettings(userId: string) {
  const settings = await db
    .select()
    .from(planningSettings)
    .where(eq(planningSettings.userId, userId))
    .limit(1);

  return {
    timedVoting: settings[0]?.timedVoting ?? false,
    votingTimeLimit: settings[0]?.votingTimeLimit ?? 300,
    scoringType: normalizeScoringType(settings[0]?.scoringType),
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
        scoringType: settings?.scoringType ?? DEFAULT_SCORING_TYPE,
      })
      .returning();

    return data;
  }
}
