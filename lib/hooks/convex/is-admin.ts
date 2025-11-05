import { useSession } from "@/lib/auth-client";
import { useGetSession } from "./sessions";
import { Id } from "@/convex/_generated/dataModel";

export const useIsAdmin = (id: string) => {
  const { data: authSession } = useSession();
  const session = useGetSession(id as Id<"sessions">);

  const isAdmin = session?.createdBy === authSession?.user?.id;
  return isAdmin;
};
