"use client";

import { useSession } from "@/lib/auth-client";
import { useLocalStorageValue } from "@/lib/hooks/use-local-storage-value";
import { SignOutButton } from "./buttons/sign-out-button";
import Link from "next/link";
import { Plus, Pointer } from "lucide-react";
import { ThemeToggle } from "./buttons/theme-toggle";
import { Button } from "./ui/button";

export const DashboardNavigation = () => {
  const { data: session } = useSession();
  const anonymousUserName = useLocalStorageValue(
    "anonymous_user_name",
    "Anonymous"
  );

  // If user is signed in, show their name. Otherwise show anonymous name
  const displayName = session?.user?.name || anonymousUserName;
  const status = session?.user?.name ? "Hi, " : "Participating as";

  return (
    <nav className="flex justify-between items-center p-4 mb-8">
      <Link href="/">
        <Pointer className="hover:animate-spin transition-transform" />
      </Link>

      <div className="flex items-center gap-4">
        <p>
          {status} <span className="font-bold">{displayName}</span>
        </p>
        <Button>
          <Plus className="size-5" />
          <span className="font-bold">New Session</span>
        </Button>
        {session && <SignOutButton />}
        <ThemeToggle />
      </div>
    </nav>
  );
};
