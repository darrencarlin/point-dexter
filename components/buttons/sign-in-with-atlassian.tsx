import { authClient } from "@/lib/auth-client";
import { Button } from "../ui/button";

interface Props {
  setError: (error: string) => void;
  setLoading: (loading: boolean) => void;
}

export const SignInWithAtlassianButton = ({ setError, setLoading }: Props) => {
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
        Sign in with Atlassian
      </Button>
    </div>
  );
};
