import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useSession } from "../../auth-client";
import { Id } from "../../../convex/_generated/dataModel";

export function useGetSession(sessionId: Id<"sessions"> | undefined) {
  return useQuery(
    api.sessions.getSession,
    sessionId ? { sessionId } : "skip"
  );
}

export function useGetSessions() {
  const { data: session } = useSession();

  return useQuery(
    api.sessions.getSessions,
    session?.user?.id ? { userId: session.user.id } : "skip"
  );
}

export function useCreateSession() {
  const mutation = useMutation(api.sessions.createSession);
  const { data: session } = useSession();

  return async (name: string) => {
    if (!session?.user?.id) {
      throw new Error("Must be logged in to create a session");
    }

    return await mutation({
      name,
      userId: session.user.id,
    });
  };
}
