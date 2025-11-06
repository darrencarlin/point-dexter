import { Card } from "../card";
import { Title } from "../title";
import { VotingInstructions } from "../voting/voting-instructions";
import { VotingResultsChart } from "../voting/voting-results-chart";
import {
  useGetActiveStory,
  useEndedStory,
  useSessionId,
} from "@/lib/hooks/use-session-hooks";

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

export const UserPanel = () => {
  const activeStory = useGetActiveStory();
  const endedStory = useEndedStory();
  const sessionId = useSessionId();

  if (activeStory?.status === "voting") {
    return <VotingInstructions />;
  }

  if (endedStory && sessionId) {
    return (
      <div className="space-y-6">
        <VotingResultsChart />
      </div>
    );
  }

  return <NoActiveStory />;
};
