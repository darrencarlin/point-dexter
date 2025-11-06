"use client";

import { Button } from "@/components/ui/button";
import { Title } from "@/components/title";
import { useGetSessions } from "@/lib/hooks/convex/use-sessions";
import Link from "next/link";
import { useState } from "react";
import { Card } from "./card";

export function ActiveSessionsList() {
  const [copiedSessionId, setCopiedSessionId] = useState<string | null>(null);
  const sessions = useGetSessions();

  const handleCopyLink = (session: {
    _id: string;
    name: string;
    createdAt: number;
  }): void => {
    if (!session) return;
    const sessionLink: string = `${window.location.origin}/session/${session._id}`;
    navigator.clipboard.writeText(sessionLink);
    setCopiedSessionId(session._id);

    // Clear the copied state after 2 seconds
    setTimeout(() => {
      setCopiedSessionId((currentId) =>
        currentId === session._id ? null : currentId
      );
    }, 2000);
  };

  // Sort sessions by most recent first
  const sortedSessions = sessions
    ? [...sessions].sort((a, b) => b.createdAt - a.createdAt)
    : [];

  return (
    <div className="flex flex-col">
      <Title title="Active Sessions" subtitle="View your active sessions" />
      <div className="max-h-[500px] overflow-y-auto">
        {sortedSessions && sortedSessions.length > 0 ? (
          <ul className="space-y-2">
            {sortedSessions.map((session) => (
              <li key={session._id}>
                <Card className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="font-semibold">{session.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(session.createdAt).toDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button asChild type="button">
                      <Link
                        href={`/session/${session._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Join Session
                      </Link>
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleCopyLink(session)}
                    >
                      {copiedSessionId === session._id
                        ? "Link Copied!"
                        : "Copy Link"}
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No active sessions found.</p>
        )}
      </div>
    </div>
  );
}
