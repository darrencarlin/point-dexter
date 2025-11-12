import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useSession } from "../../auth-client";
import { Id } from "../../../convex/_generated/dataModel";
import { ScoringType } from "../../types";
import { getEffectiveUserId } from "../../utils/user-identity";

export function useUpdateSessionSettings() {
  const mutation = useMutation(api.sessionSettings.updateSessionSettings);
  const { data: session } = useSession();

  return async (
    sessionId: Id<"sessions">,
    settings: {
      timedVoting?: boolean;
      votingTimeLimit?: number;
      scoringType?: ScoringType;
      showKickButtons?: boolean;
    }
  ) => {
    const userId = getEffectiveUserId(session);
    if (!userId) {
      throw new Error("Must be logged in to update session settings");
    }

    return await mutation({
      sessionId,
      userId,
      timedVoting: settings.timedVoting,
      votingTimeLimit: settings.votingTimeLimit,
      scoringType: settings.scoringType,
      showKickButtons: settings.showKickButtons,
    });
  };
}

