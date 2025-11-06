import { useIsAdmin } from "@/lib/hooks/convex/use-is-admin";
import { useJiraInstance } from "@/lib/hooks/use-jira-instance";
import { AdminPanel } from "./admin-panel";
import { UserPanel } from "./user-panel";

interface Props {
  id: string;
}

export const Panels = ({ id }: Props) => {
  const isAdmin = useIsAdmin(id);

  // Fetch and set the Jira instance URL
  useJiraInstance();

  if (isAdmin) {
    return <AdminPanel id={id} />;
  }

  return <UserPanel id={id} />;
};
