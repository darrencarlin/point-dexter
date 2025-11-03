"use client";

import * as React from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { Button } from "../ui/button";
import { BASE_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";
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

interface Props {
  onAddStory?: (issue: Story | null) => void;
}

export const IssuesDropdown = ({ onAddStory }: Props) => {
  const [loadingBoards, setLoadingBoards] = React.useState(true);
  const [loadingStories, setLoadingStories] = React.useState(false);
  const [boards, setBoards] = React.useState<Board[]>([]);
  const [stories, setStories] = React.useState<Story[]>([]);
  const [selectedBoardId, setSelectedBoardId] = React.useState<string>("");
  const [selectedKey, setSelectedKey] = React.useState<string>("");
  const [openBoards, setOpenBoards] = React.useState(false);
  const [openIssues, setOpenIssues] = React.useState(false);

  const selectedStory =
    stories?.find((story) => story.key === selectedKey) || null;

  // Fetch boards on mount
  React.useEffect(() => {
    const fetchBoards = async () => {
      setLoadingBoards(true);
      try {
        const res = await fetch(`${BASE_URL}/api/jira/boards`);
        const { boards } = await res.json();
        setBoards(boards || []);
      } catch (error) {
        console.error("Failed to fetch boards:", error);
      } finally {
        setLoadingBoards(false);
      }
    };

    fetchBoards();
  }, []);

  // Fetch stories when board is selected
  React.useEffect(() => {
    if (!selectedBoardId) {
      setStories([]);
      return;
    }

    const fetchStories = async () => {
      setLoadingStories(true);
      setSelectedKey("");
      try {
        const res = await fetch(
          `${BASE_URL}/api/jira/stories?boardId=${selectedBoardId}`
        );
        const { issues } = await res.json();
        setStories(issues || []);
      } catch (error) {
        console.error("Failed to fetch stories:", error);
      } finally {
        setLoadingStories(false);
      }
    };

    fetchStories();
  }, [selectedBoardId]);

  if (loadingBoards) {
    return <div>Loading boards...</div>;
  }

  if (boards?.length === 0) {
    return <div>No boards found.</div>;
  }

  return (
    <div className="space-y-4 mb-6">
      {/* Board Selector (ComboBox) */}
      <div>
        <label className="text-sm font-medium mb-2 block">Select Board</label>
        <Popover open={openBoards} onOpenChange={setOpenBoards}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openBoards}
              className="w-full justify-between"
            >
              {selectedBoardId
                ? (() => {
                    const board = boards.find(
                      (b) => b.id.toString() === selectedBoardId
                    );
                    return board
                      ? `${board.displayName} (${board.projectName})`
                      : "Select board...";
                  })()
                : "Select board..."}
              <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
                        <span className="ml-2 text-xs text-muted-foreground whitespace-nowrap">
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
            <label className="text-sm font-medium mb-2 block">
              Select Issue
            </label>
            {loadingStories ? (
              <div className="text-sm text-muted-foreground">
                Loading issues...
              </div>
            ) : stories?.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No issues found for this board.
              </div>
            ) : (
              <Popover open={openIssues} onOpenChange={setOpenIssues}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openIssues}
                    className="w-full justify-between"
                  >
                    {selectedKey
                      ? (() => {
                          const story = stories.find(
                            (s) => s.key === selectedKey
                          );
                          return story
                            ? `${story.key}: ${story.title}`
                            : "Select issue...";
                        })()
                      : "Select issue..."}
                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
                              setSelectedKey(story.key);
                              setOpenIssues(false);
                            }}
                          >
                            <CheckIcon
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedKey === story.key
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <div className="flex items-center justify-between w-full">
                              <span className="truncate">
                                {story.key}: {story.title}
                              </span>
                              {story.storyPoints !== null && (
                                <span className="ml-2 text-xs text-muted-foreground whitespace-nowrap">
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
            onClick={() => onAddStory?.(selectedStory)}
            disabled={!selectedKey || loadingStories}
            className="self-end"
          >
            Add Story
          </Button>
        </div>
      )}
    </div>
  );
};
