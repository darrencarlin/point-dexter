import { Id } from "@/convex/_generated/dataModel";
import { useSession } from "@/lib/auth-client";
import { useGetSession } from "@/lib/hooks/convex/sessions";
import { AdminPanel } from "./admin-panel";
import { UserPanel } from "./user-panel";

interface Props {
  id: string;
}

export const Panels = ({ id }: Props) => {
  const { data: authSession } = useSession();
  const session = useGetSession(id as Id<"sessions">);

  const isAdmin = session?.createdBy === authSession?.user?.id;

  if (isAdmin) {
    return <AdminPanel id={id} />;
  }

  return <UserPanel id={id} />;
};
