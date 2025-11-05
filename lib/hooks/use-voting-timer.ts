import { useEffect, useState, useRef } from "react";
import { formatTime, getTimerColorClass } from "@/lib/utils/timer";

interface UseVotingTimerProps {
  isVotingActive: boolean;
  isTimedVotingEnabled: boolean;
  timeLimit: number; // in seconds
  onTimerEnd?: () => void;
}

interface UseVotingTimerReturn {
  timeRemaining: number | null;
  formatTime: typeof formatTime;
  getColorClass: () => string;
}

export function useVotingTimer({
  isVotingActive,
  isTimedVotingEnabled,
  timeLimit,
  onTimerEnd,
}: UseVotingTimerProps): UseVotingTimerReturn {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const votingStartTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredEndRef = useRef<boolean>(false);

  // When voting status or time limit changes
  useEffect(() => {
    if (isVotingActive && isTimedVotingEnabled) {
      // Initialize voting start time if not set
      if (votingStartTimeRef.current === null) {
        votingStartTimeRef.current = Date.now();
        hasTriggeredEndRef.current = false;
      }
    } else {
      // Reset when voting ends
      votingStartTimeRef.current = null;
      hasTriggeredEndRef.current = false;
    }
  }, [isVotingActive, isTimedVotingEnabled]);

  // Reset timer when time limit changes during active voting
  useEffect(() => {
    if (
      isVotingActive &&
      isTimedVotingEnabled &&
      votingStartTimeRef.current !== null
    ) {
      votingStartTimeRef.current = Date.now();
      hasTriggeredEndRef.current = false;
    }
  }, [timeLimit, isVotingActive, isTimedVotingEnabled]);

  // Countdown timer
  useEffect(() => {
    if (
      isVotingActive &&
      isTimedVotingEnabled &&
      votingStartTimeRef.current !== null
    ) {
      // Set initial time immediately
      const initialElapsed = Math.floor(
        (Date.now() - votingStartTimeRef.current) / 1000
      );
      const initialRemaining = Math.max(0, timeLimit - initialElapsed);
      setTimeRemaining(initialRemaining);

      intervalRef.current = setInterval(() => {
        if (votingStartTimeRef.current === null) return;

        const elapsed = Math.floor(
          (Date.now() - votingStartTimeRef.current) / 1000
        );
        const remaining = Math.max(0, timeLimit - elapsed);

        setTimeRemaining(remaining);

        if (remaining === 0 && !hasTriggeredEndRef.current) {
          hasTriggeredEndRef.current = true;

          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }

          // Trigger callback when timer ends
          onTimerEnd?.();
        }
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    } else {
      // Clear timer and set to null when not active
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setTimeRemaining(null);
    }
  }, [isVotingActive, isTimedVotingEnabled, timeLimit, onTimerEnd]);

  return {
    timeRemaining,
    formatTime,
    getColorClass: () => getTimerColorClass(timeRemaining, timeLimit),
  };
}
