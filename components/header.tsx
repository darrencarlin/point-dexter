"use client";

import { useSession } from "@/lib/auth-client";
import { useLocalStorageValue } from "@/lib/hooks/use-local-storage-value";
import { SignOutButton } from "./buttons/sign-out-button";
import { Button } from "./ui/button";
import Link from "next/link";

export const Header = () => {
  const { data: session } = useSession();
  const anonymousUserName = useLocalStorageValue(
    "anonymous_user_name",
    "Anonymous"
  );

  // If user is signed in, show their name. Otherwise show anonymous name
  const displayName = session?.user?.name || anonymousUserName;
  const status = session?.user?.name ? "Signed in as" : "Participating as";

  return (
    <header className="flex items-center justify-end gap-4 p-4 border-b">
      <div className="flex items-center gap-4">
        <p>
          {status} <span className="font-bold">{displayName}</span>{" "}
        </p>
        {session && <SignOutButton />}
        {!session && (
          <Button asChild>
            <Link href="/auth/sign-in">Sign In</Link>
          </Button>
        )}
      </div>
    </header>
  );
};
