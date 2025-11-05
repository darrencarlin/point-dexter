"use client";

import { Id } from "@/convex/_generated/dataModel";
import {
  useGetActiveStory,
  useToggleStoryStatus,
} from "@/lib/hooks/convex/stories";
import { useSessionSettings } from "@/lib/hooks/use-session-settings";
import { useIsAdmin } from "@/lib/hooks/convex/is-admin";
import { useVotingTimer } from "@/lib/hooks/use-voting-timer";
import { Card } from "../card";
import { Clock } from "lucide-react";
import { toast } from "sonner";

interface Props {
  sessionId: Id<"sessions">;
}

export function VotingTimer({ sessionId }: Props) {
  const activeStory = useGetActiveStory(sessionId);
  const isVotingActive = activeStory?.status === "voting";
  const { settings, isLoading } = useSessionSettings(sessionId);
  const toggleStoryStatus = useToggleStoryStatus();
  const isAdmin = useIsAdmin(sessionId);

  const isTimedVotingEnabled = settings?.timedVoting ?? false;
  const timeLimit = settings?.votingTimeLimit ?? 300;

  const { timeRemaining, formatTime, getColorClass } = useVotingTimer({
    isVotingActive,
    isTimedVotingEnabled,
    timeLimit,
    onTimerEnd: () => {
      // Only stop voting if user is admin
      if (isAdmin && activeStory?._id) {
        toggleStoryStatus(activeStory._id, "pending")
          .then(() => {
            toast.success(
              "Voting time has ended. Voting stopped automatically."
            );
          })
          .catch((error) => {
            console.error("Failed to stop voting automatically:", error);
            toast.error("Failed to stop voting automatically");
          });
      }
    },
  });

  // Don't show if settings are loading, timed voting is not enabled, voting is not active, or timer not initialized
  if (
    isLoading ||
    !isTimedVotingEnabled ||
    !isVotingActive ||
    timeRemaining === null
  ) {
    return null;
  }

  return (
    <Card className="flex items-center justify-center gap-2 p-3 mb-4">
      <Clock className={`h-5 w-5 ${getColorClass()}`} />
      <span className={`text-lg font-bold ${getColorClass()}`}>
        {formatTime(timeRemaining)}
      </span>
    </Card>
  );
}
