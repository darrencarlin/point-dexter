import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getCloudId = async (accessToken: string) => {
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
    throw new Error(
      `Failed to fetch Atlassian sites: ${sitesRes.status} - ${error}`
    );
  }

  const sites = await sitesRes.json();

  if (!sites?.length) {
    throw new Error("No Atlassian sites found");
  }

  return sites[0].id;
};
