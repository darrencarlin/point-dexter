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
import { Label } from "@radix-ui/react-label";
import { useState, useMemo } from "react";
import { IssuesDropdown, Story } from "../inputs/issues-dropdown";
import { Title } from "../title";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { VotingResultsChart } from "../voting/voting-results-chart";
import { BASE_URL } from "@/lib/constants";

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
    <li className="flex items-center justify-between gap-8 p-4 border rounded-lg">
      <div className="flex flex-col">
        <p className="font-semibold">{story.title}</p>
        <p className="text-sm">{story.description}</p>
      </div>
      <div>
        <div className="mb-2 flex gap-2">
          {/* Show Start Voting if status is "new" or "pending" */}
          {(story.status === "new" || story.status === "pending") && (
            <Button
              disabled={hasVotingStory}
              onClick={() => onStartVoting(story._id)}
            >
              Start Voting
            </Button>
          )}

          {/* Show Stop Voting if status is "voting" */}
          {story.status === "voting" && (
            <Button onClick={() => onStopVoting(story._id)}>Stop Voting</Button>
          )}

          {/* Show Save Points and Input when status is "pending" */}
          {story.status === "pending" && (
            <>
              <Input
                type="number"
                placeholder="Enter points manually"
                value={displayValue}
                onChange={(e) =>
                  setPoints(e.target.value === "" ? "" : Number(e.target.value))
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
    const story = sessionStories?.find((s) => s._id === storyId);

    // Use endVoting mutation to save points and mark as completed
    await endVoting(storyId as Id<"stories">, finalPoints);

    // If story has a jiraKey, update JIRA
    if (story?.jiraKey) {
      try {
        const response = await fetch(
          `${BASE_URL}/api/jira/stories/point/${story.jiraKey}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ points: finalPoints }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          console.error("Failed to update JIRA:", error);
        } else {
          console.log(`Successfully updated JIRA story ${story.jiraKey}`);
        }
      } catch (error) {
        console.error("Error updating JIRA:", error);
      }
    }
  };

  const handleEndSession = async () => {
    if (!session?._id) {
      console.error("Session not found");
      return;
    }

    if (
      !confirm(
        "Are you sure you want to end this session? This will archive all data to long-term storage."
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId: session._id }),
      });

      if (response.ok) {
        alert("Session ended successfully and archived to long-term storage!");
        // Redirect to dashboard
        window.location.href = "/dashboard";
      } else {
        const error = await response.json();
        console.error("Failed to end session:", error);
        alert("Failed to end session: " + (error.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error ending session:", error);
      alert("Error ending session. Please try again.");
    }
  };

  const hasVotingStory = sessionStories?.some(
    (story) => story.status === "voting"
  );

  const endedStoryForChart = useEndedStory(id as Id<"sessions">);

  return (
    <div>
      <Title
        title="Admin Controlled Panel"
        subtitle="Admin actions will go here"
      />

      {!manual && <IssuesDropdown onAddStory={handleAddStory} />}
      {!manual && (
        <Button type="button" className="mb-6" onClick={() => setManual(true)}>
          Add Story Manually
        </Button>
      )}
      {manual && (
        <form className="mb-8 space-y-4">
          <div>
            <Label htmlFor="title" className="mb-2">
              Title
            </Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {error && <p>{error}</p>}
          <Button
            type="button"
            disabled={loading}
            onClick={() => handleAddStory(null)}
          >
            {loading ? "Adding story..." : "Add Story"}
          </Button>
        </form>
      )}

      <div>
        <Button className="mb-6" onClick={() => setManual(false)}>
          Back to Issue Selector
        </Button>
      </div>

      {/* Show voting results chart above Active Stories if there's a story with votes */}
      {endedStoryForChart && (
        <div className="mb-8">
          <VotingResultsChart storyId={endedStoryForChart._id} />
        </div>
      )}

      <div>
        <p className="mb-2 font-bold">Active Stories</p>
        <ul className="mb-6 space-y-2">
          {sessionStories
            ?.filter((story) => story.status !== "completed")
            .map((story) => (
              <StoryItem
                key={story._id}
                story={story}
                hasVotingStory={hasVotingStory ?? false}
                onStartVoting={handleStartVoting}
                onStopVoting={handleStopVoting}
                onCompleteStory={handleCompleteStory}
              />
            ))}
        </ul>
      </div>

      <div>
        <p className="mb-2 font-bold">Finished Stories</p>
        <ul className="mb-6 space-y-2">
          {sessionStories
            ?.filter((story) => story.status === "completed")
            .map((story) => (
              <li
                key={story._id}
                className="flex items-center justify-between gap-8 p-4 border rounded-lg"
              >
                <div className="flex flex-col">
                  <p className="font-semibold">{story.title}</p>
                  <p className="text-sm">{story.description}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {story.points > 0 ? `${story.points} points` : "Completed"}
                  </p>
                </div>
              </li>
            ))}
        </ul>
      </div>

      <div>
        <Button variant="destructive" onClick={handleEndSession}>
          End Session
        </Button>
      </div>
    </div>
  );
};
