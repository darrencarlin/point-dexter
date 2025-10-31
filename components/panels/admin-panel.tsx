import {
  useAddStory,
  useEndVoting,
  useGetSessionStories,
  useToggleStoryActive,
} from "@/lib/hooks/convex/stories";
import { Title } from "../title";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";
import { useState } from "react";
import { Button } from "../ui/button";
import { useGetSession } from "@/lib/hooks/convex/sessions";
import { Id } from "@/convex/_generated/dataModel";

interface Props {
  id: string;
}

export const AdminPanel = ({ id }: Props) => {
  const addStory = useAddStory();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const session = useGetSession(id as Id<"sessions">);
  const sessionStories = useGetSessionStories(id as Id<"sessions">);
  const toggleStoryActive = useToggleStoryActive();
  const endVoting = useEndVoting();

  const handleAddStory = async () => {
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

    try {
      await addStory({ title, description, sessionId: session?._id });
      setTitle("");
      setDescription("");
    } catch (error) {
      console.error("Failed to add story:", error);
      setError("Failed to add story");
    } finally {
      setLoading(false);
    }
  };

  const handleStartVoting = (id: string) => {
    toggleStoryActive(id as Id<"stories">, true);
  };
  const handleEndVoting = (id: string) => {
    endVoting(id as Id<"stories">);
  };

  const hasActiveStory = sessionStories?.some((story) => story.isActive);

  return (
    <div>
      <Title
        title="Admin Controlled Panel"
        subtitle="Admin actions will go here"
      />

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

        <div>
          <Label htmlFor="description" className="mb-2">
            Description
          </Label>
          <Input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {error && <p>{error}</p>}
        <Button type="button" disabled={loading} onClick={handleAddStory}>
          {loading ? "Adding story..." : "Add Story"}
        </Button>
      </form>
      <div>
        <p className="mb-2 font-bold">Active Stories</p>
        <ul className="mb-6 space-y-2">
          {sessionStories
            ?.filter((story) => !story.isFinished)
            .map((story) => (
              <li
                key={story._id}
                className="flex items-center justify-between p-4 border rounded-lg gap-8"
              >
                <div className="flex flex-col">
                  <p className="font-semibold">{story.title}</p>
                  <p className="text-sm">{story.description}</p>
                </div>
                <div>
                  {story.isActive ? (
                    <Button onClick={() => handleEndVoting(story._id)}>
                      End Voting
                    </Button>
                  ) : (
                    <Button
                      disabled={hasActiveStory}
                      onClick={() => handleStartVoting(story._id)}
                    >
                      Start Voting
                    </Button>
                  )}
                </div>
              </li>
            ))}
        </ul>
      </div>

      <div>
        <p className="mb-2 font-bold">Finished Stories</p>
        <ul className="mb-6 space-y-2">
          {sessionStories
            ?.filter((story) => !story.isActive && story.isFinished)
            .map((story) => (
              <li
                key={story._id}
                className="flex items-center justify-between p-4 border rounded-lg gap-8"
              >
                <div className="flex flex-col">
                  <p className="font-semibold">{story.title}</p>
                  <p className="text-sm">{story.description}</p>
                </div>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};
