import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { normalizeScoringType } from "../constants/scoring";
import { ScoringType } from "../types";

/**
 * Hook to get session settings from Convex (real-time, no polling needed)
 * All participants see the same settings and get updates automatically when admin changes them
 */
type SessionSettingsResult = {
  timedVoting: boolean;
  votingTimeLimit: number;
  scoringType: ScoringType;
};

export function useSessionSettings(sessionId: Id<"sessions"> | undefined) {
  const settings = useQuery(
    api.sessionSettings.getSessionSettings,
    sessionId ? { sessionId } : "skip"
  );

  return {
    settings: settings
      ? ({
          timedVoting: settings.timedVoting,
          votingTimeLimit: settings.votingTimeLimit,
          scoringType: normalizeScoringType(settings.scoringType),
        } satisfies SessionSettingsResult)
      : null,
    isLoading: settings === undefined,
  };
}
