import { useGetStoryVotes } from "@/lib/hooks/convex/use-votes";
import { Card } from "./card";
import { Title } from "./title";
import { useMemo, useState } from "react";
import { Check, LogOut, UserX } from "lucide-react";
import {
  useGetSessionMembers,
  useGetActiveStory,
  useEndedStory,
  useActiveUsers,
  useSessionId,
  useIsAdmin,
  useSessionSettings,
} from "@/lib/hooks/use-session-hooks";
import { useSession } from "@/lib/auth-client";
import { getEffectiveUserId } from "@/lib/utils/user-identity";
import { useLeaveSession, useKickMember } from "@/lib/hooks/convex/use-session-members";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { toast } from "sonner";

export const MemberList = () => {
  const sessionMembers = useGetSessionMembers();
  const activeStory = useGetActiveStory();
  const endedStory = useEndedStory();
  const activeUsers = useActiveUsers();
  const sessionId = useSessionId();
  const { data: authSession } = useSession();
  const leaveSession = useLeaveSession();
  const kickMember = useKickMember();
  const isAdmin = useIsAdmin();
  const { settings: sessionSettings } = useSessionSettings();
  const router = useRouter();
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isKickDialogOpen, setIsKickDialogOpen] = useState(false);
  const [isKicking, setIsKicking] = useState(false);
  const [memberToKick, setMemberToKick] = useState<{
    userId: string;
    name: string;
  } | null>(null);

  const currentUserId = getEffectiveUserId(authSession);
  const showKickButtons = sessionSettings?.showKickButtons ?? true;

  // Get votes for the active story (if voting) or ended story (if showing results)
  const storyToCheck =
    activeStory?.status === "voting" ? activeStory : endedStory;

  const votes = useGetStoryVotes(storyToCheck?._id);

  // Create a map of userId -> vote for quick lookup
  const votesByUserId = useMemo(() => {
    if (!votes) return new Map<string, string | number>();
    const map = new Map<string, string | number>();
    votes.forEach((vote) => {
      map.set(vote.userId, vote.points);
    });
    return map;
  }, [votes]);

  // Sort members to show admin first
  const sortedMembers = useMemo(() => {
    if (!sessionMembers) return [];
    return [...sessionMembers].sort((a, b) => {
      if (a.isAdmin && !b.isAdmin) return -1;
      if (!a.isAdmin && b.isAdmin) return 1;
      return 0;
    });
  }, [sessionMembers]);

  const handleLeaveSession = async () => {
    if (!sessionId) {
      toast.error("Session ID not found");
      return;
    }

    setIsLeaving(true);
    try {
      await leaveSession(sessionId);
      toast.success("You have left the session");
      setIsLeaveDialogOpen(false);
      // Redirect to home page
      router.push("/");
    } catch (error) {
      console.error("Failed to leave session:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to leave session"
      );
    } finally {
      setIsLeaving(false);
    }
  };

  const handleKickMember = async () => {
    if (!sessionId || !memberToKick) {
      toast.error("Session ID or member not found");
      return;
    }

    setIsKicking(true);
    try {
      const result = await kickMember(sessionId, memberToKick.userId);
      toast.success(`${result.kickedUserName} has been removed from the session`);
      setIsKickDialogOpen(false);
      setMemberToKick(null);
    } catch (error) {
      console.error("Failed to kick member:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to kick member"
      );
    } finally {
      setIsKicking(false);
    }
  };

  const openKickDialog = (member: { userId: string; name: string }) => {
    setMemberToKick(member);
    setIsKickDialogOpen(true);
  };

  return (
    <Card>
      <Title
        title="Session Members"
        subtitle={`${sessionMembers?.length || 0} members in this session`}
      />
      <ul className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto hide-scrollbar mt-4">
        {sortedMembers?.map((member) => {
          const memberVote = votesByUserId.get(member.userId);
          const hasVoted = memberVote !== undefined;
          const isActive = activeUsers?.includes(member.userId);

          return (
            <li key={member._id}>
              <Card className="flex items-center justify-between gap-8">
                <div className="flex flex-col flex-1 gap-2">
                  {member.isAdmin && (
                    <span className="text-xs text-muted-foreground">
                      Admin
                    </span>
                  )}
                  <div className="flex items-center justify-between w-full gap-2">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{member.name}</p>
                      {/* Show green pulsing dot if active, orange static dot if inactive */}
                      {isActive ? (
                        <span
                          className="relative flex h-2 w-2"
                          title="Active"
                        >
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-start opacity-75"></span>
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-start"></span>
                        </span>
                      ) : (
                        <span
                          className="relative flex h-2 w-2"
                          title="Inactive"
                        >
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500"></span>
                        </span>
                      )}
                    </div>
                    {/* Show leave button next to current user's name, or kick button for admins */}
                    {member.userId === currentUserId && !member.isAdmin ? (
                      <Dialog
                        open={isLeaveDialogOpen}
                        onOpenChange={setIsLeaveDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="secondary"
                            size="icon-sm"
                            title="Leave session"
                          >
                            <LogOut className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Leave Session</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to leave this session?
                              You can rejoin later if needed.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setIsLeaveDialogOpen(false)}
                              disabled={isLeaving}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={handleLeaveSession}
                              disabled={isLeaving}
                            >
                              {isLeaving ? "Leaving..." : "Leave Session"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    ) : isAdmin && !member.isAdmin && showKickButtons ? (
                      <Dialog
                        open={isKickDialogOpen && memberToKick?.userId === member.userId}
                        onOpenChange={(open) => {
                          if (open) {
                            openKickDialog({ userId: member.userId, name: member.name });
                          } else {
                            setIsKickDialogOpen(false);
                            setMemberToKick(null);
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="secondary"
                            size="icon-sm"
                            title={`Remove ${member.name} from session`}
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Remove Member</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to remove {member.name} from this session?
                              They will need to rejoin if they want to participate again.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsKickDialogOpen(false);
                                setMemberToKick(null);
                              }}
                              disabled={isKicking}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={handleKickMember}
                              disabled={isKicking}
                            >
                              {isKicking ? "Removing..." : "Remove Member"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    ) : null}
                  </div>
                </div>
                {!member.isAdmin &&
                  activeStory &&
                  (activeStory.status === "voting" ? (
                    // During voting: show checkmark if voted, otherwise "?"
                    hasVoted ? (
                      <div className="flex items-center justify-center w-7 h-7 border rounded-full bg-primary/10 border-primary">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-7 h-7 border rounded-full bg-muted border-muted-foreground/20">
                        <span className="text-xs text-muted-foreground">?</span>
                      </div>
                    )
                  ) : endedStory ? (
                    // After voting ended: show vote value or "-"
                    hasVoted ? (
                      <div className="flex items-center justify-center w-7 h-7 border rounded-full bg-primary/10 border-primary">
                        <span className="text-primary">
                          {String(memberVote)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-7 h-7 border rounded-full bg-muted border-muted-foreground/20">
                        <span className="text-xs text-muted-foreground">-</span>
                      </div>
                    )
                  ) : null)}
              </Card>
            </li>
          );
        })}
      </ul>
    </Card>
  );
};
