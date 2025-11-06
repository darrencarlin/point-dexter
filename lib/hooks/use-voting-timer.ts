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
  const previousTimeLimitRef = useRef<number>(timeLimit);

  // When voting status or time limit changes
  useEffect(() => {
    if (isVotingActive && isTimedVotingEnabled) {
      // Initialize voting start time if not set
      if (votingStartTimeRef.current === null) {
        votingStartTimeRef.current = Date.now();
        hasTriggeredEndRef.current = false;
        previousTimeLimitRef.current = timeLimit;
      }
    } else {
      // Reset when voting ends
      votingStartTimeRef.current = null;
      hasTriggeredEndRef.current = false;
      previousTimeLimitRef.current = timeLimit;
    }
  }, [isVotingActive, isTimedVotingEnabled, timeLimit]);

  // Only reset timer if time limit changes during active voting AND it's a significant change
  // This prevents unwanted resets from minor adjustments
  useEffect(() => {
    if (
      isVotingActive &&
      isTimedVotingEnabled &&
      votingStartTimeRef.current !== null &&
      timeLimit !== previousTimeLimitRef.current
    ) {
      // Only reset if the new time limit would extend the voting time
      // This prevents cutting off votes unexpectedly
      const elapsed = Math.floor(
        (Date.now() - votingStartTimeRef.current) / 1000
      );
      
      if (timeLimit > elapsed) {
        // Extend the voting by resetting start time
        votingStartTimeRef.current = Date.now();
        hasTriggeredEndRef.current = false;
        previousTimeLimitRef.current = timeLimit;
      }
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
