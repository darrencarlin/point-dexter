"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Title } from "@/components/title";
import { SignInWithAtlassianButton } from "@/components/buttons/sign-in-with-atlassian";

export default function SignIn() {
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

      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-md mx-auto mt-6">
      <div>
        <Title
          title="Welcome Back!"
          subtitle="Please sign in to your account"
        />
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
          <Button type="button" disabled={loading} onClick={handleSignIn}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <SignInWithAtlassianButton setError={setError} setLoading={setLoading} />
       
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
