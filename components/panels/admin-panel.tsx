import {
  useAddStory,
  useEndVoting,
  useGetSessionStories,
  useToggleStoryStatus,
} from "@/lib/hooks/convex/stories";
import { Title } from "../title";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";
import { useState } from "react";
import { Button } from "../ui/button";
import { useGetSession } from "@/lib/hooks/convex/sessions";
import { Id } from "@/convex/_generated/dataModel";
import { IssuesDropdown, Story } from "../inputs/issues-dropdown";

interface Props {
  id: string;
}

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

    addStory({ title: story.title, sessionId: session?._id })
      .catch((error) => {
        console.error("Failed to add Jira story:", error);
        setError("Failed to add Jira story");
      })
      .finally(() => setLoading(false));
  };

  const handleAddStory = (story: Story | null) => {
    console.log("Adding story:", story, manual);
    if (manual) {
      handleAddManualStory();
    } else {
      handleAddJiraStory(story);
    }
  };

  const handleStartVoting = (id: string) => {
    toggleStoryStatus(id as Id<"stories">, "voting");
  };
  const handleStopVoting = (id: string) => {
    toggleStoryStatus(id as Id<"stories">, "pending");
  };

  const handleCompleteStory = (id: string) => {
    toggleStoryStatus(id as Id<"stories">, "completed");
  };

  const hasVotingStory = sessionStories?.some(
    (story) => story.status === "voting"
  );

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

      <div>
        <p className="mb-2 font-bold">Active Stories</p>
        <ul className="mb-6 space-y-2">
          {sessionStories
            ?.filter((story) => story.status !== "completed")
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
                  <div className="mb-2 flex gap-2">
                    {/* Show Start Voting if status is "new" or "pending" */}
                    {(story.status === "new" || story.status === "pending") && (
                      <Button
                        disabled={hasVotingStory}
                        onClick={() => handleStartVoting(story._id)}
                      >
                        Start Voting
                      </Button>
                    )}

                    {/* Show Stop Voting if status is "voting" */}
                    {story.status === "voting" && (
                      <Button onClick={() => handleStopVoting(story._id)}>
                        Stop Voting
                      </Button>
                    )}

                    {/* Show Save Points and Input when status is "pending" */}
                    {story.status === "pending" && (
                      <>
                        <Input placeholder="Enter points manually" />
                        <Button onClick={() => handleCompleteStory(story._id)}>
                          Save Points
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </li>
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
                  <p>Points</p>
                </div>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};
