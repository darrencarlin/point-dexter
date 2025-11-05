import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AtlassianResource, JiraInstance } from "@/lib/types/jira";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const tokenData = await auth.api.getAccessToken({
    body: {
      providerId: "atlassian",
      userId: session.user.id as string,
    },
    headers: await headers(),
  });

  const accessToken = tokenData?.accessToken;

  if (!accessToken) {
    return new Response(
      JSON.stringify({
        error:
          "No Atlassian access token found. Please reconnect your Atlassian account.",
      }),
      { status: 401 }
    );
  }

  try {
    // Get accessible resources (Jira instances)
    const sitesRes = await fetch(
      "https://api.atlassian.com/oauth/token/accessible-resources",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    if (!sitesRes.ok) {
      const error = await sitesRes.text();
      return new Response(
        JSON.stringify({
          error: "Failed to fetch Jira instances",
          details: error
        }),
        { status: sitesRes.status }
      );
    }

    const sites = await sitesRes.json();

    if (!sites?.length) {
      return new Response(
        JSON.stringify({ error: "No Jira instances found" }),
        { status: 404 }
      );
    }

    // Transform the data to match our interface
    const instances: JiraInstance[] = sites.map((site: AtlassianResource) => ({
      id: site.id,
      name: site.name,
      url: site.url,
      scopes: site.scopes || [],
      avatarUrl: site.avatarUrl || "",
    }));

    return new Response(JSON.stringify({ instances }));
  } catch (error) {
    console.error("Error fetching Jira instances:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500 }
    );
  }
}
