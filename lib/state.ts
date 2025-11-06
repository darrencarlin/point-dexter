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
export const selectedIssuesSetAtom = atom<Set<string>>(new Set([]));

// Jira site instance URL
export const jiraSiteUrlAtom = atom<string>("");

// Session ID
export const sessionIdAtom = atom<Id<"sessions">>();
