// server/actions/general-stats.ts
"use server";

import { db } from "@/drizzle/db";
import { UsersTable, PickupsTable, CommunitiesTable, ActivitiesTable } from "@/drizzle/schema";
import { sql, eq } from "drizzle-orm"; // Import sql and eq for aggregation
import { CACHE_TAGS, getGlobalTag, revalidateDbCache } from "@/lib/cache"; // Assuming these are defined

export interface GlobalStats {
  activeUsers: number;
  totalTrashCollectedKg: number;
  totalCommunities: number;
  totalCleanupActivities: number;
}

/**
 * Fetches global statistics for the dashboard/homepage.
 * This function is designed to be a server action.
 * @returns {Promise<GlobalStats | { error: string }>} The global statistics or an error object.
 */
export async function getGlobalStats(): Promise<GlobalStats | { error: string }> {
  try {
    // Revalidate relevant caches for fresh data
    revalidateDbCache({ tag: CACHE_TAGS.users, id: getGlobalTag(CACHE_TAGS.users).split(':')[1] });
    revalidateDbCache({ tag: CACHE_TAGS.pickups, id: getGlobalTag(CACHE_TAGS.pickups).split(':')[1] });
    revalidateDbCache({ tag: CACHE_TAGS.communities, id: getGlobalTag(CACHE_TAGS.communities).split(':')[1] });
    revalidateDbCache({ tag: CACHE_TAGS.activities, id: getGlobalTag(CACHE_TAGS.activities).split(':')[1] });


    const [
      usersCountResult,
      trashCollectedResult,
      communitiesCountResult,
      cleanupActivitiesCountResult,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(UsersTable),
      db.select({ total: sql<number>`sum(${PickupsTable.estimated_weight})` }).from(PickupsTable).where(eq(PickupsTable.status, 'done')),
      db.select({ count: sql<number>`count(*)` }).from(CommunitiesTable),
      db.select({ count: sql<number>`count(*)` }).from(ActivitiesTable).where(eq(ActivitiesTable.type, 'trash_pickup')),
    ]);

    const activeUsers = usersCountResult[0]?.count || 0;
    const totalTrashCollectedKg = Math.round(trashCollectedResult[0]?.total || 0); // Round to nearest kg
    const totalCommunities = communitiesCountResult[0]?.count || 0;
    const totalCleanupActivities = cleanupActivitiesCountResult[0]?.count || 0;

    return {
      activeUsers,
      totalTrashCollectedKg,
      totalCommunities,
      totalCleanupActivities,
    };
  } catch (error) {
    console.error("Error fetching global statistics:", error);
    return { error: "Failed to fetch global statistics." };
  }
}
