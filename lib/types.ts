export interface Settings {
  timedVoting?: boolean;
  votingTimeLimit?: number;
}

export type UserSettings = Settings | null;
