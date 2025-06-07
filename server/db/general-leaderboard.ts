// server/db/general-leaderboard.ts
import { db } from "@/drizzle/db";
import { UsersTable, ActivitiesTable, CommunitiesTable, PickupsTable
   // ActivityTypeEnum
} from "@/drizzle/schema"; // Import PickupsTable
import { eq,
   // sum,
    and, gte, sql } from "drizzle-orm";
import { startOfWeek, startOfMonth, startOfYear } from "date-fns"; // Only need start dates here, not end dates for gte

export type LeaderboardTimeframe = 'weekly' | 'monthly' | 'yearly';

export interface LeaderboardEntry {
  id: string;
  name: string; // user.username
  avatar: string | null; // user.avatar_url
  community: string; // community.name
  points: number;
  collections: number;
}

export interface CommunityLeaderboard {
  id: string;
  name: string;
}

/**
 * Calculates leaderboard data for a given timeframe and optional community.
 *
 * @param timeframe 'weekly' | 'monthly' | 'yearly'
 * @param communityId Optional: Filter by a specific community ID.
 * @returns Promise<LeaderboardEntry[]>
 */
export async function getLeaderboardData(
  timeframe: LeaderboardTimeframe,
  communityId?: string | null
): Promise<LeaderboardEntry[]> {
  try {
    const now = new Date();
    let startDate: Date;

    // Determine the start date based on the timeframe
    switch (timeframe) {
      case 'weekly':
        startDate = startOfWeek(now, { weekStartsOn: 1 }); // Monday as start of week
        break;
      case 'monthly':
        startDate = startOfMonth(now);
        break;
      case 'yearly':
        startDate = startOfYear(now);
        break;
      default:
        // This case should ideally not be reached with the current `LeaderboardTimeframe` type
        startDate = new Date(0); // Epoch
    }

    const leaderboardQuery = db
      .select({
        id: UsersTable.id,
        name: UsersTable.username,
        avatar: UsersTable.avatar_url,
        communityId: UsersTable.community_id,
        // Sum points from PickupsTable based on linked activities
        totalPoints: sql<number>`SUM(CASE WHEN ${ActivitiesTable.type} = 'trash_pickup' THEN ${PickupsTable.points_awarded} ELSE 0 END)`.as('total_points'),
        totalCollections: sql<number>`COUNT(DISTINCT CASE WHEN ${ActivitiesTable.type} = 'trash_pickup' THEN ${ActivitiesTable.pickup_id} END)`.as('total_collections'),
      })
      .from(UsersTable)
      .leftJoin(ActivitiesTable, eq(UsersTable.id, ActivitiesTable.user_id))
      .leftJoin(PickupsTable, eq(ActivitiesTable.pickup_id, PickupsTable.id)) // Join with PickupsTable
      .where(
        and(
          gte(ActivitiesTable.created_at, startDate), // Filter by timeframe
          // Ensure ActivitiesTable.type is not null if we want to filter by it
          ActivitiesTable.type ? sql`${ActivitiesTable.type} IS NOT NULL` : undefined, // Ensure type is present
          communityId && communityId !== 'all' ? eq(UsersTable.community_id, communityId) : undefined // Optional community filter
        )
      )
      .groupBy(UsersTable.id, UsersTable.username, UsersTable.avatar_url, UsersTable.community_id)
      .orderBy(sql`total_points DESC NULLS LAST`) // Order by points, nulls last
      .limit(10);

    const usersWithStats = await leaderboardQuery;

    // Fetch community names separately
    const communityIds = [...new Set(usersWithStats.map(u => u.communityId).filter(Boolean) as string[])];

    // Handle case where no community IDs are found to prevent SQL error with IN ()
    const communities = communityIds.length > 0
      ? await db.select({
          id: CommunitiesTable.id,
          name: CommunitiesTable.name,
        }).from(CommunitiesTable).where(sql`${CommunitiesTable.id} IN (${sql.join(communityIds.map(id => id), sql`,`)})`)
      : []; // If no community IDs, return empty array

    const communityMap = new Map(communities.map(c => [c.id, c.name]));

    const leaderboard: LeaderboardEntry[] = usersWithStats.map(user => ({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      community: user.communityId ? communityMap.get(user.communityId) || 'Unknown Community' : 'No Community',
      points: user.totalPoints || 0,
      collections: user.totalCollections || 0,
    }));

    return leaderboard;

  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    // Re-throw or return a specific error structure if needed by action
    throw new Error("Failed to fetch leaderboard data.");
  }
}


/**
 * Fetches all communities for the filter dropdown.
 * @returns Promise<CommunityLeaderboard[]>
 */
export async function getCommunitiesForLeaderboard(): Promise<CommunityLeaderboard[]> {
  try {
    const communities = await db
      .select({
        id: CommunitiesTable.id,
        name: CommunitiesTable.name,
      })
      .from(CommunitiesTable)
      .orderBy(CommunitiesTable.name);

    return [{ id: 'all', name: 'All Communities' }, ...communities];
  } catch (error) {
    console.error("Error fetching communities for leaderboard:", error);
    throw new Error("Failed to fetch communities.");
  }
}
