// server/db/user-stats.ts
import { db } from "@/drizzle/db";
import {
  UsersTable,
  //   CommunitiesTable,
  //   BadgesTable,
  UserBadgesTable,
  ActivitiesTable,
  PickupsTable,
  ActivityTypeEnum,
} from "@/drizzle/schema";
import { eq, sum, and } from "drizzle-orm";
import {
  CACHE_TAGS,
  dbCache,
  //   getIdTag,
  getUserTag,
  revalidateDbCache,
  getGlobalTag,
} from "@/lib/cache";
import { UserStatsData } from "@/lib/types"; // Import the new type

// Hardcode next level for now. In a real app, this could come from a levels table.
const NEXT_LEVEL_POINTS = 2000;

export async function getUserStats(
  clerkUserId: string
): Promise<UserStatsData | null> {
  const cacheFn = dbCache(getUserStatsInternal, {
    tags: [
      getUserTag(clerkUserId, CACHE_TAGS.users), // User-specific tag for their stats
      getGlobalTag(CACHE_TAGS.badges), // If badges change
      getGlobalTag(CACHE_TAGS.userBadges), // If user's badges change
      getGlobalTag(CACHE_TAGS.activities), // If activities (pickups) change
    ],
  });

  return cacheFn({ clerkUserId });
}

async function getUserStatsInternal({
  clerkUserId,
}: {
  clerkUserId: string;
}): Promise<UserStatsData | null> {
  // Fetch user data with community and badges
  const user = await db.query.UsersTable.findFirst({
    where: eq(UsersTable.clerkUserId, clerkUserId),
    with: {
      community: {
        columns: {
          name: true,
        },
      },
      userBadges: {
        with: {
          badge: {
            columns: {
              id: true,
              name: true,
              icon: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  // Calculate total trash collected by the user
  // This involves joining ActivitiesTable (for trash_pickup) with PickupsTable
  const trashCollectedResult = await db
    .select({
      totalWeight: sum(PickupsTable.estimated_weight).mapWith(Number),
    })
    .from(ActivitiesTable)
    .leftJoin(PickupsTable, eq(ActivitiesTable.pickup_id, PickupsTable.id))
    .where(
      and(
        eq(ActivitiesTable.user_id, user.id),
        eq(ActivitiesTable.type, ActivityTypeEnum.enumValues[1]) // 'trash_pickup'
      )
    );

  const totalTrashCollected = trashCollectedResult[0]?.totalWeight || 0;

  return {
    name: user.username,
    avatar: user.avatar_url,
    community: user.community?.name || "No Community",
    rank: user.rank, // Assuming rank is updated elsewhere or a placeholder
    points: user.points,
    nextLevel: NEXT_LEVEL_POINTS, // Placeholder
    trashCollected: totalTrashCollected,
    badges: user.userBadges.map((ub) => ({
      id: ub.badge.id,
      name: ub.badge.name,
      icon: ub.badge.icon,
    })),
  };
}

// Add functions to update user data that would revalidate this cache
export async function updateUserPoints(userId: string, newPoints: number) {
  const [updatedUser] = await db
    .update(UsersTable)
    .set({ points: newPoints })
    .where(eq(UsersTable.id, userId))
    .returning({ id: UsersTable.id, clerkUserId: UsersTable.clerkUserId });

  if (updatedUser) {
    revalidateDbCache({
      tag: CACHE_TAGS.users,
      id: updatedUser.id,
      userId: updatedUser.clerkUserId!, // Revalidate user-specific stats cache
    });
  }
  return updatedUser;
}

// Example function for adding a badge (would likely be part of a larger badge logic)
export async function awardBadgeToUser(userId: string, badgeId: string) {
  const [newBadge] = await db
    .insert(UserBadgesTable)
    .values({
      user_id: userId,
      badge_id: badgeId,
    })
    .returning({
      userId: UserBadgesTable.user_id,
      badgeId: UserBadgesTable.badge_id,
    });

  if (newBadge) {
    // Revalidate the user's stats cache to reflect the new badge
    const user = await db.query.UsersTable.findFirst({
      where: eq(UsersTable.id, userId),
      columns: { clerkUserId: true },
    });
    if (user?.clerkUserId) {
      revalidateDbCache({
        tag: CACHE_TAGS.users,
        userId: user.clerkUserId,
      });
      revalidateDbCache({
        tag: CACHE_TAGS.userBadges, // Revalidate user-badge join table as well
        userId: user.clerkUserId,
      });
    }
  }
  return newBadge;
}
