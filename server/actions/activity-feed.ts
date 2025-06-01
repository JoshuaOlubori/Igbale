// server/actions/activity-feed.ts
"use server";

import { getRecentActivities as getRecentActivitiesDb } from "@/server/db/activity-feed"; // Import the DB function
import { ActivityFeedItem } from "@/lib/types"; // Import the type for the return value
import { currentUser } from "@clerk/nextjs/server"; // To potentially filter by user's community
import { db } from "@/drizzle/db";
import { UsersTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function getDashboardActivityFeed(
  limit?: number
): Promise<{ activities: ActivityFeedItem[]; error?: string }> {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return { activities: [], error: "User not authenticated." };
    }

    // Get the current user's community ID from your database
    const userInDb = await db.query.UsersTable.findFirst({
      where: eq(UsersTable.clerkUserId, clerkUser.id),
      columns: { community_id: true },
    });

    const userCommunityId = userInDb?.community_id || undefined;

    // Fetch activities, optionally filtered by the user's community
    const activities = await getRecentActivitiesDb(userCommunityId, limit);
    return { activities: activities };
  } catch (error) {
    console.error("Error fetching dashboard activity feed:", error);
    return { activities: [], error: "Failed to load activity feed." };
  }
}