import { auth } from "@/lib/auth";
import { getCloudId } from "@/lib/utils";
import { headers } from "next/headers";

export async function GET(request: Request) {
  // Authenticate user
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  // Get Atlassian access token
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

  // Get boardId from query params or use default
  const { searchParams } = new URL(request.url);
  const boardId = searchParams.get("boardId") || "4140";
  // Get cloud ID dynamically from accessible resources
  const cloudId = await getCloudId(accessToken);

  if (!cloudId) {
    return new Response(JSON.stringify({ error: "Failed to get cloud ID" }), {
      status: 500,
    });
  }

  // First, get the board details to find the project
  const boardRes = await fetch(
    `https://api.atlassian.com/ex/jira/${cloudId}/rest/agile/1.0/board/${boardId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    }
  );

  if (!boardRes.ok) {
    const error = await boardRes.text();

    return new Response(
      JSON.stringify({
        error: "Failed to fetch board details",
        details: error,
      }),
      {
        status: boardRes.status,
      }
    );
  }

  const boardData = await boardRes.json();
  const projectKey = boardData.location?.projectKey;

  if (!projectKey) {
    return new Response(
      JSON.stringify({ error: "Could not determine project from board" }),
      {
        status: 400,
      }
    );
  }

  // Fetch all open issues using JQL (single request)
  const maxResults = 500;
  const res = await fetch(
    `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/search/jql`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jql: `project = ${projectKey} AND statusCategory != Done ORDER BY created DESC`,
        maxResults,
        fields: ["summary", "status", "customfield_10016"],
      }),
    }
  );

  if (!res.ok) {
    const error = await res.text();

    return new Response(
      JSON.stringify({
        error: "Failed to fetch issues",
        details: error,
      }),
      {
        status: res.status,
      }
    );
  }

  const data = await res.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allIssues = (data.issues || []).map((issue: any) => ({
    id: issue.id,
    key: issue.key,
    title: issue.fields?.summary || "",
    storyPoints: issue.fields?.customfield_10016 || null,
    status: issue.fields?.status?.name || "",
  }));

  return new Response(
    JSON.stringify({
      issues: allIssues,
      projectKey,
      boardId,
      total: allIssues.length,
    })
  );
}
