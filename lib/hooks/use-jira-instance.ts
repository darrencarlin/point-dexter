import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { useSession } from "@/lib/auth-client";
import { jiraSiteUrlAtom } from "@/lib/state";
import { BASE_URL } from "@/lib/constants";
import { JiraInstance } from "@/lib/types/jira";

export function useJiraInstance() {
  const { data: session, isPending } = useSession();
  const [jiraSiteUrl, setJiraSiteUrl] = useAtom(jiraSiteUrlAtom);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();
    async function fetchJiraInstance() {
      if (!session?.user) {
        setJiraSiteUrl("");
        setError(null);
        return;
      }
      try {
        const response = await fetch(`${BASE_URL}/api/jira/instance`, {
          signal: abortController.signal
        });
        if (!response.ok) {
          console.error("Failed to fetch Jira instance:", response.statusText);
          setError(`Failed to fetch Jira instance: ${response.statusText}`);
          return;
        }
        const data = await response.json();
        if (data.instances && data.instances.length > 0) {
          // Use the first (primary) instance URL
          const primaryInstance: JiraInstance = data.instances[0];
          setJiraSiteUrl(primaryInstance.url);
          setError(null);
        } else {
          console.warn("No Jira instances found");
          setJiraSiteUrl("");
          setError(null);
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        console.error("Failed to fetch Jira instance:", error);
        setJiraSiteUrl("");
        setError(error instanceof Error ? error.message : "Unknown error");
      }
    }
    if (!isPending) {
      fetchJiraInstance();
    }
    return () => {
      abortController.abort();
    };
  }, [session?.user, isPending, setJiraSiteUrl]);

  return {
    jiraSiteUrl,
    isLoading: isPending,
    error,
  };
}
