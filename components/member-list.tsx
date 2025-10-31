import { Id } from "@/convex/_generated/dataModel";
import { useGetSessionMembers } from "@/lib/hooks/convex/session-members";
import { Title } from "./title";

interface Props {
  id: string;
}

export const MemberList = ({ id }: Props) => {
  const sessionMembers = useGetSessionMembers(id as Id<"sessions">);

  return (
    <div>
      <Title
        title="Session Members"
        subtitle="List of members in this session"
      />
      <ul className="space-y-2">
        {sessionMembers?.map((member) => (
          <li
            key={member._id}
            className="flex items-center justify-between p-4 border rounded-lg gap-8"
          >
            <div className="flex flex-col">
              {member.isAdmin && <span className="text-sm">Admin</span>}
              <p className="font-semibold">{member.name}</p>{" "}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
