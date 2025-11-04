"use client";

import { signOut, useSession } from "@/lib/auth-client";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export const SignOutButton = () => {
  const router = useRouter();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (!session) return null;

  return (
    <Button onClick={handleSignOut} variant="outline" size="icon">
      <LogOut />
    </Button>
  );
};
