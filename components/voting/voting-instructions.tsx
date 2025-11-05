"use client";

import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { useGetActiveStory } from "@/lib/hooks/convex/stories";
import { useGetUserVote, useVote } from "@/lib/hooks/convex/votes";
import { Button } from "@/components/ui/button";
import { Title } from "@/components/title";
import { Loading } from "@/components/loading";
import { Card } from "../card";
import { VotingTimer } from "./voting-timer";
import { cn } from "@/lib/utils";

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
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <Title
          title="Voting Instructions"
          subtitle="Select your estimate for the current story"
        />
      </div>

      {/* Story Information */}
      <Card className="mb-6">
        <h3 className="text-lg font-semibold">{activeStory?.title}</h3>
        {activeStory?.description && (
          <p className="text-sm text-muted-foreground">
            {activeStory.description}
          </p>
        )}
      </Card>

      {/* Voting Options */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 mb-6">
          {votingOptions.map((option) => {
            const isSelected = currentVote === option;

            const cardClassName = cn(
              "text-3xl font-bold shadow rounded-lg w-28 h-28 flex items-center justify-center transition-colors hover:-translate-y-1 hover:shadow-lg duration-150 transition-transform",
              {
                "ring-2 ring-primary ring-offset-2 ": isSelected,
              }
            );

            return (
              <Button
                key={option}
                variant={isSelected ? "default" : "outline"}
                className={cardClassName}
                onClick={() => handleVote(option)}
                disabled={isVoting}
              >
                {option}
              </Button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
