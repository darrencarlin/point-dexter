"use client";

import { useSession } from "@/lib/auth-client";
import { useLocalStorageValue } from "@/lib/hooks/use-local-storage-value";

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
    <header className="flex justify-end p-4 border-b">
      <p>
        {status} <span className="font-bold">{displayName}</span>
      </p>
    </header>
  );
};
