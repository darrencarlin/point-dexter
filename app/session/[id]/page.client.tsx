"use client";

import { useState, useEffect } from "react";
import {
  useGetSessionMembers,
  useJoinSession,
  getEffectiveUserId,
} from "@/lib/hooks/convex/session-members";
import { useGetSession } from "@/lib/hooks/convex/sessions";
import { useMaintainPresence } from "@/lib/hooks/convex/presence";
import { useLocalStorageValue } from "@/lib/hooks/use-local-storage-value";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Id } from "@/convex/_generated/dataModel";
import { Loading } from "@/components/loading";
import { useRouter } from "next/navigation";
import { MemberList } from "@/components/member-list";
import { Title } from "@/components/title";
import { Panels } from "@/components/panels";
import { Card } from "@/components/card";
import { Share } from "@/components/share";

interface Props {
  id: string;
}

export default function ClientSessionPage({ id }: Props) {
  const router = useRouter();
  const { data: authSession, isPending: isAuthPending } = useSession();
  const storedName = useLocalStorageValue("anonymous_user_name", "");
  const [name, setName] = useState(storedName);
  const [hasJoined, setHasJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const joinSession = useJoinSession();
  const session = useGetSession(id as Id<"sessions">);
  const sessionMembers = useGetSessionMembers(id as Id<"sessions">);

  // Maintain presence heartbeat for this user
  useMaintainPresence(hasJoined ? (id as Id<"sessions">) : undefined);

  // Check if the user is already a member of the session
  useEffect(() => {
    if (sessionMembers) {
      const currentUserId = getEffectiveUserId(authSession);

      const isMember = sessionMembers.some(
        (member) => member.userId === currentUserId
      );
      setHasJoined(isMember);
    }
  }, [sessionMembers, authSession]);

  // Initialize name from local storage
  useEffect(() => {
    if (storedName) {
      setName(storedName);
    }
  }, [storedName]);

  // Save name to local storage when it changes
  if (isAuthPending || sessionMembers === undefined) {
    return <Loading />;
  }

  // Handle case where session is not found
  if (!session) {
    return (
      <Card className="max-w-md mx-auto mt-6">
        <Title
          title="Session not found"
          subtitle="This session may have been closed or does not exist."
        />
      </Card>
    );
  }

  const handleJoinSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await joinSession(id as Id<"sessions">, name);
      window.localStorage.setItem("anonymous_user_name", name);
      setHasJoined(true);
      router.refresh();
    } catch (error) {
      console.error("Failed to join session:", error);
    } finally {
      setLoading(false);
    }
  };

  if (hasJoined) {
    return (
      <main className="flex flex-1 w-full gap-4 p-4 mx-auto overflow-hidden max-w-7xl">
        {/* Left Column - Scrollable Content */}
        <div className="flex flex-col flex-1 gap-4 overflow-y-auto">
          {/* Title Section - Full Width */}
          <Card className="shrink-0">
            <h2 className="text-2xl font-bold">{session.name}</h2>
          </Card>

          {/* Panels will render sections here */}
          <Panels id={id} />
        </div>

        {/* Right Column - Session Members (Fixed) */}
        <div className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-0 flex flex-col gap-4 h-full overflow-hidden">
            <MemberList id={id} />
            <Share />
          </div>
        </div>

        {/* Mobile: Show members at bottom */}
        <div className="fixed bottom-0 left-0 right-0 p-4 overflow-y-auto lg:hidden max-h-48">
          <MemberList id={id} />
          <Share />
        </div>
      </main>
    );
  }

  return (
    <main className="flex items-center justify-center flex-1 p-4">
      <div className="w-full max-w-md p-6 border rounded-lg shadow-sm bg-card border-border">
        <Title
          title={session.name}
          subtitle="Enter your name to join this pointing session"
        />

        <form className="mt-4 space-y-4">
          <div>
            <Label htmlFor="name" className="mb-2">
              Your Name
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>
          <Button type="button" disabled={loading} onClick={handleJoinSession}>
            {loading ? "Joining..." : "Join Session"}
          </Button>
        </form>
      </div>
    </main>
  );
}
