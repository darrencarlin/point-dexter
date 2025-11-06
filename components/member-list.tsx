import { useGetStoryVotes } from "@/lib/hooks/convex/use-votes";
import { Card } from "./card";
import { Title } from "./title";
import { useMemo } from "react";
import { Check } from "lucide-react";
import {
  useGetSessionMembers,
  useGetActiveStory,
  useEndedStory,
  useActiveUsers,
} from "@/lib/hooks/use-session-hooks";

export const MemberList = () => {
  const sessionMembers = useGetSessionMembers();
  const activeStory = useGetActiveStory();
  const endedStory = useEndedStory();
  const activeUsers = useActiveUsers();

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

  return (
    <Card>
      <Title
        title="Session Members"
        subtitle={`${sessionMembers?.length || 0} members in this session`}
      />
      <ul className="space-y-2">
        {sessionMembers?.map((member) => {
          const memberVote = votesByUserId.get(member.userId);
          const hasVoted = memberVote !== undefined;
          const isActive = activeUsers?.includes(member.userId);

          return (
            <li key={member._id}>
              <Card className="flex items-center justify-between gap-8">
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-2">
                      {member.isAdmin && (
                        <span className="text-xs text-muted-foreground">
                          Admin
                        </span>
                      )}
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
                    </div>
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
