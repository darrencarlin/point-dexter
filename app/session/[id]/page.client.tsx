"use client";

import { SettingsButton } from "@/components/buttons/settings-button";
import { Card } from "@/components/card";
import { Loading } from "@/components/loading";
import { MemberList } from "@/components/member-list";
import { Panels } from "@/components/panels";
import { Share } from "@/components/share";
import { Title } from "@/components/title";
import { Total } from "@/components/total";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VotingTimer } from "@/components/voting/voting-timer";
import { Id } from "@/convex/_generated/dataModel";
import { useSession } from "@/lib/auth-client";
import { useIsAdmin } from "@/lib/hooks/convex/use-is-admin";
import {
  getEffectiveUserId,
  useGetSessionMembers,
  useJoinSession,
} from "@/lib/hooks/convex/use-session-members";
import { useGetSession } from "@/lib/hooks/convex/use-sessions";
import { useLocalStorageValue } from "@/lib/hooks/use-local-storage-value";
import { sessionIdAtom } from "@/lib/state";
import { useMaintainPresence } from "@/lib/hooks/use-session-hooks";
import { useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
  const [isEndSessionDialogOpen, setIsEndSessionDialogOpen] = useState(false);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const joinSession = useJoinSession();
  const session = useGetSession(id as Id<"sessions">);
  const sessionMembers = useGetSessionMembers(id as Id<"sessions">);
  const isAdmin = useIsAdmin(id);

  // Set the session ID atom for use throughout the app
  const setSessionId = useSetAtom(sessionIdAtom);

  // Set session ID atom when component mounts or id changes
  useEffect(() => {
    setSessionId(id as Id<"sessions">);

    return () => {
      setSessionId("" as Id<"sessions">);
    };
  }, [id, setSessionId]);

  // Maintain presence heartbeat for this user (only when joined)
  useMaintainPresence(hasJoined);

  const handleEndSession = async () => {
    if (!session?._id) {
      console.error("Session not found");
      toast.error("Session not found");
      return;
    }

    setIsEndingSession(true);
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId: session._id }),
      });

      if (response.ok) {
        toast.success(
          "Session ended successfully and archived to long-term storage!"
        );
        setIsEndSessionDialogOpen(false);
        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      } else {
        const error = await response.json();
        console.error("Failed to end session:", error);
        toast.error(
          "Failed to end session: " + (error.error || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error ending session:", error);
      toast.error("Error ending session. Please try again.");
    } finally {
      setIsEndingSession(false);
    }
  };

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
      <main className="flex w-full gap-4 p-4 mx-auto max-w-7xl">
        {/* Left Column - Scrollable Content */}
        <div className="flex flex-col flex-1 gap-4">
          {/* Title Section - Full Width */}
          <Card className="shrink-0 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">{session.name}</h2>
              <Total />
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2">
                <SettingsButton />
                <Dialog
                  open={isEndSessionDialogOpen}
                  onOpenChange={setIsEndSessionDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="destructive">End Session</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>End Session</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to end this session? This will
                        archive all data to long-term storage.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsEndSessionDialogOpen(false)}
                        disabled={isEndingSession}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleEndSession}
                        disabled={isEndingSession}
                      >
                        {isEndingSession ? "Ending..." : "End Session"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </Card>

          {/* Panels will render sections here */}
          <Panels />
        </div>

        {/* Right Column - Session Members (Fixed) */}
        <div className="hidden lg:block w-80 shrink-0">
          <div className="flex flex-col gap-4 max-h-[500px]">
            <VotingTimer />
            <MemberList />
            <Share />
          </div>
        </div>

        {/* Mobile: Show members at bottom */}
        <div className="lg:hidden mt-4">
          <VotingTimer />
          <MemberList />
          <Share />
        </div>
      </main>
    );
  }

  return (
    <main className="flex items-center justify-center p-4">
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
