"use client";

import { Button } from "@/components/ui/button";
import { signOut, useSession } from "@/lib/auth-client";

export default function Home() {
  const { data: session } = useSession();

  const handleSignOut = async () => {
    signOut();
  };

  return (
    <main className="flex flex-col items-center justify-between p-24">
      {session ? (
        <div>
          <p className="mb-4">Signed in as {session.user?.email}</p>
          <Button onClick={handleSignOut}>Sign Out</Button>
        </div>
      ) : (
        <p>Not signed in</p>
      )}
    </main>
  );
}
