import { auth } from "@/lib/auth";
import { getCloudId } from "@/lib/utils";
import { headers } from "next/headers";

// 10033

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: issueKeyOrId } = await params;

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

  // Get story points from request body
  const { points } = await request.json();

  if (points === undefined || points === null) {
    return new Response(JSON.stringify({ error: "points is required" }), {
      status: 400,
    });
  }

  // Get cloud ID dynamically from accessible resources
  const cloudId = await getCloudId(accessToken);

  if (!cloudId) {
    return new Response(JSON.stringify({ error: "Failed to get cloud ID" }), {
      status: 500,
    });
  }

  await fetch(
    `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue/${issueKeyOrId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        update: {
          customfield_10016: [
            {
              set: Number(points),
            },
          ],
        },
      }),
    }
  );

  return new Response(
    JSON.stringify({ success: true, issueKey: issueKeyOrId, points })
  );
}
