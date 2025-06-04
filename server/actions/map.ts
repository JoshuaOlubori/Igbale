// server/actions/map.ts
"use server";

import { currentUser } from "@clerk/nextjs/server";
import { getUserCommunityDetails, getActivePickupsInCommunity, ActivePickup } from "@/server/db/map";

// Re-export the ActivePickup type so it can be used by components
export type { ActivePickup };

export type MapPageData = {
  community: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    radius: number;
  } | null;
  activePickups: ActivePickup[];
  error: string | null;
};

export async function getMapData(): Promise<MapPageData> {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return {
      community: null,
      activePickups: [],
      error: "Authentication required to view map data.",
    };
  }
  console.log("Fetching map data for user:", clerkUser.id);

  try {
    const userCommunityData = await getUserCommunityDetails(clerkUser.id);

    console.log("User community data:", userCommunityData);
    if (!userCommunityData || !userCommunityData.community) {
      return {
        community: null,
        activePickups: [],
        error: "You are not currently a member of any community.",
      };
    }

    const activePickups = await getActivePickupsInCommunity(userCommunityData.community.id);

    return {
      community: userCommunityData.community,
      activePickups: activePickups,
      error: null,
    };
  } catch (err) {
    console.error("Failed to fetch map data:", err);
    return {
      community: null,
      activePickups: [],
      error: `An unexpected error occurred: ${(err as Error).message}`,
    };
  }
}