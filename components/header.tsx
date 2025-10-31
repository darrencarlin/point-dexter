"use client";

import { authClient, useSession } from "@/lib/auth-client";
import { useLocalStorageValue } from "@/lib/hooks/use-local-storage-value";
import { Button } from "./ui/button";

export const Header = () => {
  const { data: session } = useSession();
  const anonymousUserName = useLocalStorageValue(
    "anonymous_user_name",
    "Anonymous"
  );

  // If user is signed in, show their name. Otherwise show anonymous name
  const displayName = session?.user?.name || anonymousUserName;
  const status = session?.user?.name ? "Signed in as" : "Participating as";

  const isSignedIn = session?.user?.name !== undefined;

  return (
    <header className="flex items-center justify-end gap-4 p-4 border-b">
      <p>
        {status} <span className="font-bold">{displayName}</span>
      </p>
      {isSignedIn && (
        <Button variant="outline" onClick={() => authClient.signOut()}>
          Sign Out
        </Button>
      )}
    </header>
  );
};
