import { ScoringType } from "../types";

type ScoringOption = number | "?";

interface ScoringConfig {
  label: string;
  description?: string;
  options: ScoringOption[];
}

export const SCORING_CONFIGS: Record<ScoringType, ScoringConfig> = {
  fibonacci: {
    label: "Fibonacci",
    description: "Classic Fibonacci sequence for Planning Poker sessions.",
    options: [1, 2, 3, 5, 8, 13, 21, 34, "?"],
  },
  modified_fibonacci: {
    label: "Modified Fibonacci",
    description: "Fibonacci with additional stops for medium stories.",
    options: [1, 2, 3, 4, 5, 8, 13, 20, 40, 100, "?"],
  },
  powers_of_two: {
    label: "Powers of 2",
    description: "Binary-style growth to emphasise exponential effort.",
    options: [1, 2, 4, 8, 16, 32, 64],
  },
  linear_scale: {
    label: "Linear Scale",
    description: "Simple linear increments ideal for small tasks.",
    options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
  scale_1_10: {
    label: "Scale 1–10",
    description: "Rate effort from 1 to 10 for quick consensus.",
    options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
  bucket_system: {
    label: "Bucket System",
    description: "Numeric buckets representing XS to XL story sizes.",
    options: [1, 2, 3, 4, 5],
  },
};

export const DEFAULT_SCORING_TYPE: ScoringType = "fibonacci";

const LEGACY_SCORING_MAP: Record<string, ScoringType> = {
  planning_poker: "fibonacci",
  ideal_days: "linear_scale",
  affinity_estimation: "bucket_system",
  no_estimates: "linear_scale",
  team_velocity: "powers_of_two",
};

export const SCORING_SELECT_OPTIONS = Object.entries(SCORING_CONFIGS).map(
  ([value, config]) => ({
    value: value as ScoringType,
    label: config.label,
  })
);

export function normalizeScoringType(
  value: string | null | undefined
): ScoringType {
  if (!value) return DEFAULT_SCORING_TYPE;
  if (value in SCORING_CONFIGS) {
    return value as ScoringType;
  }
  if (value in LEGACY_SCORING_MAP) {
    return LEGACY_SCORING_MAP[value];
  }
  return DEFAULT_SCORING_TYPE;
}

export function getScoringLabel(scoringType: ScoringType): string {
  return (
    SCORING_CONFIGS[scoringType]?.label ??
    SCORING_CONFIGS[DEFAULT_SCORING_TYPE].label
  );
}

export function getScoringOptions(scoringType: ScoringType): ScoringOption[] {
  return (
    SCORING_CONFIGS[scoringType]?.options ??
    SCORING_CONFIGS[DEFAULT_SCORING_TYPE].options
  );
}
