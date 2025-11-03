import { authClient } from "@/lib/auth-client";
import { Button } from "../ui/button";
import { useState } from "react";

export const SignInWithAtlassianButton = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignInWithAtlassian = async () => {
    setError("");
    setLoading(true);

    try {
      const data = await authClient.signIn.social({
        provider: "atlassian",
      });

      console.log("Atlassian sign-in data:", data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-4">
      <Button
        type="button"
        variant="outline"
        onClick={handleSignInWithAtlassian}
      >
        {loading ? "Signing in..." : "Sign in with Atlassian"}
      </Button>
      {error && <p>{error}</p>}
    </div>
  );
};
