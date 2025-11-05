"use client";

import { useSession } from "@/lib/auth-client";
import { useLocalStorageValue } from "@/lib/hooks/use-local-storage-value";
import { useCreateSession } from "@/lib/hooks/convex/sessions";
import { Pointer } from "lucide-react";
import Link from "next/link";
import { SignOutButton } from "./buttons/sign-out-button";
import { SettingsButton } from "./buttons/settings-button";
import { ThemeToggle } from "./buttons/theme-toggle";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useState } from "react";

export const DashboardNavigation = () => {
  const { data: session } = useSession();
  const anonymousUserName = useLocalStorageValue(
    "anonymous_user_name",
    "Anonymous"
  );
  const createSession = useCreateSession();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionName, setSessionName] = useState("");

  // If user is signed in, show their name. Otherwise show anonymous name
  const displayName = session?.user?.name || anonymousUserName;
  const status = session?.user?.name ? "Hi, " : "Participating as";

  const handleCreateSession = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!sessionName) {
      setError("Session name is required");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const newSession = await createSession(sessionName);
      console.log("Session created:", newSession);
      setSessionName("");
      setOpen(false);
    } catch (error) {
      console.error("Error creating session:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <nav className="flex items-center justify-between p-4 mb-4">
      <Link href="/">
        <Pointer className="transition-transform hover:animate-spin" />
      </Link>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p>
            {status} <span className="font-bold">{displayName}</span>
          </p>
          {session?.user?.email && (
            <p className="text-sm text-muted-foreground">
              {session?.user?.email}
            </p>
          )}
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Create Session</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <h2 className="mb-2 text-2xl font-bold">
                  Create a new session
                </h2>
              </DialogTitle>
            </DialogHeader>
            <form
              className="flex flex-col space-y-4"
              onSubmit={handleCreateSession}
            >
              <div className="space-y-2">
                <Label htmlFor="session">Session Name</Label>
                <Input
                  id="session"
                  type="text"
                  placeholder="Enter session name"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full">
                {loading ? "Creating..." : "Create Session"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        {session && (
          <>
            <SettingsButton />
            <SignOutButton />
          </>
        )}
        <ThemeToggle />
      </div>
    </nav>
  );
};
