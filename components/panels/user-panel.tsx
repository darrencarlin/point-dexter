import { Id } from "@/convex/_generated/dataModel";
import { VotingInstructions } from "../voting/voting-instructions";

interface Props {
  id: string;
}

export const UserPanel = ({ id }: Props) => {
  return <VotingInstructions sessionId={id as Id<"sessions">} />;
};
