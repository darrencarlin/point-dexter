import { useAtomValue } from "jotai";
import { sessionIdAtom } from "@/lib/state";
import { useGetSession as useGetSessionBase } from "./convex/use-sessions";
import { useGetSessionMembers as useGetSessionMembersBase } from "./convex/use-session-members";
import {
  useGetSessionStories as useGetSessionStoriesBase,
  useGetActiveStory as useGetActiveStoryBase,
} from "./convex/use-stories";
import {
  useActiveUsers as useActiveUsersBase,
  useMaintainPresence as useMaintainPresenceBase,
} from "./convex/use-presence";
import { useEndedStory as useEndedStoryBase } from "./convex/use-ended-story";
import { useIsAdmin as useIsAdminBase } from "./convex/use-is-admin";
import { useSessionSettings as useSessionSettingsBase } from "./use-session-settings";

/**
 * Hook that gets the session ID from the atom
 */
export function useSessionId() {
  return useAtomValue(sessionIdAtom);
}

/**
 * Hook that gets the session using the session ID from the atom
 */
export function useGetSession() {
  const sessionId = useSessionId();
  return useGetSessionBase(sessionId);
}

/**
 * Hook that gets the session members using the session ID from the atom
 */
export function useGetSessionMembers() {
  const sessionId = useSessionId();
  return useGetSessionMembersBase(sessionId);
}

/**
 * Hook that gets the session stories using the session ID from the atom
 */
export function useGetSessionStories() {
  const sessionId = useSessionId();
  return useGetSessionStoriesBase(sessionId);
}

/**
 * Hook that gets the active story using the session ID from the atom
 */
export function useGetActiveStory() {
  const sessionId = useSessionId();
  return useGetActiveStoryBase(sessionId);
}

/**
 * Hook that gets the ended story using the session ID from the atom
 */
export function useEndedStory() {
  const sessionId = useSessionId();
  return useEndedStoryBase(sessionId);
}

/**
 * Hook that gets the active users using the session ID from the atom
 */
export function useActiveUsers() {
  const sessionId = useSessionId();
  return useActiveUsersBase(sessionId);
}

/**
 * Hook that checks if the user is admin using the session ID from the atom
 */
export function useIsAdmin() {
  const sessionId = useSessionId();
  return useIsAdminBase(sessionId ?? "");
}

/**
 * Hook that maintains presence using the session ID from the atom
 * @param shouldMaintain - Optional flag to conditionally maintain presence (e.g., only when user has joined)
 */
export function useMaintainPresence(shouldMaintain: boolean = true) {
  const sessionId = useSessionId();
  useMaintainPresenceBase(shouldMaintain ? sessionId : undefined);
}

/**
 * Hook that gets session settings using the session ID from the atom
 */
export function useSessionSettings() {
  const sessionId = useSessionId();
  return useSessionSettingsBase(sessionId);
}
