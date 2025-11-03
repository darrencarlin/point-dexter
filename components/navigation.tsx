import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { SignOutButton } from "./buttons/sign-out-button";
import { Button } from "./ui/button";

export const Navigation = () => {
  const { data: session } = useSession();

  return (
    <nav className="flex justify-between p-4 mb-8 border-b">
      <Button asChild>
        <Link href="/">Home</Link>
      </Button>
      {!session && (
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/auth/sign-in">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/sign-up">Sign Up</Link>
          </Button>
        </div>
      )}

      {session && (
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <SignOutButton />
        </div>
      )}
    </nav>
  );
};
