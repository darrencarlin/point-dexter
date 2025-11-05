import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

/**
 * Hook to get session settings from Convex (real-time, no polling needed)
 * All participants see the same settings and get updates automatically when admin changes them
 */
export function useSessionSettings(sessionId: Id<"sessions"> | undefined) {
  const settings = useQuery(
    api.sessionSettings.getSessionSettings,
    sessionId ? { sessionId } : "skip"
  );

  return {
    settings: settings
      ? {
          timedVoting: settings.timedVoting,
          votingTimeLimit: settings.votingTimeLimit,
        }
      : null,
    isLoading: settings === undefined,
  };
}

