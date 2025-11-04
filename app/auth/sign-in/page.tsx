"use client";

import { SignInWithAtlassianButton } from "@/components/buttons/sign-in-with-atlassian";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      await authClient.signIn.email({
        email,
        password,
      });

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="p-8 rounded-lg shadow-lg min-w-xs">
        <h3 className="mb-6 text-2xl font-bold">Sign In to Your Account</h3>
        <form className="space-y-4">
          <div>
            <Label htmlFor="email" className="mb-2">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password" className="mb-2">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p>{error}</p>}
          <Button
            type="button"
            disabled={loading}
            onClick={handleSignIn}
            className="w-full font-bold"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <Separator className="my-4" />

        <SignInWithAtlassianButton />

        <p className="mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/auth/sign-up" className="text-blue-500">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
