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
import { Button } from "../ui/button";

export interface Story {
  id: string;
  key: string;
  title: string;
  storyPoints: number | null;
  status: string;
}

interface Props {
  onAddStory?: (issue: Story | null) => void;
}

export const IssuesDropdown = ({ onAddStory }: Props) => {
  const [loading, setLoading] = React.useState(true);
  const [stories, setStories] = React.useState<Story[]>([]);
  const [selectedKey, setSelectedKey] = React.useState<string>("");
  const selectedStory =
    stories.find((story) => story.key === selectedKey) || null;

  React.useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      const res = await fetch("http://localhost:3000/api/jira/stories");
      const { issues } = await res.json();

      console.log("Fetched stories:", stories);
      setStories(issues);
      setLoading(false);
    };

    fetchStories();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex">
      <Select value={selectedKey} onValueChange={setSelectedKey}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select an issue" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Jira Issues</SelectLabel>
            {stories.map((story: Story) => (
              <SelectItem key={story.id} value={story.key}>
                {story.key}: {story.title}{" "}
                {story.storyPoints !== null ? `(${story.storyPoints} SP)` : ""}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Button
        type="button"
        className="ml-2"
        onClick={() => onAddStory?.(selectedStory)}
      >
        Add Story
      </Button>
    </div>
  );
};
