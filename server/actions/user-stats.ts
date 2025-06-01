// server/actions/user-stats.ts
"use server";

import { getUserStats as getUserStatsDb } from "@/server/db/user-stats";
import { UserStatsData } from "@/lib/types"; // Import the type
import { currentUser } from "@clerk/nextjs/server";

export async function getDashboardUserStats(): Promise<{
  userStats: UserStatsData | null;
  error?: string;
}> {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return { userStats: null, error: "User not authenticated." };
    }

    const userStats = await getUserStatsDb(clerkUser.id);

    return { userStats: userStats };
  } catch (error) {
    console.error("Error fetching dashboard user stats:", error);
    return { userStats: null, error: "Failed to load user statistics." };
  }
}