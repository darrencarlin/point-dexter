import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { v4 as uuid } from "uuid";
import { useSession } from "@/lib/auth-client";

// Generate a unique anonymous user ID and store in localStorage (persists across sessions)
function getAnonymousUserId(): string {
  if (typeof window === "undefined") return "";

  const key = "anonymous_user_id";
  let userId = localStorage.getItem(key);

  if (!userId) {
    const id = uuid();
    userId = `anon_${id}`;
    localStorage.setItem(key, userId);
  }

  return userId;
}

// Get or set anonymous user name from localStorage (persists across sessions)
function getAnonymousUserName(): string {
  if (typeof window === "undefined") return "Anonymous";

  const key = "anonymous_user_name";
  return localStorage.getItem(key) || "Anonymous";
}

export function setAnonymousUserName(name: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("anonymous_user_name", name);
}

export function getCurrentUserId(): string {
  return getAnonymousUserId();
}

export function getCurrentUserName(): string {
  return getAnonymousUserName();
}

export function getEffectiveUserId(
  session?: { user?: { id?: string } } | null
): string {
  return session?.user?.id ?? getAnonymousUserId();
}

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
      setAnonymousUserName(customName);
      setUserName(customName);
    }

    return await mutation({
      sessionId,
      userId,
      name: nameToUse,
    });
  };
}
