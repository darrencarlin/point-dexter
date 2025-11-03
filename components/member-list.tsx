import { Id } from "@/convex/_generated/dataModel";
import { useGetSessionMembers } from "@/lib/hooks/convex/session-members";
import { useGetStoryVotes } from "@/lib/hooks/convex/votes";
import { useGetActiveStory } from "@/lib/hooks/convex/stories";
import { useEndedStory } from "@/lib/hooks/convex/use-ended-story";
import { Title } from "./title";
import { useMemo } from "react";

interface Props {
  id: string;
}

export const MemberList = ({ id }: Props) => {
  const sessionMembers = useGetSessionMembers(id as Id<"sessions">);
  const activeStory = useGetActiveStory(id as Id<"sessions">);
  const endedStory = useEndedStory(id as Id<"sessions">);
  const votes = useGetStoryVotes(endedStory?._id);

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
    <div>
      <Title
        title="Session Members"
        subtitle="List of members in this session"
      />
      <ul className="space-y-2">
        {sessionMembers?.map((member) => {
          const memberVote = votesByUserId.get(member.userId);
          const hasVoted = memberVote !== undefined;

          return (
            <li
              key={member._id}
              className="flex items-center justify-between p-4 border rounded-lg gap-8"
            >
              <div className="flex flex-col flex-1">
                <div className="flex items-center gap-2">
                  {member.isAdmin && (
                    <span className="text-xs text-muted-foreground">Admin</span>
                  )}
                  <p className="font-semibold">{member.name}</p>
                </div>
                {!member.isAdmin && activeStory && activeStory.status === "voting" && (
                  <div className="mt-1">
                    <span className="text-sm text-muted-foreground italic">
                      Voting in progress...
                    </span>
                  </div>
                )}
              </div>
              {!member.isAdmin && (
                activeStory && activeStory.status === "voting" ? (
                  // During voting: show "?"
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted border-2 border-muted-foreground/20">
                    <span className="text-xs text-muted-foreground">?</span>
                  </div>
                ) : endedStory ? (
                  // After voting ended: show vote value or "-"
                  hasVoted ? (
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 border-2 border-primary">
                      <span className="font-semibold text-primary">
                        {String(memberVote)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted border-2 border-muted-foreground/20">
                      <span className="text-xs text-muted-foreground">-</span>
                    </div>
                  )
                ) : null
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
