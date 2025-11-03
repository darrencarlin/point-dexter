"use client";

import { Id } from "@/convex/_generated/dataModel";
import { useGetStoryVotes } from "@/lib/hooks/convex/votes";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Cell, Pie, PieChart } from "recharts";
import { Loading } from "@/components/loading";
import { useMemo } from "react";

interface Props {
  storyId: Id<"stories"> | undefined;
}

/**
 * Voting results chart component that displays vote distribution using a pie chart
 * @param {Props} props - Component properties
 * @returns {JSX.Element} Rendered chart component
 */
export function VotingResultsChart({ storyId }: Props) {
  const votes = useGetStoryVotes(storyId);

  // Transform votes into chart data format
  const chartData = useMemo(() => {
    if (!votes || votes.length === 0) {
      return [];
    }

    // Count votes by point value
    const voteCounts: Record<string, number> = {};
    votes.forEach((vote) => {
      const key = String(vote.points);
      voteCounts[key] = (voteCounts[key] || 0) + 1;
    });

    // Standard voting options (Fibonacci sequence + question mark)
    const votingOptions: (number | string)[] = [1, 2, 3, 5, 8, 13, 21, "?"];

    // Create chart data points - only include options with votes
    const data = votingOptions
      .filter((option) => voteCounts[String(option)] > 0)
      .map((option) => ({
        name: String(option),
        value: voteCounts[String(option)],
      }));

    return data;
  }, [votes]);

  // Explicit, high-contrast palette per option (previous working version)
  const chartConfig: Record<string, { label: string; color: string }> = {
    "1": { label: "1", color: "#6366F1" },   // indigo-500
    "2": { label: "2", color: "#22C55E" },   // green-500
    "3": { label: "3", color: "#EAB308" },   // yellow-500
    "5": { label: "5", color: "#F97316" },   // orange-500
    "8": { label: "8", color: "#EF4444" },   // red-500
    "13": { label: "13", color: "#06B6D4" }, // cyan-500
    "21": { label: "21", color: "#A855F7" }, // purple-500
    "?": { label: "?", color: "#94A3B8" },   // slate-400
  };

  if (votes === undefined) {
    return <Loading />;
  }

  if (votes.length === 0 || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No votes recorded yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            strokeWidth={5}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={chartConfig[entry.name]?.color || "#8884d8"}
              />
            ))}
          </Pie>
          <ChartLegend content={<ChartLegendContent nameKey="name" />} className="-bottom-6" />
        </PieChart>
      </ChartContainer>
      <div className="space-y-2">
        <p className="text-sm font-medium">Summary</p>
        <div className="space-y-1 text-sm">
          {chartData.map((entry) => (
            <div key={entry.name}>
              <span className="text-muted-foreground">
                {entry.value === 1 ? (
                  <>1 participant voted for <span className="font-semibold text-foreground">{entry.name}</span></>
                ) : (
                  <>{entry.value} participants voted for <span className="font-semibold text-foreground">{entry.name}</span></>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
