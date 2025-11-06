import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useEffect } from "react";
import { useSession } from "../../auth-client";
import { getEffectiveUserId } from "@/lib/utils/user-identity";

// Presence configuration constants
export const PRESENCE_HEARTBEAT_INTERVAL_MS =
  process.env.NODE_ENV === "production" ? 10000 : 5000; // 10s for prod, 5s for dev
export const PRESENCE_TIMEOUT_MS =
  process.env.NODE_ENV === "production" ? 30000 : 15000; // 30s for prod, 15s for dev

/**
 * Hook to get active users in a session.
 * A user is considered active if they've sent a heartbeat within the threshold.
 */
export function useActiveUsers(sessionId: Id<"sessions"> | undefined) {
  return useQuery(
    api.presence.getActiveUsers,
    sessionId ? { sessionId, thresholdMs: PRESENCE_TIMEOUT_MS } : "skip"
  );
}

/**
 * Hook to maintain presence in a session.
 * Sends periodic heartbeats and handles page visibility changes.
 * Automatically cleans up on unmount.
 */
export function useMaintainPresence(sessionId: Id<"sessions"> | undefined) {
  const updatePresence = useMutation(api.presence.updatePresence);
  const { data: authSession } = useSession();
  const userId = getEffectiveUserId(authSession);

  useEffect(() => {
    if (!sessionId || !userId) return;

    // Send initial heartbeat
    updatePresence({ sessionId, userId });

    // Set up interval to send heartbeat
    const interval = setInterval(() => {
      updatePresence({ sessionId, userId });
    }, PRESENCE_HEARTBEAT_INTERVAL_MS);

    // Send heartbeat when page becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        updatePresence({ sessionId, userId });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [sessionId, userId, updatePresence]);
}
