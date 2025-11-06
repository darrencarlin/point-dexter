import { useJiraInstance } from "@/lib/hooks/use-jira-instance";
import { useIsAdmin } from "@/lib/hooks/use-session-hooks";
import { AdminPanel } from "./admin-panel";
import { UserPanel } from "./user-panel";

export const Panels = () => {
  const isAdmin = useIsAdmin();

  // Fetch and set the Jira instance URL
  useJiraInstance();

  if (isAdmin) {
    return <AdminPanel />;
  }

  return <UserPanel />;
};
