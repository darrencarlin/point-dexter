import { Id } from "@/convex/_generated/dataModel";
import { VotingInstructions } from "../voting/voting-instructions";
import { useGetActiveStory } from "@/lib/hooks/convex/stories";
import { Title } from "../title";

interface Props {
  id: string;
}

interface ChartAndVotesProps {
  isAdmin?: boolean;
}

const ChartAndVotes = ({ isAdmin }: ChartAndVotesProps) => {
  if (isAdmin) {
    return (
      <div className="flex flex-col">
        Admin Chart and Votes Component (to be implemented)
      </div>
    );
  }
  return (
    <div className="flex">Chart and Votes Component (to be implemented)</div>
  );
};

const NoActiveStory = () => {
  return (
    <div className="text-center py-8">
      <Title
        title="Voting Instructions"
        subtitle="No story is currently active. Please wait for the admin to start a voting session."
      />
    </div>
  );
};

export const UserPanel = ({ id }: Props) => {
  const activeStory = useGetActiveStory(id as Id<"sessions">);

  if (activeStory?.status === "voting") {
    return <VotingInstructions sessionId={id as Id<"sessions">} />;
  }

  if (activeStory?.status === "pending") {
    return <ChartAndVotes />;
  }

  if (activeStory?.status === "new") {
    return <NoActiveStory />;
  }

  if (activeStory?.status === "completed") {
    return <NoActiveStory />;
  }

  return <NoActiveStory />;
};
