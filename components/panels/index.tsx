import { useIsAdmin } from "@/lib/hooks/convex/is-admin";
import { AdminPanel } from "./admin-panel";
import { UserPanel } from "./user-panel";

interface Props {
  id: string;
}

export const Panels = ({ id }: Props) => {
  const isAdmin = useIsAdmin(id);

  if (isAdmin) {
    return <AdminPanel id={id} />;
  }

  return <UserPanel id={id} />;
};
