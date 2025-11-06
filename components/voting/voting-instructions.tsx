"use client";

import { useMemo, useState } from "react";

import { useGetUserVote, useVote } from "@/lib/hooks/convex/use-votes";
import { Button } from "@/components/ui/button";
import { Title } from "@/components/title";
import { Loading } from "@/components/loading";
import { Card } from "../card";
import { cn } from "@/lib/utils";

import {
  DEFAULT_SCORING_TYPE,
  getScoringLabel,
  getScoringOptions,
} from "@/lib/constants/scoring";
import {
  useGetActiveStory,
  useSessionSettings,
} from "@/lib/hooks/use-session-hooks";

/**
 * Voting instructions component that displays the current active story
 * and allows users to vote using numbered buttons
 */
export function VotingInstructions() {
  const activeStory = useGetActiveStory();
  const userVote = useGetUserVote(activeStory?._id);
  const vote = useVote();
  const [isVoting, setIsVoting] = useState(false);
  const { settings: sessionSettings } = useSessionSettings();

  const scoringType = sessionSettings?.scoringType ?? DEFAULT_SCORING_TYPE;

  const votingOptions = useMemo(
    () => getScoringOptions(scoringType),
    [scoringType]
  );

  const scoringLabel = getScoringLabel(scoringType);

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
        <p className="text-sm text-muted-foreground">Deck: {scoringLabel}</p>
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
            const displayValue = String(option);
            const isStringOption = typeof option === "string";

            const cardClassName = cn(
              "shadow rounded-lg min-w-[7rem] min-h-[4.5rem] px-4 py-5 flex items-center justify-center text-center break-words transition-colors hover:-translate-y-1 hover:shadow-lg duration-150 transition-transform",
              {
                "text-3xl font-bold": !isStringOption,
                "text-lg font-semibold": isStringOption,
                "ring-2 ring-primary ring-offset-2 ": isSelected,
              }
            );

            return (
              <Button
                key={displayValue}
                variant={isSelected ? "default" : "outline"}
                className={cardClassName}
                onClick={() => handleVote(option)}
                disabled={isVoting}
              >
                {displayValue}
              </Button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
