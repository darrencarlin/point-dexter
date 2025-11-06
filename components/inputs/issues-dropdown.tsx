"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BASE_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  CheckIcon,
  ChevronsUpDownIcon,
  RefreshCw,
  Square,
} from "lucide-react";
import * as React from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { useAtom } from "jotai";
import {
  jiraBoardsAtom,
  jiraStoriesAtom,
  selectedBoardIdAtom,
  selectedIssuesSetAtom,
  type Story,
} from "@/lib/state";

// Re-export types for backwards compatibility
export type { Story, Board } from "@/lib/state";

interface Props {
  onAddStory?: (issue: Story | null) => void;
}

export const IssuesDropdown = ({ onAddStory }: Props) => {
  const [loadingBoards, setLoadingBoards] = React.useState(false);
  const [loadingStories, setLoadingStories] = React.useState(false);
  const [boards, setBoards] = useAtom(jiraBoardsAtom);
  const [storiesMap, setStoriesMap] = useAtom(jiraStoriesAtom);
  const [selectedBoardId, setSelectedBoardId] = useAtom(selectedBoardIdAtom);
  const [selectedIssuesSet, setSelectedIssuesSet] = useAtom(selectedIssuesSetAtom);
  const [openBoards, setOpenBoards] = React.useState(false);
  const [openIssues, setOpenIssues] = React.useState(false);

  const stories = selectedBoardId ? storiesMap[selectedBoardId] || [] : [];
  const selectedStories =
    stories?.filter((story) => selectedIssuesSet.has(story.key)) || [];

  // Fetch boards function
  const fetchBoards = React.useCallback(async () => {
    setLoadingBoards(true);
    try {
      const res = await fetch(`${BASE_URL}/api/jira/boards`);
      if (!res.ok) {
        setBoards([]);
        return;
      }
      const data = await res.json();
      setBoards(data?.boards || []);
    } catch (error) {
      console.error("Failed to fetch boards:", error);
      setBoards([]);
    } finally {
      setLoadingBoards(false);
    }
  }, [setBoards]);

  // Fetch boards on mount only if not already loaded
  React.useEffect(() => {
    if (boards.length === 0) {
      fetchBoards();
    }
  }, [boards.length, fetchBoards]);

  // Fetch stories function
  const fetchStories = React.useCallback(
    async (boardId: string) => {
      setLoadingStories(true);
      setSelectedIssuesSet(new Set());
      try {
        const res = await fetch(
          `${BASE_URL}/api/jira/stories?boardId=${boardId}`
        );
        if (!res.ok) {
          setStoriesMap((prev) => ({ ...prev, [boardId]: [] }));
          return;
        }
        const data = await res.json();
        setStoriesMap((prev) => ({
          ...prev,
          [boardId]: data?.issues || [],
        }));
      } catch (error) {
        console.error("Failed to fetch stories:", error);
        setStoriesMap((prev) => ({ ...prev, [boardId]: [] }));
      } finally {
        setLoadingStories(false);
      }
    },
    [setStoriesMap, setSelectedIssuesSet]
  );

  // Fetch stories when board is selected (only if not already loaded)
  React.useEffect(() => {
    if (!selectedBoardId) {
      return;
    }

    if (!storiesMap[selectedBoardId]) {
      fetchStories(selectedBoardId);
    }
  }, [selectedBoardId, storiesMap, fetchStories]);

  return (
    <div className="mb-4 space-y-4">
      {/* Board Selector (ComboBox) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Label>
            <h2 className="text-2xl font-bold">
              Choose Stories for Estimation
            </h2>
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={fetchBoards}
            disabled={loadingBoards}
            title="Refresh boards"
          >
            <RefreshCw
              className={cn("h-4 w-4", loadingBoards && "animate-spin")}
            />
          </Button>
        </div>
        <Popover open={openBoards} onOpenChange={setOpenBoards}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openBoards}
              className="justify-between w-full"
              disabled={loadingBoards}
            >
              {loadingBoards
                ? "Loading boards..."
                : selectedBoardId
                  ? (() => {
                      const board = boards.find(
                        (b) => b.id.toString() === selectedBoardId
                      );
                      return board
                        ? `${board.displayName} (${board.projectName})`
                        : "Select board...";
                    })()
                  : boards?.length === 0
                    ? "No boards found"
                    : "Select board..."}
              <ChevronsUpDownIcon className="w-4 h-4 ml-2 opacity-50 shrink-0" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[600px] p-0">
            <Command>
              <CommandInput placeholder="Search boards..." />
              <CommandList>
                <CommandEmpty>No board found.</CommandEmpty>
                <CommandGroup>
                  {boards.map((board) => (
                    <CommandItem
                      key={board.id}
                      value={`${board.displayName} ${board.projectName}`}
                      onSelect={() => {
                        setSelectedBoardId(board.id.toString());
                        setOpenBoards(false);
                      }}
                    >
                      <CheckIcon
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedBoardId === board.id.toString()
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <div className="flex items-center justify-between w-full">
                        <span className="truncate">{board.displayName}</span>
                        <span className="ml-2 whitespace-nowrap">
                          {board.projectName}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Issue Selector (ComboBox) */}
      {selectedBoardId && (
        <div className="flex gap-2">
          <div className="flex-1">
            {loadingStories ? (
              <div className="p-2">Loading issues...</div>
            ) : stories?.length === 0 ? (
              <div className="p-2">No issues found for this board.</div>
            ) : (
              <Popover open={openIssues} onOpenChange={setOpenIssues}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openIssues}
                    className="justify-between w-full"
                  >
                    {selectedIssuesSet.size > 0
                      ? selectedIssuesSet.size === 1
                        ? (() => {
                            const story = stories.find(
                              (s) => selectedIssuesSet.has(s.key)
                            );
                            return story
                              ? `${story.key}: ${story.title}`
                              : "Select issue...";
                          })()
                        : `${selectedIssuesSet.size} stories selected`
                      : "Select issue..."}
                    <ChevronsUpDownIcon className="w-4 h-4 ml-2 opacity-50 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[600px] p-0">
                  <Command>
                    <CommandInput placeholder="Search issues..." />
                    <CommandList>
                      <CommandEmpty>No issue found.</CommandEmpty>
                      <CommandGroup>
                        {stories.map((story) => (
                          <CommandItem
                            key={story.id}
                            value={`${story.key} ${story.title}`}
                            onSelect={() => {
                              if (selectedIssuesSet.has(story.key)) {
                                setSelectedIssuesSet((prev) => {
                                  const newSet = new Set(prev);
                                  newSet.delete(story.key);
                                  return newSet;
                                });
                                return;
                              }

                              setSelectedIssuesSet((prev) => new Set(prev).add(story.key));
                            }}
                          >
                            { selectedIssuesSet.has(story.key)
                              ? (
                                <CheckIcon className={cn("mr-2 h-4 w-4")} />
                              ) : (
                                <Square className={cn("mr-2 h-4 w-4")} />
                              )
                            }

                            <div className="flex items-center justify-between w-full">
                              <span className="truncate">
                                {story.key}: {story.title}
                              </span>
                              {story.storyPoints !== null && (
                                <span className="ml-2 whitespace-nowrap">
                                  {story.storyPoints} SP
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          </div>
          <Button
            type="button"
            onClick={() => {
              selectedStories.forEach((story) => {
                onAddStory?.(story)
              });
              // Clear selection after adding
              setSelectedIssuesSet(new Set());
            }}
            disabled={selectedStories.length === 0 || loadingStories}
            className="self-end"
          >
            { selectedStories.length > 1
              ? `Add ${selectedStories.length} Stories`
              : "Add Story"
            }
          </Button>
        </div>
      )}
    </div>
  );
};
