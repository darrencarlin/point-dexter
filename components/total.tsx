import { useGetSessionStories } from "@/lib/hooks/use-session-hooks";

export const Total = () => {
  const stories = useGetSessionStories();

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
