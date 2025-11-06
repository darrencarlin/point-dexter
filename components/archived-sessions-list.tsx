"use client";

import { Button } from "@/components/ui/button";
import { Title } from "@/components/title";
import { useSession } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { Card } from "./card";

interface ArchivedSession {
  id: string;
  name: string;
  createdAt: number;
  endedAt: number;
  isActive: boolean;
  createdBy: string;
}

export function ArchivedSessionsList() {
  const { data: session } = useSession();
  const [archivedSessions, setArchivedSessions] = useState<ArchivedSession[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  // Fetch archived sessions from Neon DB
  useEffect(() => {
    const fetchArchivedSessions = async () => {
      if (!session?.user?.id) return;

      setLoading(true);
      try {
        const response = await fetch("/api/sessions/archived");
        if (response.ok) {
          const data = await response.json();
          setArchivedSessions(data);
        }
      } catch (error) {
        console.error("Error fetching archived sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArchivedSessions();
  }, [session?.user?.id]);

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

  // Sort sessions by most recent first
  const sortedSessions = [...archivedSessions].sort(
    (a, b) => b.endedAt - a.endedAt
  );

  return (
    <div className="flex flex-col">
      <Title title="Past Sessions" subtitle="View your past sessions" />
      <div className="max-h-[500px] overflow-y-auto">
        {loading ? (
          <p className="text-muted-foreground">Loading past sessions...</p>
        ) : sortedSessions.length > 0 ? (
          <ul className="space-y-2">
            {sortedSessions.map((session) => (
              <li key={session.id}>
                <Card className="flex items-center justify-between ">
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
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No past sessions found.</p>
        )}
      </div>
    </div>
  );
}
