import { Id } from "@/convex/_generated/dataModel";
import { useGetSession } from "@/lib/hooks/convex/sessions";
import {
  useAddStory,
  useEndVoting,
  useGetSessionStories,
  useToggleStoryStatus,
} from "@/lib/hooks/convex/stories";
import { useEndedStory } from "@/lib/hooks/convex/use-ended-story";
import { useGetStoryVotes } from "@/lib/hooks/convex/votes";
import { jiraSiteUrlAtom } from "@/lib/state";
import { useAtomValue } from "jotai";
import { Label } from "@radix-ui/react-label";
import { useMemo, useState } from "react";
import { Card } from "../card";
import { IssuesDropdown, Story } from "../inputs/issues-dropdown";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { VotingResultsChart } from "../voting/voting-results-chart";

interface Props {
  id: string;
}

// Helper component to handle individual story logic with votes
const StoryItem = ({
  story,
  hasVotingStory,
  onStartVoting,
  onStopVoting,
  onCompleteStory,
}: {
  story: {
    _id: Id<"stories">;
    title: string;
    description?: string;
    status?: "new" | "voting" | "pending" | "completed";
    jiraKey?: string;
  };
  hasVotingStory: boolean;
  onStartVoting: (id: string) => void;
  onStopVoting: (id: string) => void;
  onCompleteStory: (id: string, points: number) => void;
}) => {
  const votes = useGetStoryVotes(story._id);
  const [points, setPoints] = useState<number | "">("");
  const jiraSiteUrl = useAtomValue(jiraSiteUrlAtom);

  // Helper function to calculate consensus
  const calculateConsensus = (votes: Array<{ points: number | string }>) => {
    if (!votes || votes.length === 0) return null;

    // Convert all votes to numbers (ignore "?" votes and invalid values)
    const numericVotes = votes
      .map((v) =>
        typeof v.points === "number" && v.points > 0 ? v.points : null
      )
      .filter((v) => v !== null) as number[];

    if (numericVotes.length === 0) return null;

    // Count occurrences of each vote
    const voteCounts: { [key: number]: number } = {};
    numericVotes.forEach((vote) => {
      voteCounts[vote] = (voteCounts[vote] || 0) + 1;
    });

    // Check if everyone voted the same
    if (Object.keys(voteCounts).length === 1) {
      return numericVotes[0];
    }

    // Find the majority vote
    const maxCount = Math.max(...Object.values(voteCounts));
    const majorities = Object.entries(voteCounts)
      .filter(([, count]) => count === maxCount)
      .map(([vote]) => Number(vote));

    // If there's a single majority, return it
    if (majorities.length === 1) {
      return majorities[0];
    }

    // Even split - return null to leave blank
    return null;
  };

  // Calculate consensus value from votes
  const consensusPoints = useMemo(() => {
    if (story.status === "pending" && votes && votes.length > 0) {
      return calculateConsensus(votes);
    }
    return null;
  }, [story.status, votes]);

  // Display value: use user input if changed, otherwise use consensus
  const displayValue = points !== "" ? points : (consensusPoints ?? "");

  return (
    <li>
      <Card className="flex items-center justify-between">
        <div className="flex flex-col">
          <p className="font-semibold">{story.title}</p>
          {story.jiraKey && (
            <a
              href={`${jiraSiteUrl}/browse/${story.jiraKey}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline"
            >
              View in Jira
            </a>
          )}
          <p className="text-sm">{story.description}</p>
        </div>
        <div>
          <div className="flex items-center gap-2">
            {/* Show Start Voting if status is "new" */}
            {story.status === "new" && (
              <Button
                disabled={hasVotingStory}
                onClick={() => onStartVoting(story._id)}
                variant="start"
              >
                Start Voting
              </Button>
            )}

            {/* Show Resume Voting if status is "pending" (paused) */}
            {story.status === "pending" && (
              <Button onClick={() => onStartVoting(story._id)} variant="start">
                Resume Voting
              </Button>
            )}

            {/* Show Stop Voting if status is "voting" */}
            {story.status === "voting" && (
              <Button
                onClick={() => onStopVoting(story._id)}
                variant="destructive"
              >
                Stop Voting
              </Button>
            )}

            {/* Show Save Points and Input when status is "pending" */}
            {story.status === "pending" && (
              <>
                <Input
                  className="w-32"
                  type="number"
                  placeholder="Points"
                  value={displayValue}
                  onChange={(e) =>
                    setPoints(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                />
                <Button
                  onClick={() => {
                    const finalPoints =
                      points !== "" ? points : (consensusPoints ?? 0);
                    onCompleteStory(
                      story._id,
                      typeof finalPoints === "number" ? finalPoints : 0
                    );
                  }}
                  disabled={displayValue === ""}
                >
                  Save Points
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    </li>
  );
};

export const AdminPanel = ({ id }: Props) => {
  const addStory = useAddStory();
  const [title, setTitle] = useState("");
  const [manual, setManual] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const session = useGetSession(id as Id<"sessions">);
  const sessionStories = useGetSessionStories(id as Id<"sessions">);
  const toggleStoryStatus = useToggleStoryStatus();
  const endVoting = useEndVoting();

  const handleAddManualStory = () => {
    setLoading(true);
    setError("");

    if (!title) {
      setError("Title is required");
      setLoading(false);
      return;
    }

    if (!session?._id) {
      setError("Session not found");
      setLoading(false);
      return;
    }

    addStory({ title, sessionId: session?._id })
      .then(() => setTitle(""))
      .catch((error) => {
        console.error("Failed to add story:", error);
        setError("Failed to add story");
      })
      .finally(() => setLoading(false));
  };

  const handleAddJiraStory = (story: Story | null) => {
    setLoading(true);
    setError("");

    if (!story) {
      setError("No Jira story selected");
      setLoading(false);
      return;
    }

    if (!session?._id) {
      setError("Session not found");
      setLoading(false);
      return;
    }

    addStory({
      title: `${story.key}: ${story.title}`,
      sessionId: session?._id,
      jiraKey: story.key, // Store the JIRA key
    })
      .catch((error) => {
        console.error("Failed to add Jira story:", error);
        setError("Failed to add Jira story");
      })
      .finally(() => setLoading(false));
  };

  const handleAddStory = (story: Story | null) => {
    if (manual) {
      handleAddManualStory();
    } else {
      handleAddJiraStory(story);
    }
  };

  const handleStartVoting = (id: string) => {
    toggleStoryStatus(id as Id<"stories">, "voting");
  };

  const handleStopVoting = async (storyId: string) => {
    // Stop voting - this will trigger the useMemo in StoryItem to calculate consensus
    await toggleStoryStatus(storyId as Id<"stories">, "pending");
  };

  const handleCompleteStory = async (storyId: string, finalPoints: number) => {
    console.log("Completing story with points:", finalPoints);

    // Find the story to get its jiraKey
    // const story = sessionStories?.find((s) => s._id === storyId);

    // Use endVoting mutation to save points and mark as completed
    await endVoting(storyId as Id<"stories">, finalPoints);

    // This is comment out for now, theres a setting in JIRA that is different for each instance
    // which means it may not be applicable to everyone
    // If story has a jiraKey, update JIRA
    // if (story?.jiraKey) {
    //   try {
    //     const response = await fetch(
    //       `${BASE_URL}/api/jira/stories/point/${story.jiraKey}`,
    //       {
    //         method: "PATCH",
    //         headers: {
    //           "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({ points: finalPoints }),
    //       }
    //     );

    //     if (!response.ok) {
    //       const error = await response.json();
    //       console.error("Failed to update JIRA:", error);
    //     } else {
    //       console.log(`Successfully updated JIRA story ${story.jiraKey}`);
    //     }
    //   } catch (error) {
    //     console.error("Error updating JIRA:", error);
    //   }
    // }
  };

  // Check if there's any story currently in voting status OR any story in pending status
  // Only allow starting one story at a time (either voting or pending should block others)
  const hasActiveStory = sessionStories?.some(
    (story) => story.status === "voting" || story.status === "pending"
  );

  const endedStoryForChart = useEndedStory(id as Id<"sessions">);

  return (
    <>
      {/* Board/Story Selection Section */}
      <Card className="shrink-0">
        {!manual && <IssuesDropdown onAddStory={handleAddStory} />}
        {!manual && (
          <Button
            variant="secondary"
            type="button"
            className="mb-6"
            onClick={() => setManual(true)}
          >
            Add Story Manually
          </Button>
        )}
        {manual && (
          <form className="mb-4 space-y-4">
            <div className="flex items-end gap-2">
              <div className="w-full">
                <Label htmlFor="title">
                  <h2 className="mb-4 text-2xl font-bold">Story Title</h2>
                </Label>
                <Input
                  className="flex-1"
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />

                {error && <p>{error}</p>}
              </div>
              <Button
                type="button"
                disabled={loading}
                onClick={() => handleAddStory(null)}
              >
                {loading ? "Adding story..." : "Add Story"}
              </Button>
            </div>
          </form>
        )}

        {manual && (
          <Button
            variant="secondary"
            type="button"
            className="mb-6"
            onClick={() => setManual(false)}
          >
            Back to Issue Selector
          </Button>
        )}
      </Card>

      {/* Stories Tabs Section */}
      <Card className="flex flex-col flex-1 min-h-0 shrink-0">
        <Tabs defaultValue="active" className="flex flex-col flex-1 min-h-0">
          <TabsList className="mb-4">
            <TabsTrigger value="active">Active Stories</TabsTrigger>
            <TabsTrigger value="finished">Finished Stories</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="flex flex-col flex-1 min-h-0">
            {sessionStories?.filter((story) => story.status !== "completed")
              .length === 0 ? (
              <p className="text-muted-foreground">No active stories</p>
            ) : (
              <ul className="space-y-2">
                {sessionStories
                  ?.filter((story) => story.status !== "completed")
                  .map((story) => {
                    // Check if THIS story is the active one (voting or pending)
                    const isThisStoryActive =
                      story.status === "voting" || story.status === "pending";

                    return (
                      <StoryItem
                        key={story._id}
                        story={story}
                        hasVotingStory={
                          isThisStoryActive ? false : (hasActiveStory ?? false)
                        }
                        onStartVoting={handleStartVoting}
                        onStopVoting={handleStopVoting}
                        onCompleteStory={handleCompleteStory}
                      />
                    );
                  })}
              </ul>
            )}
          </TabsContent>

          <TabsContent
            value="finished"
            className="flex flex-col flex-1 min-h-0"
          >
            {sessionStories?.filter((story) => story.status === "completed")
              .length === 0 ? (
              <p className="text-muted-foreground">No finished stories</p>
            ) : (
              <ul className="space-y-2">
                {sessionStories
                  ?.filter((story) => story.status === "completed")
                  .map((story) => (
                    <li key={story._id}>
                      <Card className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <p className="font-semibold">{story.title}</p>
                          <p className="text-sm">{story.description}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {story.points && story.points > 0
                              ? `${story.points} points`
                              : "Completed"}
                          </p>
                        </div>
                      </Card>
                    </li>
                  ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      </Card>

      {/* Show voting results chart if there's a story with votes */}
      {endedStoryForChart && (
        <VotingResultsChart
          storyId={endedStoryForChart._id}
          sessionId={id as Id<"sessions">}
        />
      )}
    </>
  );
};
