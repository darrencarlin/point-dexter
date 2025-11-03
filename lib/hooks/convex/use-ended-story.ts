import { useMemo } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { useGetSessionStories } from "./stories";

/**
 * Hook to find the most recent story that has ended voting (pending or completed)
 * @param sessionId - The session ID
 * @returns The ended story or null
 */
export function useEndedStory(sessionId: Id<"sessions"> | undefined) {
  const sessionStories = useGetSessionStories(sessionId);

  return useMemo(() => {
    if (!sessionStories) return null;

    // Find pending first, then most recent completed
    return (
      sessionStories.find((story) => story.status === "pending") ||
      sessionStories
        .filter((story) => story.status === "completed")
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))[0] ||
      null
    );
  }, [sessionStories]);
}

