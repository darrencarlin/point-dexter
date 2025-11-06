import { Id } from "@/convex/_generated/dataModel";
import { useGetSessionStories } from "@/lib/hooks/convex/use-stories";

interface Props {
  id: string;
}

export const Total = ({ id }: Props) => {
  const stories = useGetSessionStories(id as Id<"sessions">);

  if (!stories) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  const completedStories = stories.filter(
    (story) => story.status === "completed"
  );

  const totalPoints = completedStories.reduce((sum, story) => {
    return sum + (story.points ?? 0);
  }, 0);

  const storyText = completedStories.length === 1 ? "story" : "stories";

  if (completedStories.length === 0) {
    return null;
  }

  return (
    <p className="text-sm">
      {completedStories.length} {storyText} completed ({totalPoints} points)
    </p>
  );
};
