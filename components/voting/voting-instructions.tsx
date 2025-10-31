"use client";

import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { useGetActiveStory } from "@/lib/hooks/convex/stories";
import { useGetUserVote, useVote } from "@/lib/hooks/convex/votes";
import { Button } from "@/components/ui/button";
import { Title } from "@/components/title";
import { Loading } from "@/components/loading";

interface Props {
  sessionId: Id<"sessions">;
}

/**
 * Voting instructions component that displays the current active story
 * and allows users to vote using numbered buttons
 */
export function VotingInstructions({ sessionId }: Props) {
  const activeStory = useGetActiveStory(sessionId);
  const userVote = useGetUserVote(activeStory?._id);
  const vote = useVote();
  const [isVoting, setIsVoting] = useState(false);

  // Standard voting options (Fibonacci sequence + question mark)
  const votingOptions: (number | string)[] = [1, 2, 3, 5, 8, 13, 21, "?"];

  // Show loading state while fetching active story
  if (activeStory === undefined) {
    return <Loading />;
  }

  // Show message when no active story
  if (!activeStory) {
    return (
      <div className="text-center py-8">
        <Title
          title="Voting Instructions"
          subtitle="No story is currently active. Please wait for the admin to start a voting session."
        />
      </div>
    );
  }

  const handleVote = async (points: number | string) => {
    if (isVoting || !activeStory?._id) return;

    setIsVoting(true);
    try {
      await vote(activeStory._id, points);
    } catch (error) {
      console.error("Failed to vote:", error);
    } finally {
      setIsVoting(false);
    }
  };

  const currentVote = userVote?.points;

  return (
    <div className="space-y-6">
      <Title
        title="Voting Instructions"
        subtitle="Select your estimate for the current story"
      />

      {/* Story Information */}
      <div className="space-y-2 p-4 bg-muted rounded-lg">
        <h3 className="text-lg font-semibold">{activeStory.title}</h3>
        {activeStory.description && (
          <p className="text-sm text-muted-foreground">
            {activeStory.description}
          </p>
        )}
      </div>

      {/* Voting Options */}
      <div className="space-y-4">
        <p className="text-sm font-medium">Select your vote:</p>
        <div className="flex flex-wrap gap-3">
          {votingOptions.map((option) => {
            const isSelected = currentVote === option;
            return (
              <Button
                key={option}
                variant={isSelected ? "outline" : "default"}
                className={
                  isSelected
                    ? "ring-2 ring-primary ring-offset-2 min-w-[60px]"
                    : "min-w-[60px]"
                }
                onClick={() => handleVote(option)}
                disabled={isVoting}
              >
                {option}
              </Button>
            );
          })}
        </div>
      </div>

      {currentVote !== undefined && (
        <p className="text-sm text-muted-foreground">
          Your current vote: <span className="font-semibold">{currentVote}</span>
        </p>
      )}
    </div>
  );
}

