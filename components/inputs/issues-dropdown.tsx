import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Issue {
  id: string;
  key: string;
  title: string;
  storyPoints: number | null;
  status: string;
}

export const IssuesDropdown = () => {
  const [loading, setLoading] = React.useState(true);
  const [issues, setIssues] = React.useState<Issue[]>([]);

  React.useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true);
      const res = await fetch("http://localhost:3000/api/jira/issues");
      const { issues } = await res.json();

      console.log("Fetched issues:", issues);
      setIssues(issues);
      setLoading(false);
    };

    fetchIssues();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Select>
      <SelectTrigger className="w-[300px]">
        <SelectValue placeholder="Select an issue" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Jira Issues</SelectLabel>
          {issues.map((issue: Issue) => (
            <SelectItem key={issue.id} value={issue.key}>
              {issue.key}: {issue.title}{" "}
              {issue.storyPoints !== null ? `(${issue.storyPoints} SP)` : ""}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
