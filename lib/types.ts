export type ScoringType =
  | "fibonacci"
  | "modified_fibonacci"
  | "powers_of_two"
  | "linear_scale"
  | "scale_1_10"
  | "bucket_system";

export interface Settings {
  timedVoting: boolean;
  votingTimeLimit: number;
  scoringType: ScoringType;
}

export type UserSettings = Settings | null;
