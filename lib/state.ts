import { Id } from "@/convex/_generated/dataModel";
import { atom } from "jotai";

export const sessionAtom = atom<string | null>(null);

// Jira boards and stories state
export interface Story {
  id: string;
  key: string;
  title: string;
  storyPoints: number | null;
  status: string;
}

export interface Board {
  id: number;
  displayName: string;
  projectName: string;
  type: string;
  projectKey: string | null;
}

export const jiraBoardsAtom = atom<Board[]>([]);
export const jiraStoriesAtom = atom<Record<string, Story[]>>({});

// Selected board and issue state
export const selectedBoardIdAtom = atom<string>("");
export const selectedIssueKeyAtom = atom<string>("");

// Jira site instance URL
export const jiraSiteUrlAtom = atom<string>("");

// ID's
export const sessionIdAtom = atom<Id<"sessions">>();
export const storyIdAtom = atom<Id<"stories">>();
