// server/db/leaderboard.ts
import { db } from "@/drizzle/db";
import {
  UsersTable,
  ActivitiesTable,
  PickupsTable,
  ActivityTypeEnum,
 //  CommunitiesTable, 
} from "@/drizzle/schema";
import { eq, sum, and, gte, sql } from "drizzle-orm";
import { CACHE_TAGS, dbCache, getGlobalTag, getIdTag, ValidTags } from "@/lib/cache"; // Import ValidTags
import { LeaderboardEntry } from "@/lib/types";
import { subDays, subMonths, subYears } from "date-fns"; // For date calculations

type Timeframe = 'weekly' | 'monthly' | 'yearly';

export async function getLeaderboard(
  timeframe: Timeframe,
  communityId?: string
): Promise<LeaderboardEntry[]> {
  // Initialize tags with an array of ValidTags directly
  const tags: ValidTags[] = [ // Explicitly type as ValidTags[]
    getGlobalTag(CACHE_TAGS.users),
    getGlobalTag(CACHE_TAGS.activities),
    getGlobalTag(CACHE_TAGS.pickups),
  ];

  if (communityId) {
    tags.push(getIdTag(communityId, CACHE_TAGS.communities)); // This is already a ValidTag
  } else {
    tags.push(getGlobalTag(CACHE_TAGS.communities)); // This is already a ValidTag
  }

  const cacheFn = dbCache(getLeaderboardInternal, {
    tags: tags,
  });

  return cacheFn({ timeframe, communityId });
}

// ... (rest of your getLeaderboardInternal and other functions) ...
async function getLeaderboardInternal({
  timeframe,
  communityId,
}: {
  timeframe: Timeframe;
  communityId?: string;
}): Promise<LeaderboardEntry[]> {
  let startDate: Date;
  const now = new Date();

  switch (timeframe) {
    case 'weekly':
      startDate = subDays(now, 7);
      break;
    case 'monthly':
      startDate = subMonths(now, 1);
      break;
    case 'yearly':
      startDate = subYears(now, 1);
      break;
    default:
      startDate = subDays(now, 7); // Default to weekly
  }

  const userActivityStats = db
    .select({
      userId: ActivitiesTable.user_id,
      totalWeight: sum(PickupsTable.estimated_weight).mapWith(Number).as('total_weight'),
      collectionCount: sql<number>`count(${ActivitiesTable.id})`.as('collection_count'),
    })
    .from(ActivitiesTable)
    .leftJoin(PickupsTable, eq(ActivitiesTable.pickup_id, PickupsTable.id))
    .where(
      and(
        eq(ActivitiesTable.type, ActivityTypeEnum.enumValues[1]), // 'trash_pickup'
        gte(ActivitiesTable.created_at, startDate),
        communityId
          ? eq(PickupsTable.community_id, communityId) // Filter by community if provided
          : undefined
      )
    )
    .groupBy(ActivitiesTable.user_id)
    .as("user_activity_stats");

  const leaderboardUsers = await db
    .select({
      id: UsersTable.id,
      name: UsersTable.username,
      avatar: UsersTable.avatar_url,
      points: UsersTable.points, // Use overall user points
      collections: userActivityStats.collectionCount,
      calculatedPoints: userActivityStats.totalWeight,
    })
    .from(UsersTable)
    .innerJoin(userActivityStats, eq(UsersTable.id, userActivityStats.userId))
    .orderBy((cols) => sql`${cols.calculatedPoints} DESC`)
    .limit(10);

  return leaderboardUsers.map((user) => ({
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    points: Math.round(user.calculatedPoints * 10),
    collections: user.collections || 0,
  }));
}