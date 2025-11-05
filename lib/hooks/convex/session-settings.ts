import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useSession } from "../../auth-client";
import { Id } from "../../../convex/_generated/dataModel";

export function useUpdateSessionSettings() {
  const mutation = useMutation(api.sessionSettings.updateSessionSettings);
  const { data: session } = useSession();

  return async (
    sessionId: Id<"sessions">,
    settings: {
      timedVoting?: boolean;
      votingTimeLimit?: number;
    }
  ) => {
    if (!session?.user?.id) {
      throw new Error("Must be logged in to update session settings");
    }

    return await mutation({
      sessionId,
      userId: session.user.id,
      timedVoting: settings.timedVoting,
      votingTimeLimit: settings.votingTimeLimit,
    });
  };
}

