"use client";

import { useEffect, useState, useRef, startTransition } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { useGetActiveStory, useToggleStoryStatus } from "@/lib/hooks/convex/stories";
import { useSessionSettings } from "@/lib/hooks/use-session-settings";
import { useIsAdmin } from "@/lib/hooks/convex/is-admin";
import { Card } from "../card";
import { Clock } from "lucide-react";
import { toast } from "sonner";

interface Props {
  sessionId: Id<"sessions">;
}

export function VotingTimer({ sessionId }: Props) {
  const activeStory = useGetActiveStory(sessionId);
  const isVotingActive = activeStory?.status === "voting";
  // Use session settings from Convex (real-time, no polling needed)
  // All participants see the same settings and get updates automatically
  const { settings, isLoading } = useSessionSettings(sessionId);
  const toggleStoryStatus = useToggleStoryStatus();
  const isAdmin = useIsAdmin(sessionId);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const votingStartTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevVotingStatusRef = useRef<string | undefined>(undefined);
  const prevTimeLimitRef = useRef<number | undefined>(undefined);
  const hasTriggeredStopRef = useRef<boolean>(false);

  // Check if timed voting is enabled and voting is active
  const isTimedVotingEnabled = settings?.timedVoting ?? false;
  const timeLimit = settings?.votingTimeLimit ?? 300; // in seconds

  // When voting starts, record the start time
  useEffect(() => {
    const prevStatus = prevVotingStatusRef.current;
    const prevTimeLimit = prevTimeLimitRef.current;
    
    // Check if time limit changed BEFORE updating the ref
    const timeLimitChanged = prevTimeLimit !== undefined && prevTimeLimit !== timeLimit;
    
    prevVotingStatusRef.current = activeStory?.status;
    prevTimeLimitRef.current = timeLimit;

    if (isVotingActive && isTimedVotingEnabled) {
      // If voting just started OR time limit changed, reset the timer
      if (prevStatus !== "voting" || timeLimitChanged) {
        votingStartTimeRef.current = Date.now();
        hasTriggeredStopRef.current = false; // Reset the stop trigger for new voting
        startTransition(() => {
          setTimeRemaining(timeLimit);
        });
      }
    } else if (!isVotingActive && prevStatus === "voting") {
      // Voting just ended
      votingStartTimeRef.current = null;
      hasTriggeredStopRef.current = false;
      startTransition(() => {
        setTimeRemaining(null);
      });
    }
  }, [isVotingActive, isTimedVotingEnabled, timeLimit, activeStory?.status]);

  // Countdown timer
  useEffect(() => {
    if (isVotingActive && isTimedVotingEnabled && votingStartTimeRef.current !== null) {
      intervalRef.current = setInterval(() => {
        if (votingStartTimeRef.current === null) return;
        
        const elapsed = Math.floor((Date.now() - votingStartTimeRef.current) / 1000);
        const remaining = Math.max(0, timeLimit - elapsed);
        
        setTimeRemaining(remaining);

        if (remaining === 0 && !hasTriggeredStopRef.current && activeStory?._id) {
          // Timer reached zero - automatically stop voting
          hasTriggeredStopRef.current = true;
          
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }

          // Only stop voting if user is admin
          if (isAdmin) {
            toggleStoryStatus(activeStory._id, "pending")
              .then(() => {
                toast.success("Voting time has ended. Voting stopped automatically.");
              })
              .catch((error) => {
                console.error("Failed to stop voting automatically:", error);
                toast.error("Failed to stop voting automatically");
              });
          }
        }
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [isVotingActive, isTimedVotingEnabled, timeLimit, activeStory?._id, isAdmin, toggleStoryStatus]);

  // Don't show if settings are loading, timed voting is not enabled, voting is not active, or timer not initialized
  if (isLoading || !isTimedVotingEnabled || !isVotingActive || timeRemaining === null) {
    return null;
  }

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Color based on time remaining
  const getColorClass = () => {
    if (timeRemaining === 0) return "text-destructive";
    if (timeRemaining <= 30) return "text-orange-500";
    if (timeRemaining <= 60) return "text-yellow-500";
    return "text-primary";
  };

  return (
    <Card className="flex items-center justify-center gap-2 p-3 mb-4">
      <Clock className={`h-5 w-5 ${getColorClass()}`} />
      <span className={`text-lg font-bold ${getColorClass()}`}>
        {formatTime(timeRemaining)}
      </span>
    </Card>
  );
}

