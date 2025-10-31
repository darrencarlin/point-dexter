"use client";

import { Title } from "@/components/title";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth-client";
import { useCreateSession, useGetSessions } from "@/lib/hooks/convex/sessions";
import Link from "next/link";
import { useState } from "react";

export default function Dashboard() {
  const createSession = useCreateSession();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const { data: session } = useSession();
  const sessions = useGetSessions();

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

  const handleCopyLink = () => {
    if (!sessions) return;
    const sessionLink = `${window.location.origin}/session/${sessions[0]._id}`;
    navigator.clipboard.writeText(sessionLink);
  };

  if (!session) {
    return (
      <main className="flex flex-col items-center justify-between p-24">
        <p>You are not signed in.</p>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto mt-6">
      <div>
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
      </div>

      <div className="mt-6">
        {sessions && sessions.length > 0 ? (
          <ul className="space-y-2">
            {sessions.map((sess) => (
              <li
                key={sess._id}
                className="flex items-center justify-between p-4 border rounded-lg gap-8"
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
                  <Button variant="secondary" onClick={handleCopyLink}>
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
    </main>
  );
}
