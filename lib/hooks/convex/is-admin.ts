import { useSession } from "@/lib/auth-client";
import { Id } from "@/convex/_generated/dataModel";
import { useMemo } from "react";
import { useGetSession } from "./use-sessions";

/**
 * Utility function to check if a user is the admin of a session
 * @param userId - The user's ID
 * @param sessionCreatorId - The ID of the user who created the session
 * @returns true if the user is the admin (creator) of the session
 */
export function isSessionAdmin(
  userId: string | undefined,
  sessionCreatorId: string | undefined
): boolean {
  return !!userId && !!sessionCreatorId && userId === sessionCreatorId;
}

/**
 * Hook to check if the current user is the admin of a session.
 * Returns true if the current user created the session.
 *
 * @param sessionId - The session ID to check
 * @returns boolean indicating if current user is admin
 */
export function useIsAdmin(sessionId: string | Id<"sessions">) {
  const { data: authSession } = useSession();
  const session = useGetSession(sessionId as Id<"sessions">);

  return useMemo(
    () => isSessionAdmin(authSession?.user?.id, session?.createdBy),
    [authSession?.user?.id, session?.createdBy]
  );
}
