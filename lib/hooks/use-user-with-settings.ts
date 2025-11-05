import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { BASE_URL } from "../constants";
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
        if (response.ok) {
          const data = await response.json();
          setSettings({
            timedVoting: data.user.timedVoting,
            votingTimeLimit: data.user.votingTimeLimit,
          });
        }
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

  return {
    settings,
    isLoading: isPending || isLoading,
  };
}
