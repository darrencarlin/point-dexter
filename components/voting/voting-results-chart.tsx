"use client";

import { Id } from "@/convex/_generated/dataModel";
import { useGetStoryVotes } from "@/lib/hooks/convex/use-votes";
import { useGetSessionMembers } from "@/lib/hooks/convex/use-session-members";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import { Loading } from "@/components/loading";
import { useEffect, useMemo } from "react";
import { Title } from "../title";
import { useEndedStory } from "@/lib/hooks/convex/use-ended-story";
import { Card } from "../card";
import { useSessionSettings } from "@/lib/hooks/use-session-settings";
import {
  DEFAULT_SCORING_TYPE,
  getScoringLabel,
  getScoringOptions,
} from "@/lib/constants/scoring";

interface Props {
  storyId: Id<"stories"> | undefined;
  sessionId: Id<"sessions">;
}

/**
 * Voting results chart component that displays vote distribution using a bar chart
 * @param {Props} props - Component properties
 * @returns {JSX.Element} Rendered chart component
 */
export function VotingResultsChart({ storyId, sessionId }: Props) {
  const votes = useGetStoryVotes(storyId);
  const members = useGetSessionMembers(sessionId);
  const endedStory = useEndedStory(sessionId);
  const { settings: sessionSettings } = useSessionSettings(sessionId);

  const scoringType =
    sessionSettings?.scoringType ?? DEFAULT_SCORING_TYPE;
  const scoringLabel = getScoringLabel(scoringType);
  const votingOptions = useMemo(() => {
    return getScoringOptions(scoringType).map((option) => String(option));
  }, [scoringType]);

  const { chartData, chartConfig } = useMemo(() => {
    if (!votes || votes.length === 0) {
      return {
        chartData: [] as { name: string; value: number }[],
        chartConfig: {} as Record<string, { label: string; color: string }>,
      };
    }

    const voteCounts: Record<string, number> = {};
    votes.forEach((vote) => {
      const key = String(vote.points);
      voteCounts[key] = (voteCounts[key] || 0) + 1;
    });

    const optionKeys = votingOptions;
    const uniqueKeys = Array.from(
      new Set([...optionKeys, ...Object.keys(voteCounts)])
    );

    const data = uniqueKeys
      .filter((key) => (voteCounts[key] ?? 0) > 0)
      .map((key) => ({
        name: key,
        value: voteCounts[key] ?? 0,
      }));

    const colorPalette = [
      "#6366F1",
      "#22C55E",
      "#EAB308",
      "#F97316",
      "#EF4444",
      "#06B6D4",
      "#A855F7",
      "#EC4899",
      "#14B8A6",
      "#F59E0B",
    ];

    const config = uniqueKeys.reduce(
      (acc, key, index) => {
        acc[key] = {
          label: key,
          color: colorPalette[index % colorPalette.length],
        };
        return acc;
      },
      {} as Record<string, { label: string; color: string }>
    );

    return { chartData: data, chartConfig: config };
  }, [votes, votingOptions]);

  // Determine participant (non-admin) count
  const participantCount = useMemo(() => {
    if (!members) return 0;
    return members.filter((m) => !m.isAdmin).length;
  }, [members]);

  // Unanimous detection
  const unanimousValue = useMemo(() => {
    if (!votes || votes.length === 0 || participantCount === 0) return null;
    // Ensure we're looking at votes for the correct story
    if (!storyId) return null;

    // Filter out admin votes - only count participant votes
    const participantVotes = votes.filter((vote) => {
      const member = members?.find((m) => m.userId === vote.userId);
      return member && !member.isAdmin;
    });

    // Build a map of userId -> vote value
    const voteValues = participantVotes.map((v) => String(v.points));

    // Require everyone voted and all values equal the first
    if (participantVotes.length !== participantCount) return null;
    if (participantVotes.length === 0) return null;

    return voteValues.every((v) => v === voteValues[0]) ? voteValues[0] : null;
  }, [votes, participantCount, members, storyId]);

  // Confetti when unanimous
  useEffect(() => {
    // Only trigger confetti if we have actual votes and unanimous value
    if (!unanimousValue || !votes || votes.length === 0) return;

    let cancelled = false;
    (async () => {
      try {
        const confetti = (await import("canvas-confetti")).default;
        if (cancelled) return;

        // Create curtain effect falling from top
        const duration = 3000;
        const animationEnd = Date.now() + duration;

        const frame = () => {
          if (cancelled || Date.now() > animationEnd) return;

          // Fire confetti from multiple points across the top
          confetti({
            particleCount: 3,
            angle: 90,
            startVelocity: 30,
            spread: 45,
            origin: { x: Math.random(), y: 0 },
            colors: [
              "#6366F1",
              "#22C55E",
              "#EAB308",
              "#F97316",
              "#EF4444",
              "#06B6D4",
              "#A855F7",
            ],
            gravity: 1.2,
            drift: 0,
            ticks: 200,
          });

          requestAnimationFrame(frame);
        };

        frame();
      } catch {
        // no-op if library not installed
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [unanimousValue, storyId, votes]);

  if (votes === undefined) {
    return <Loading />;
  }

  if (votes.length === 0 || chartData.length === 0) {
    return (
      <Card>
        <Title title="No votes recorded yet" />
        <p className="text-sm text-muted-foreground mt-2">
          Deck: {scoringLabel}
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <Title title={endedStory?.title} />
      <p className="text-sm text-muted-foreground">
        Deck: {scoringLabel}
      </p>
      {endedStory?.description && (
        <p className="text-sm text-muted-foreground">
          {endedStory?.description}
        </p>
      )}
      <div className="space-y-4">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={chartConfig[entry.name]?.color || "#8884d8"}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
        <div className="space-y-2">
          <Title title="Summary" />
          <div className="space-y-1 text-sm">
            {unanimousValue ? (
              <div>
                <span className="text-muted-foreground">
                  <>
                    Everyone voted for{" "}
                    <span className="font-semibold text-foreground">
                      {unanimousValue}
                    </span>
                  </>
                </span>
              </div>
            ) : (
              chartData.map((entry) => (
                <div key={entry.name}>
                  <span className="text-muted-foreground">
                    {entry.value === 1 ? (
                      <>
                        1 participant voted for{" "}
                        <span className="font-semibold text-foreground">
                          {entry.name}
                        </span>
                      </>
                    ) : (
                      <>
                        {entry.value} participants voted for{" "}
                        <span className="font-semibold text-foreground">
                          {entry.name}
                        </span>
                      </>
                    )}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
