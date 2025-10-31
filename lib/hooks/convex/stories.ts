import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useSession } from "../../auth-client";
import { Id } from "../../../convex/_generated/dataModel";

export function useGetSessionStories(sessionId: Id<"sessions"> | undefined) {
  return useQuery(
    api.stories.getSessionStories,
    sessionId ? { sessionId } : "skip"
  );
}

export function useGetActiveStory(sessionId: Id<"sessions"> | undefined) {
  return useQuery(
    api.stories.getActiveStory,
    sessionId ? { sessionId } : "skip"
  );
}

export function useAddStory() {
  const mutation = useMutation(api.stories.addStory);
  const { data: session } = useSession();

  return async (args: {
    sessionId: Id<"sessions">;
    title: string;
    description?: string;
  }) => {
    if (!session?.user?.id) {
      throw new Error("Must be logged in to add stories");
    }

    return await mutation({
      sessionId: args.sessionId,
      title: args.title,
      description: args.description,
      userId: session.user.id,
    });
  };
}

export function useToggleStoryActive() {
  const mutation = useMutation(api.stories.toggleStoryActive);
  const { data: session } = useSession();

  return async (storyId: Id<"stories">, isActive: boolean) => {
    if (!session?.user?.id) {
      throw new Error("Must be logged in to toggle story active state");
    }

    return await mutation({
      storyId,
      isActive,
      userId: session.user.id,
    });
  };
}

export function useEndVoting() {
  const mutation = useMutation(api.stories.endVoting);
  const { data: session } = useSession();

  return async (storyId: Id<"stories">) => {
    if (!session?.user?.id) {
      throw new Error("Must be logged in to end voting");
    }

    return await mutation({
      storyId,
      userId: session.user.id,
    });
  };
}
