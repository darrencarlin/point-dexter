import { ScoringType } from "../types";

type ScoringConfig = {
  label: string;
  description?: string;
  options: (number | string)[];
};

export const SCORING_CONFIGS: Record<ScoringType, ScoringConfig> = {
  planning_poker: {
    label: "Planning Poker (Fibonacci)",
    description: "Classic Fibonacci sequence with a question mark for unsure estimates.",
    options: [0, 1, 2, 3, 5, 8, 13, 21, "?"],
  },
  ideal_days: {
    label: "Ideal Days / Hours",
    description: "Estimate effort in ideal day or hour increments.",
    options: [0.5, 1, 2, 3, 4, 5, 6, 7, 8, "?"],
  },
  bucket_system: {
    label: "Bucket System",
    description: "Categorise work into t-shirt sized buckets.",
    options: ["XS", "S", "M", "L", "XL"],
  },
  affinity_estimation: {
    label: "Affinity Estimation",
    description: "Rank work by relative size using affinity buckets.",
    options: ["Very Small", "Small", "Medium", "Large", "Very Large"],
  },
  no_estimates: {
    label: "No Estimates",
    description: "Skip pointing to emphasise conversation over numbers.",
    options: ["No Estimate"],
  },
  team_velocity: {
    label: "Team Velocity",
    description: "Track expected throughput per sprint.",
    options: [10, 20, 30, 40, 50, 60, 70, 80],
  },
};

export const DEFAULT_SCORING_TYPE: ScoringType = "planning_poker";

export const SCORING_SELECT_OPTIONS = Object.entries(SCORING_CONFIGS).map(
  ([value, config]) => ({
    value: value as ScoringType,
    label: config.label,
  })
);

export function getScoringLabel(scoringType: ScoringType): string {
  return SCORING_CONFIGS[scoringType]?.label ?? SCORING_CONFIGS.planning_poker.label;
}

export function getScoringOptions(scoringType: ScoringType): (number | string)[] {
  return SCORING_CONFIGS[scoringType]?.options ?? SCORING_CONFIGS.planning_poker.options;
}

