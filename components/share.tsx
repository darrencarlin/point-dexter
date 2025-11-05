import { useState } from "react";
import { Card } from "./card";
import { Title } from "./title";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export const Share = () => {
  const [link, setLink] = useState("Copy Link");
  const url = typeof window !== "undefined" ? window.location.href : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setLink("Link Copied!");
    setTimeout(() => setLink("Copy Link"), 2000);
  };

  return (
    <Card>
      <Title title="Share this session" subtitle="Invite others to join you" />
      <div className="flex gap-2">
        <Input value={url} readOnly className="flex-1" />
        <Button onClick={handleCopyLink}>{link}</Button>
      </div>
    </Card>
  );
};
