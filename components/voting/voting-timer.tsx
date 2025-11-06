"use client";

import { Id } from "@/convex/_generated/dataModel";
import { useIsAdmin } from "@/lib/hooks/convex/use-is-admin";
import {
  useGetActiveStory,
  useToggleStoryStatus,
} from "@/lib/hooks/convex/use-stories";
import { useSessionSettings } from "@/lib/hooks/use-session-settings";
import { useVotingTimer } from "@/lib/hooks/use-voting-timer";
import { Clock } from "lucide-react";
import { toast } from "sonner";
import { Card } from "../card";

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
    <Card className="flex flex-col items-center justify-center gap-2 p-3 mb-4">
      <h2 className="text-2xl font-bold">Time Remaining</h2>
      <div className="flex items-center gap-2">
        <Clock className={`h-5 w-5 ${getColorClass()}`} />
        <p className={`text-xl font-bold tabular-nums ${getColorClass()}`}>
          {formatTime(timeRemaining)}
        </p>
      </div>
    </Card>
  );
}
