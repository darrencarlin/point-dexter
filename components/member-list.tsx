import { Id } from "@/convex/_generated/dataModel";
import { useGetSessionMembers } from "@/lib/hooks/convex/session-members";
import { useGetStoryVotes } from "@/lib/hooks/convex/votes";
import { useGetActiveStory } from "@/lib/hooks/convex/stories";
import { useEndedStory } from "@/lib/hooks/convex/use-ended-story";
import { Title } from "./title";
import { useMemo } from "react";
import { Card } from "./card";
import { Check } from "lucide-react";

interface Props {
  id: string;
}

export const MemberList = ({ id }: Props) => {
  const sessionMembers = useGetSessionMembers(id as Id<"sessions">);
  const activeStory = useGetActiveStory(id as Id<"sessions">);
  const endedStory = useEndedStory(id as Id<"sessions">);

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
            <li key={member._id}>
              <Card className="flex items-center justify-between gap-8">
                <div className="flex flex-col flex-1">
                  <div className="flex flex-col gap-2">
                    {member.isAdmin && (
                      <span className="text-xs text-muted-foreground">
                        Admin
                      </span>
                    )}
                    <p className="font-semibold">{member.name}</p>
                  </div>
                </div>
                {!member.isAdmin &&
                  (activeStory && activeStory.status === "voting" ? (
                    // During voting: show checkmark if voted, otherwise "?"
                    hasVoted ? (
                      <div className="flex items-center justify-center w-10 h-10 border-2 rounded-full bg-primary/10 border-primary">
                        <Check className="w-5 h-5 text-primary" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-10 h-10 border-2 rounded-full bg-muted border-muted-foreground/20">
                        <span className="text-xs text-muted-foreground">?</span>
                      </div>
                    )
                  ) : endedStory ? (
                    // After voting ended: show vote value or "-"
                    hasVoted ? (
                      <div className="flex items-center justify-center w-10 h-10 border-2 rounded-full bg-primary/10 border-primary">
                        <span className="font-semibold text-primary">
                          {String(memberVote)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-10 h-10 border-2 rounded-full bg-muted border-muted-foreground/20">
                        <span className="text-xs text-muted-foreground">-</span>
                      </div>
                    )
                  ) : null)}
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
