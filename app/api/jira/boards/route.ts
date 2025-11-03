import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export interface Board {
  id: number;
  self: string;
  name: string;
  type: string;
  location: Location;
  isPrivate: boolean;
}

export interface Location {
  projectId: number;
  displayName: string;
  projectName: string;
  projectKey: string;
  projectTypeKey: string;
  avatarURI: string;
  name: string;
}

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

  // Step 1: Get accessible resources
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
      JSON.stringify({ error: "Failed to fetch Jira sites", details: error }),
      { status: sitesRes.status }
    );
  }

  const sites = await sitesRes.json();

  if (!sites?.length) {
    return new Response(JSON.stringify({ error: "No Jira sites found" }), {
      status: 404,
    });
  }

  // Step 2: Get boards from first site
  const site = sites[0];
  const boardsRes = await fetch(
    `https://api.atlassian.com/ex/jira/${site.id}/rest/agile/1.0/board`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    }
  );

  if (!boardsRes.ok) {
    const error = await boardsRes.text();

    return new Response(
      JSON.stringify({ error: "Failed to fetch boards", details: error }),
      { status: boardsRes.status }
    );
  }

  const boards = await boardsRes.json();

  const data = boards.values.map((board: Board) => ({
    id: board.id,
    displayName: board.location.displayName,
    projectName: board.location.projectName,
    type: board.type,
    projectKey: board.location?.projectKey || null,
  }));

  return new Response(JSON.stringify({ boards: data }));
}
