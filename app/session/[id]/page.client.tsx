"use client";

import { useState, useEffect } from "react";
import {
  useGetSessionMembers,
  useJoinSession,
  getEffectiveUserId,
} from "@/lib/hooks/convex/session-members";
import { useGetSession } from "@/lib/hooks/convex/sessions";
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
    return <div className="max-w-md mx-auto mt-6">Session not found</div>;
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
      <div className="p-4">
        <Title title={session.name} />
        <div className="grid grid-cols-[4fr_2fr] gap-8 mt-4">
          <Panels id={id} />
          <MemberList id={id} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-6">
      <Title
        title={session.name}
        subtitle="Enter your name to join this pointing session"
      />

      <form className="space-y-4">
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
  );
}
