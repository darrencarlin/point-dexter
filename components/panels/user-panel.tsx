import { Id } from "@/convex/_generated/dataModel";
import { VotingInstructions } from "../voting/voting-instructions";
import { useGetActiveStory } from "@/lib/hooks/convex/stories";
import { useEndedStory } from "@/lib/hooks/convex/use-ended-story";
import { Title } from "../title";
import { VotingResultsChart } from "../voting/voting-results-chart";
import { Card } from "../card";

interface Props {
  id: string;
}

const NoActiveStory = () => {
  return (
    <Card className="p-6 py-8 text-center ">
      <Title
        title="Voting Instructions"
        subtitle="No story is currently active. Please wait for the admin to start a voting session."
      />
    </Card>
  );
};

export const UserPanel = ({ id }: Props) => {
  const activeStory = useGetActiveStory(id as Id<"sessions">);
  const endedStory = useEndedStory(id as Id<"sessions">);

  if (activeStory?.status === "voting") {
    return <VotingInstructions sessionId={id as Id<"sessions">} />;
  }

  if (endedStory) {
    return (
      <div className="space-y-6">
        <Title
          title="Voting Results"
          subtitle="The voting session has ended. Here are the results:"
        />
        <div className="p-4 space-y-2 rounded-lg bg-muted">
          <h3 className="text-lg font-semibold">{endedStory.title}</h3>
          {endedStory.description && (
            <p className="text-sm text-muted-foreground">
              {endedStory.description}
            </p>
          )}
        </div>
        <VotingResultsChart
          storyId={endedStory._id}
          sessionId={id as Id<"sessions">}
        />
      </div>
    );
  }

  return <NoActiveStory />;
};
