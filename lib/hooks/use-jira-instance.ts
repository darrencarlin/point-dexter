import { useEffect } from "react";
import { useAtom } from "jotai";
import { useSession } from "@/lib/auth-client";
import { jiraSiteUrlAtom } from "@/lib/state";
import { BASE_URL } from "@/lib/constants";

export interface JiraInstance {
  id: string;
  name: string;
  url: string;
  scopes: string[];
  avatarUrl: string;
}

export function useJiraInstance() {
  const { data: session, isPending } = useSession();
  const [jiraSiteUrl, setJiraSiteUrl] = useAtom(jiraSiteUrlAtom);

  useEffect(() => {
    async function fetchJiraInstance() {
      if (!session?.user) {
        setJiraSiteUrl("");
        return;
      }

      try {
        const response = await fetch(`${BASE_URL}/api/jira/instance`);

        if (!response.ok) {
          console.error("Failed to fetch Jira instance:", response.statusText);
          return;
        }

        const data = await response.json();

        if (data.instances && data.instances.length > 0) {
          // Use the first (primary) instance URL
          const primaryInstance: JiraInstance = data.instances[0];
          setJiraSiteUrl(primaryInstance.url);
        } else {
          console.warn("No Jira instances found");
          setJiraSiteUrl("");
        }
      } catch (error) {
        console.error("Failed to fetch Jira instance:", error);
        setJiraSiteUrl("");
      }
    }

    if (!isPending) {
      fetchJiraInstance();
    }
  }, [session?.user, isPending, setJiraSiteUrl]);

  return {
    jiraSiteUrl,
    isLoading: isPending,
  };
}