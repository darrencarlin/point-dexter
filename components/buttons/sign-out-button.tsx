import { signOut, useSession } from "@/lib/auth-client";
import { Button } from "../ui/button";

export const SignOutButton = () => {
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut();
  };

  if (!session) return null;

  return <Button onClick={handleSignOut}>Sign Out</Button>;
};
