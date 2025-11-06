import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { useSession } from "@/lib/auth-client";
import {
  getEffectiveUserId,
  getAnonymousUserName,
  setAnonymousUserName,
} from "@/lib/utils/user-identity";

// Re-export for backward compatibility
export { getEffectiveUserId } from "@/lib/utils/user-identity";

export function useGetSessionMembers(sessionId: Id<"sessions"> | undefined) {
  return useQuery(
    api.sessionMembers.getSessionMembers,
    sessionId ? { sessionId } : "skip"
  );
}

export function useJoinSession() {
  const { data: session } = useSession();
  const mutation = useMutation(api.sessionMembers.joinSession);
  const [userName, setUserName] = useState<string>(getAnonymousUserName);

  return async (sessionId: Id<"sessions">, customName?: string) => {
    // Get fresh userId each time to ensure we use the latest from localStorage
    const userId = getEffectiveUserId(session);
    const nameToUse = customName || userName;

    if (customName) {
      setAnonymousUserName(customName ?? (session?.user?.name || "Anonymous"));
      setUserName(customName);
    }

    return await mutation({
      sessionId,
      userId,
      name: nameToUse,
    });
  };
}
