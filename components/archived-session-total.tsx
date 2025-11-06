interface Story {
  status: string | null;
  points: number;
}

interface ArchivedSessionTotalProps {
  stories: Story[];
}

export const ArchivedSessionTotal = ({
  stories,
}: ArchivedSessionTotalProps) => {
  const completedStories = stories.filter(
    (story) => story.status === "completed"
  );

  const totalPoints = completedStories.reduce((sum, story) => {
    return sum + (story.points ?? 0);
  }, 0);

  if (completedStories.length === 0) {
    return null;
  }

  return <p className="text-sm">({totalPoints} points)</p>;
};
