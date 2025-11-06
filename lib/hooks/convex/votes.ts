import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useSession } from "../../auth-client";
import { getEffectiveUserId } from "./session-members";
import { getCurrentUserName } from "@/lib/utils/user-identity";

export function useGetStoryVotes(storyId: Id<"stories"> | undefined) {
  return useQuery(
    api.votesActions.getStoryVotes,
    storyId ? { storyId } : "skip"
  );
}

export function useGetUserVote(storyId: Id<"stories"> | undefined) {
  const { data: authSession } = useSession();
  const userId = getEffectiveUserId(authSession);

  return useQuery(
    api.votesActions.getUserVote,
    storyId && userId ? { storyId, userId } : "skip"
  );
}

export function useVote() {
  const mutation = useMutation(api.votesActions.vote);
  const { data: authSession } = useSession();

  return async (storyId: Id<"stories">, points: number | string) => {
    // Get fresh values each time to ensure we use the latest from localStorage
    const userId = getEffectiveUserId(authSession);
    const userName = getCurrentUserName();

    return await mutation({
      storyId,
      userId,
      name: userName,
      points,
    });
  };
}

export function useResetVotes() {
  const mutation = useMutation(api.votesActions.resetVotes);
  const { data: authSession } = useSession();

  return async (storyId: Id<"stories">) => {
    try {
      // Get fresh userId each time to ensure we use the latest from localStorage
      const userId = getEffectiveUserId(authSession);

      if (!userId) {
        throw new Error("User not authenticated");
      }

      const result = await mutation({ storyId, userId });
      return result;
    } catch (error) {
      console.error("Failed to reset votes:", error);
      throw error;
    }
  };
}
