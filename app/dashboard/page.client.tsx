"use client";

import { Card } from "@/components/card";
import { Title } from "@/components/title";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { useGetSessions } from "@/lib/hooks/convex/sessions";
import Link from "next/link";
import { useState, useEffect } from "react";

interface ArchivedSession {
  id: string;
  name: string;
  createdAt: number;
  endedAt: number;
  isActive: boolean;
  createdBy: string;
}

export default function DashboardPageClient() {
  const [link, setLink] = useState("Copy Link");
  const { data: session, isPending } = useSession();
  const sessions = useGetSessions();
  const [archivedSessions, setArchivedSessions] = useState<ArchivedSession[]>(
    []
  );
  const [loadingArchived, setLoadingArchived] = useState(false);

  // Fetch archived sessions from Neon DB
  useEffect(() => {
    const fetchArchivedSessions = async () => {
      if (!session?.user?.id) return;

      setLoadingArchived(true);
      try {
        const response = await fetch("/api/sessions/archived");
        if (response.ok) {
          const data = await response.json();
          setArchivedSessions(data);
        }
      } catch (error) {
        console.error("Error fetching archived sessions:", error);
      } finally {
        setLoadingArchived(false);
      }
    };

    fetchArchivedSessions();
  }, [session?.user?.id]);

  interface Session {
    _id: string;
    name: string;
    createdAt: number;
  }

  const handleCopyLink = (session: Session): void => {
    if (!session) return;
    const sessionLink: string = `${window.location.origin}/session/${session._id}`;
    navigator.clipboard.writeText(sessionLink);
  };

  const handleViewArchivedSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/sessions/archived/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        console.log("Archived session data:", data);
      } else {
        console.error("Failed to fetch archived session");
      }
    } catch (error) {
      console.error("Error fetching archived session:", error);
    }
  };

  if (isPending) {
    return (
      <main className="flex flex-col items-center justify-between p-24">
        <p className="font-bold">Loading...</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex flex-col items-center justify-between p-24">
        <p className="font-bold">You are not signed in.</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col flex-1 w-full gap-4 p-4 mx-auto overflow-hidden max-w-7xl">
      {/* Two Column Layout for Active and Past Sessions */}
      <div className="grid flex-1 min-h-0 grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Active Sessions Section */}
        <Card>
          <Title title="Active Sessions" subtitle="View your active sessions" />
          <div className="flex-1 overflow-y-auto">
            {sessions && sessions.length > 0 ? (
              <ul className="space-y-2">
                {sessions.map((session) => (
                  <li
                    key={session._id}
                    className="flex items-center justify-between gap-8 p-4 border rounded-lg bg-muted/30 border-border"
                  >
                    <div className="flex flex-col">
                      <p className="font-semibold">{session.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(session.createdAt).toDateString()}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button type="button">
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
                        onClick={() => {
                          setLink("Copied!");
                          handleCopyLink(session);
                          setTimeout(() => {
                            setLink("Copy Link");
                          }, 2000);
                        }}
                      >
                        {link}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No sessions found.</p>
            )}
          </div>
        </Card>

        {/* Past Sessions Section */}
        <Card>
          <Title title="Past Sessions" subtitle="View your past sessions" />
          <div className="flex-1 overflow-y-auto">
            {loadingArchived ? (
              <p className="text-muted-foreground">Loading past sessions...</p>
            ) : archivedSessions.length > 0 ? (
              <ul className="space-y-2">
                {archivedSessions.map((session) => (
                  <li
                    key={session.id}
                    className="flex items-center justify-between gap-8 p-4 rounded-lg bg-secondary/10"
                  >
                    <div className="flex flex-col">
                      <p className="font-semibold">{session.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(session.endedAt).toDateString()}
                      </p>
                    </div>

                    <Button
                      variant="secondary"
                      onClick={() => handleViewArchivedSession(session.id)}
                    >
                      View Details
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No past sessions found.</p>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}
