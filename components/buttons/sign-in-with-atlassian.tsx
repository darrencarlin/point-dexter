import { authClient } from "@/lib/auth-client";
import { Button } from "../ui/button";
import { useState } from "react";
import Image from "next/image";

export const SignInWithAtlassianButton = () => {
  const [error, setError] = useState("");

  const handleSignInWithAtlassian = async () => {
    setError("");

    try {
      const data = await authClient.signIn.social({
        provider: "atlassian",
      });

      console.log("Atlassian sign-in data:", data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    }
  };

  return (
    <div className="my-4">
      <Button
        type="button"
        variant="outline"
        onClick={handleSignInWithAtlassian}
        className="w-full"
      >
        <Image src="/logo.png" alt="Atlassian Logo" width={150} height={30} />
      </Button>
      {error && <p>{error}</p>}
    </div>
  );
};
