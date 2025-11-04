"use client";

import { Title } from "@/components/title";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth-client";
import { useCreateSession, useGetSessions } from "@/lib/hooks/convex/sessions";
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

export default function Dashboard() {
  const createSession = useCreateSession();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const { data: session } = useSession();
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

  const handleCreateSession = async () => {
    if (!sessionName) {
      setError("Session name is required");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const newSession = await createSession(sessionName);
      console.log("Session created:", newSession);
    } catch (error) {
      console.error("Error creating session:", error);
    } finally {
      setLoading(false);
      setSessionName("");
    }
  };

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

  if (!session) {
    return (
      <main className="flex flex-col items-center justify-between p-24">
        <p>You are not signed in.</p>
      </main>
    );
  }

  return (
    <main className="grid grid-cols-1 lg:grid-cols-2 gap-16 mt-6 p-4">
      {/* Left Column */}
      <div className="space-y-8">
        {/* Create New Session Section */}
        <section>
          <Title
            title="Create New Session"
            subtitle="Please enter a name for your new session"
          />
          <form className="space-y-4">
            <Label className="mb-2">Session Name</Label>
            <Input
              type="text"
              placeholder="Enter session name"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
            />
            {error && <p>{error}</p>}
            <Button type="button" onClick={handleCreateSession}>
              {loading ? "Creating..." : "Create Session"}
            </Button>
          </form>
        </section>

        {/* Active Sessions Section */}
        <section>
          <Title title="Active Sessions" subtitle="View your active sessions" />
          <div>
            {sessions && sessions.length > 0 ? (
              <ul className="space-y-2">
                {sessions.map((sess) => (
                  <li
                    key={sess._id}
                    className="flex items-center justify-between gap-8 p-4 border rounded-lg"
                  >
                    <div className="flex flex-col">
                      <p className="font-semibold">{sess.name}</p>
                      <p className="text-sm">
                        {new Date(sess.createdAt).toDateString()}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button type="button">
                        <Link
                          href={`/session/${sess._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Join Session
                        </Link>
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleCopyLink(sess)}
                      >
                        Copy Link
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No sessions found.</p>
            )}
          </div>
        </section>
      </div>

      {/* Right Column */}
      <div>
        {/* Past Sessions Section */}
        <section>
          <Title title="Past Sessions" subtitle="View your past sessions" />
          <div className="mt-4">
            {loadingArchived ? (
              <p>Loading past sessions...</p>
            ) : archivedSessions.length > 0 ? (
              <ul className="space-y-2">
                {archivedSessions.map((session) => (
                  <li
                    key={session.id}
                    className="flex items-center justify-between gap-8 p-4 border rounded-lg"
                  >
                    <div className="flex flex-col">
                      <p className="font-semibold">{session.name}</p>
                      <p className="text-sm">
                        {new Date(session.endedAt).toDateString()}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => handleViewArchivedSession(session.id)}
                    >
                      View Details
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No past sessions found.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
