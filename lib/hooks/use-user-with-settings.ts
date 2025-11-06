import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { BASE_URL } from "../constants";
import {
  DEFAULT_SCORING_TYPE,
  normalizeScoringType,
} from "../constants/scoring";
import { UserSettings } from "../types";

export function useUserSettings() {
  const { data: session, isPending } = useSession();
  const [settings, setSettings] = useState<UserSettings>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUserSettings() {
      if (!session?.user) {
        setSettings(null);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${BASE_URL}/api/user/settings`);
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setSettings({
          timedVoting: data.user.timedVoting ?? false,
          votingTimeLimit: data.user.votingTimeLimit ?? 300,
          scoringType: normalizeScoringType(data.user.scoringType),
        });
      } catch (error) {
        console.error("Failed to fetch user settings:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (!isPending) {
      fetchUserSettings();
    }
  }, [session?.user, isPending]);

  const updateSettings = async (newSettings: Partial<NonNullable<UserSettings>>) => {
    if (!session?.user) {
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/user/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          settings: {
            timedVoting: settings?.timedVoting ?? false,
            votingTimeLimit: settings?.votingTimeLimit ?? 300,
            scoringType: settings?.scoringType ?? DEFAULT_SCORING_TYPE,
            ...newSettings,
          },
        }),
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      setSettings({
        timedVoting: data.user.timedVoting ?? false,
        votingTimeLimit: data.user.votingTimeLimit ?? 300,
        scoringType: normalizeScoringType(data.user.scoringType),
      });
    } catch (error) {
      console.error("Failed to update user settings:", error);
      throw error;
    }
  };

  return {
    settings,
    isLoading: isPending || isLoading,
    updateSettings,
  };
}
