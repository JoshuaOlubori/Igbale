import { db } from "@/drizzle/db"
import { CommunitiesTable } from "@/drizzle/schema"
import { CACHE_TAGS, revalidateDbCache, dbCache, getGlobalTag } from "@/lib/cache"
import { UsersTable } from "@/drizzle/schema";
import { eq} from "drizzle-orm";
import { CommunityWithDetails } from "@/lib/types"


export async function createCommunity(
    data: typeof CommunitiesTable.$inferInsert
) {
    // Check if a community with the same name already exists
    const existing = await db
        .select({ id: CommunitiesTable.id })
        .from(CommunitiesTable)
        .where(eq(CommunitiesTable.name, data.name))
        .limit(1);

    if (existing.length > 0) {
        throw new Error("A community with this name already exists.");
    }

    const [newCommunity] = await db
        .insert(CommunitiesTable)
        .values(data)
        .returning({
            id: CommunitiesTable.id,
            name: CommunitiesTable.name,
        });

    if (newCommunity != null) {
        revalidateDbCache({
            tag: CACHE_TAGS.communities,
            id: newCommunity.id
        });
    }

    return newCommunity;
}


export function getCommunities(
  { limit }: { limit?: number } = {} // limit is optional
) {
  const cacheFn = dbCache(getCommunitiesInternal, {
    // 1. Use getGlobalTag as there's no specific user or ID filter for all communities
    // This tag ensures that if any community is created/updated/deleted, this cache is revalidated.
    tags: [getGlobalTag(CACHE_TAGS.communities)],
  });

  // 2. Pass only the 'limit' parameter to the cached function, as userId is not needed
  return cacheFn({ limit });
}

function getCommunitiesInternal({ limit }: { limit?: number }) {
  return db.query.CommunitiesTable.findMany({
    // 3. No 'where' clause needed as we're getting all communities
    orderBy: ({ createdAt }, { desc }) => desc(createdAt), // Order by creation date descending
    limit, // Apply the limit if provided
  });
}


export function getCommunitiesWithDetails(
  { limit }: { limit?: number } = {} // Optional limit for the number of communities
): Promise<CommunityWithDetails[]> {
  const cacheFn = dbCache(getCommunitiesWithDetailsInternal, {
    // This cache tag is global for all communities.
    // Any change to a community, user (if their community_id changes), or pickup
    // might necessitate revalidating this cache.
    // For simplicity, we'll invalidate the global 'communities' tag for relevant mutations.
    tags: [getGlobalTag(CACHE_TAGS.communities)],
  });

  return cacheFn({ limit });
}


async function getCommunitiesWithDetailsInternal({
  limit,
}: {
  limit?: number;
}): Promise<CommunityWithDetails[]> {
  // Select communities and use 'with' to load related users and pickups
  const communitiesWithRawData = await db.query.CommunitiesTable.findMany({
    orderBy: ({ createdAt }, { desc }) => desc(createdAt),
    limit,
    with: {
      users: {
        // Select all columns required by CommunityWithDetails.members
        columns: {
          id: true,
          createdAt: true,
          username: true,
          clerkUserId: true,
          community_id: true,
          points: true,
          rank: true,
          avatar_url: true,
        },
        orderBy: ({ points }, { desc }) => desc(points), // Order members by points, for example
      },
      pickups: {
        // We need all pickup columns to calculate sum and count later
        // Drizzle's `with` clause doesn't directly support aggregation
        // within the nested query itself for `findMany`.
        // So, we'll fetch them and then process in JavaScript or use a subquery if aggregation is complex.
        columns: {
          estimated_weight: true,
        },
      },
    },
  });

  // Now, process the data to aggregate pickups for each community
  const communitiesWithDetails = communitiesWithRawData.map((community) => {
    const totalKgTrashPicked = community.pickups.reduce(
      (sum, pickup) => sum + (pickup.estimated_weight || 0),
      0
    );
    const totalPickups = community.pickups.length;

    // Remove 'pickups' from the community object as it's no longer needed in the final output format for aggregation.
    const { /* pickups, */ ...communityData } = community;

    return {
      ...communityData,
      members: community.users,
      totalKgTrashPicked: totalKgTrashPicked,
      totalPickups: totalPickups,
    };
  });

  return communitiesWithDetails;
}


/**
 * Assigns a user to a specific community.
 * @param communityId The ID of the community to join.
 * @param userId The ID of the user (from your UsersTable, not Clerk's ID directly) to join the community.
 * @returns The updated user, or null if the user was not found or updated.
 */
export async function joinCommunity(
  communityId: string,
  userId: string // This `userId` is the `id` from your `UsersTable`, not `clerkUserId`
) {
  // First, verify that the community exists
  const communityExists = await db.query.CommunitiesTable.findFirst({
    where: eq(CommunitiesTable.id, communityId),
    columns: { id: true }, // Only need to select ID
  });

  if (!communityExists) {
    throw new Error("Community not found.");
  }

  // Check if the user is already associated with any community
  const currentUser = await db.query.UsersTable.findFirst({
    where: eq(UsersTable.id, userId),
    columns: { community_id: true },
  });

  if (currentUser?.community_id) {
    // If user is already in a community, and it's NOT the one they're trying to join
    // (though the frontend check should handle this too)
    if (currentUser.community_id !== communityId) {
       throw new Error("You are already a member of another community. Please leave your current community to join a new one.");
    }
    // If it's the same community, it's technically already joined, so just return
    // (or throw a specific error if you want to differentiate)
    throw new Error("You are already a member of this community.");
  }


  // Update the user's community_id
  const [updatedUser] = await db
    .update(UsersTable)
    .set({ community_id: communityId })
    .where(eq(UsersTable.id, userId)) // Update where your internal user ID matches
    .returning({
      id: UsersTable.id,
      clerkUserId: UsersTable.clerkUserId,
      community_id: UsersTable.community_id,
    });

  if (updatedUser != null) {
    // Revalidate relevant caches
    revalidateDbCache({
      tag: CACHE_TAGS.users,
      id: updatedUser.id,
      userId: updatedUser.clerkUserId,
    });

    revalidateDbCache({
      tag: CACHE_TAGS.communities,
      id: communityId, // Specific community details might change (member count)
    });

    // Revalidate the global communities list cache (as the list of members for a community might change)
    // This is important because the getCommunitiesWithDetails fetches members array length.
    revalidateDbCache({
      tag: CACHE_TAGS.communities,
      id: getGlobalTag(CACHE_TAGS.communities).split(":")[1], // Get the actual tag name from the global tag
    });
  }

  return updatedUser;
}
