import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { SignOutButton } from "./buttons/sign-out-button";
import { Button } from "./ui/button";
import { Pointer } from "lucide-react";
import { ThemeToggle } from "./buttons/theme-toggle";

export const Navigation = () => {
  const { data: session } = useSession();

  return (
    <nav className="flex justify-between items-center p-4 mb-8">
      <Link href="/">
        <Pointer className="hover:animate-spin transition-transform" />
      </Link>
      <div className="flex gap-4">
        {!session && (
          <>
            <Button asChild>
              <Link href="/auth/sign-in">Sign In</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/auth/sign-up">Sign Up</Link>
            </Button>
          </>
        )}

        {session && (
          <>
            <Button asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <SignOutButton />
          </>
        )}

        <ThemeToggle />
      </div>
    </nav>
  );
};
