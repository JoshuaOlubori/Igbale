import { db } from "@/drizzle/db"
import { CommunitiesTable } from "@/drizzle/schema"
import { CACHE_TAGS, revalidateDbCache, dbCache, getGlobalTag } from "@/lib/cache"
import { eq } from "drizzle-orm"
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