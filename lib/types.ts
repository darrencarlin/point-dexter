export type ScoringType =
  | "planning_poker"
  | "ideal_days"
  | "bucket_system"
  | "affinity_estimation"
  | "no_estimates"
  | "team_velocity";

export interface Settings {
  timedVoting: boolean;
  votingTimeLimit: number;
  scoringType: ScoringType;
}

export type UserSettings = Settings | null;
