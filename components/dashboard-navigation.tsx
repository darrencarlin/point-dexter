"use client";

import { useSession } from "@/lib/auth-client";
import { useLocalStorageValue } from "@/lib/hooks/use-local-storage-value";
import { Pointer } from "lucide-react";
import Link from "next/link";
import { SignOutButton } from "./buttons/sign-out-button";
import { ThemeToggle } from "./buttons/theme-toggle";

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
    <nav className="flex items-center justify-between p-4 mb-4">
      <Link href="/">
        <Pointer className="transition-transform hover:animate-spin" />
      </Link>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p>
            {status} <span className="font-bold">{displayName}</span>
          </p>
          {session?.user?.email && (
            <p className="text-sm text-muted-foreground">
              {session?.user?.email}
            </p>
          )}
        </div>
        {session && <SignOutButton />}
        <ThemeToggle />
      </div>
    </nav>
  );
};
