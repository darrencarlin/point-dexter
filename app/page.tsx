import { BASE_URL } from "@/lib/constants";
import HomePageClient from "./page.client";

async function getStats() {
  try {
    const response = await fetch(`${BASE_URL}/api/stats`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching stats:", error);
    return null;
  }
}

export default async function Home() {
  const stats = await getStats();

  return <HomePageClient stats={stats} />;
}
