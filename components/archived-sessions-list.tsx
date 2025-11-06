"use client";

import { Button } from "@/components/ui/button";
import { Title } from "@/components/title";
import { useSession } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { Card } from "./card";
import { ArchivedSessionTotal } from "./archived-session-total";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ArchivedSession {
  id: string;
  name: string;
  createdAt: number;
  endedAt: number;
  isActive: boolean;
  createdBy: string;
}

interface SessionMember {
  id: string;
  sessionId: string;
  userId: string;
  name: string;
  joinedAt: number;
  isAdmin: boolean;
}

interface SessionStory {
  id: string;
  sessionId: string;
  title: string;
  description: string | null;
  status: string | null;
  createdAt: string;
  updatedAt: string;
  points: number;
  jiraKey: string | null;
}

interface SessionVote {
  id: string;
  storyId: string;
  userId: string;
  name: string;
  points: string;
  votedAt: number;
}

interface SessionDetails {
  session: ArchivedSession;
  members: SessionMember[];
  stories: SessionStory[];
  votes: SessionVote[];
}

export function ArchivedSessionsList() {
  const { data: session } = useSession();
  const [archivedSessions, setArchivedSessions] = useState<ArchivedSession[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] =
    useState<ArchivedSession | null>(null);
  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(
    null
  );
  const [loadingDetails, setLoadingDetails] = useState(false);

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

  const handleViewArchivedSession = async (sessionToView: ArchivedSession) => {
    setSelectedSession(sessionToView);
    setDialogOpen(true);
    setLoadingDetails(true);

    try {
      const response = await fetch(
        `/api/sessions/archived/${sessionToView.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setSessionDetails(data);
      } else {
        console.error("Failed to fetch archived session");
      }
    } catch (error) {
      console.error("Error fetching archived session:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Sort sessions by most recent first
  const sortedSessions = [...archivedSessions].sort(
    (a, b) => b.endedAt - a.endedAt
  );

  return (
    <div className="flex flex-col">
      <Title title="Past Sessions" subtitle="View your past sessions" />
      <div className="max-h-[60vh] overflow-y-auto">
        {loading ? (
          <p className="text-muted-foreground">Loading past sessions...</p>
        ) : sortedSessions.length > 0 ? (
          <ul className="space-y-2">
            {sortedSessions.map((session) => (
              <li key={session.id}>
                <Card className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="font-semibold">{session.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(session.endedAt).toDateString()}
                    </p>
                  </div>

                  <Dialog
                    open={dialogOpen && selectedSession?.id === session.id}
                    onOpenChange={setDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="secondary"
                        onClick={() => handleViewArchivedSession(session)}
                      >
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{session.name}</DialogTitle>
                        <DialogDescription>
                          {new Date(session.endedAt).toDateString()}
                        </DialogDescription>
                      </DialogHeader>

                      {loadingDetails ? (
                        <p className="text-sm text-muted-foreground">
                          Loading details...
                        </p>
                      ) : sessionDetails ? (
                        <div className="space-y-4 mt-4">
                          {/* Members Section */}
                          <div>
                            <h3 className="font-semibold mb-2">
                              Members ({sessionDetails.members.length})
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {sessionDetails.members.map((member) => (
                                <span
                                  key={member.id}
                                  className="text-sm bg-muted px-3 py-1 rounded"
                                >
                                  {member.name}
                                  {member.isAdmin && (
                                    <span className="text-xs text-muted-foreground ml-1">
                                      (Admin)
                                    </span>
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Stories Section */}
                          <div>
                            <div className="flex gap-2 items-center mb-2">
                              <h3 className="font-semibold">
                                Stories ({sessionDetails.stories.length})
                              </h3>
                              <ArchivedSessionTotal
                                stories={sessionDetails.stories}
                              />
                            </div>
                            {sessionDetails.stories.length > 0 ? (
                              <ul className="space-y-2">
                                {sessionDetails.stories.map((story) => {
                                  const storyVotes =
                                    sessionDetails.votes.filter(
                                      (v) => v.storyId === story.id
                                    );

                                  return (
                                    <Card key={story.id} className="text-sm">
                                      <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                          <p className="font-medium">
                                            {story.title}
                                          </p>
                                          {story.description && (
                                            <p className="text-muted-foreground text-xs mt-1">
                                              {story.description}
                                            </p>
                                          )}
                                          {story.jiraKey && (
                                            <p className="text-muted-foreground text-xs mt-1">
                                              Jira: {story.jiraKey}
                                            </p>
                                          )}
                                        </div>
                                        <div className="text-right">
                                          <p className="font-semibold">
                                            {story.points > 0
                                              ? `${story.points} pts`
                                              : "No points"}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Show votes for this story */}
                                      {storyVotes.length > 0 && (
                                        <div className="mt-2 pt-2 border-t">
                                          <p className="text-xs font-medium mb-1">
                                            Votes:
                                          </p>
                                          <div className="flex flex-wrap gap-2">
                                            {storyVotes.map((vote) => (
                                              <span
                                                key={vote.id}
                                                className="text-xs bg-muted px-2 py-1 rounded"
                                              >
                                                {vote.name}: {vote.points}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </Card>
                                  );
                                })}
                              </ul>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                No stories in this session
                              </p>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </DialogContent>
                  </Dialog>
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
