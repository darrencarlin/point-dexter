import { useEffect, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import { Id } from "@/convex/_generated/dataModel";
import { useUserSettings } from "./use-user-with-settings";
import { useSessionSettings } from "./use-session-settings";
import { useUpdateSessionSettings } from "./convex/use-session-settings";
import { useGetSession } from "./convex/use-sessions";

interface UnifiedSettings {
  timedVoting: boolean;
  votingTimeLimit: number;
}

interface UseUnifiedSettingsReturn {
  settings: UnifiedSettings | null;
  isLoading: boolean;
  isAdmin: boolean;
  updateSettings: (settings: Partial<UnifiedSettings>) => Promise<void>;
  scope: "user" | "session";
}

/**
 * Unified hook that manages settings intelligently:
 * - Outside sessions: Uses user defaults from Neon DB
 * - Inside sessions (non-admin): Uses session settings from Convex (read-only)
 * - Inside sessions (admin): Updates both user defaults and session settings
 * 
 * This eliminates redundant code and sync complexity in components.
 */
export function useUnifiedSettings(
  sessionId?: Id<"sessions">
): UseUnifiedSettingsReturn {
  const { data: authSession } = useSession();
  const {
    settings: userSettings,
    isLoading: userSettingsLoading,
    updateSettings: updateUserSettings,
  } = useUserSettings();
  
  const {
    settings: sessionSettings,
    isLoading: sessionSettingsLoading,
  } = useSessionSettings(sessionId);
  
  const updateSessionSettingsMutation = useUpdateSessionSettings();
  const session = useGetSession(sessionId);
  
  const isAdmin = session?.createdBy === authSession?.user?.id;
  const hasSyncedRef = useRef(false);

  // Auto-sync admin's user defaults to new session on first load
  useEffect(() => {
    if (
      !sessionId ||
      !isAdmin ||
      !userSettings ||
      !sessionSettings ||
      userSettingsLoading ||
      sessionSettingsLoading ||
      hasSyncedRef.current
    ) {
      return;
    }

    // Check if session has default settings (needs initial sync)
    const needsSync =
      sessionSettings.timedVoting === false &&
      sessionSettings.votingTimeLimit === 300 &&
      (userSettings.timedVoting || userSettings.votingTimeLimit !== 300);

    if (needsSync) {
      hasSyncedRef.current = true;
      updateSessionSettingsMutation(sessionId, {
        timedVoting: userSettings.timedVoting,
        votingTimeLimit: userSettings.votingTimeLimit,
      })
        .catch((error) => {
          console.error("Failed to sync initial settings:", error);
          hasSyncedRef.current = false;
        });
    }
  }, [
    sessionId,
    isAdmin,
    userSettings,
    sessionSettings,
    sessionSettingsLoading,
    userSettingsLoading,
    updateSessionSettingsMutation,
  ]);

  // Determine which settings to show
  const effectiveSettings = sessionId && sessionSettings 
    ? sessionSettings 
    : userSettings 
      ? { 
          timedVoting: userSettings.timedVoting ?? false, 
          votingTimeLimit: userSettings.votingTimeLimit ?? 300 
        }
      : null;

  const isLoading = sessionId 
    ? (userSettingsLoading || sessionSettingsLoading)
    : userSettingsLoading;

  const updateSettings = async (newSettings: Partial<UnifiedSettings>) => {
    if (!authSession?.user) {
      throw new Error("Must be logged in to update settings");
    }

    // Always update user defaults (persistent storage)
    await updateUserSettings(newSettings);

    // If in a session as admin, also update session settings (real-time sync)
    if (sessionId && isAdmin) {
      await updateSessionSettingsMutation(sessionId, newSettings);
    }
  };

  return {
    settings: effectiveSettings,
    isLoading,
    isAdmin,
    updateSettings,
    scope: sessionId ? "session" : "user",
  };
}
