import { useAtomValue } from "jotai";
import { storyIdAtom } from "@/lib/state";
import { useGetStoryVotes as useGetStoryVotesBase } from "./convex/use-votes";

/**
 * Hook that gets the story ID from the atom
 */
export function useStoryId() {
  return useAtomValue(storyIdAtom);
}

/**
 * Hook that gets story votes using the story ID from the atom
 */
export function useGetStoryVotes() {
  const storyId = useStoryId();
  return useGetStoryVotesBase(storyId);
}
