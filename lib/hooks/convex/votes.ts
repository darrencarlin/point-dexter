import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

// Generate a unique anonymous user ID and store in localStorage (persists across sessions)
function getAnonymousUserId(): string {
  if (typeof window === "undefined") return "";

  const key = "anonymous_user_id";
  let userId = localStorage.getItem(key);

  if (!userId) {
    userId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem(key, userId);
  }

  return userId;
}

// Get anonymous user name from localStorage (persists across sessions)
function getAnonymousUserName(): string {
  if (typeof window === "undefined") return "Anonymous";

  const key = "anonymous_user_name";
  return localStorage.getItem(key) || "Anonymous";
}

export function useGetStoryVotes(storyId: Id<"stories"> | undefined) {
  return useQuery(
    api.votesActions.getStoryVotes,
    storyId ? { storyId } : "skip"
  );
}

export function useVote() {
  const mutation = useMutation(api.votesActions.vote);

  return async (storyId: Id<"stories">, points: number | string) => {
    // Get fresh values each time to ensure we use the latest from localStorage
    const userId = getAnonymousUserId();
    const userName = getAnonymousUserName();

    return await mutation({
      storyId,
      userId,
      name: userName,
      points,
    });
  };
}
