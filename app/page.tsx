"use client";

import { Navigation } from "@/components/navigation";
import { useSession } from "@/lib/auth-client";

export default function Home() {
  const { data: session } = useSession();

  return (
    <>
      <Navigation />
      <main className="flex flex-col items-center justify-between p-24">
        {session ? (
          <p className="mb-4">Signed in as {session.user?.email}</p>
        ) : (
          <p>Not signed in</p>
        )}
      </main>
    </>
  );
}
