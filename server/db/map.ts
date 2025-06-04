// server/db/map.ts
import { db } from "@/drizzle/db";
import {
 // CommunitiesTable,
  PickupsTable,
  UsersTable,
  ActivitiesTable, // Need ActivitiesTable for reporter info
 // ActivityTypeEnum // Need ActivityTypeEnum for filtering activities
} from "@/drizzle/schema";
import { eq, and,
  //  isNull,
     sql } from "drizzle-orm"; // Import sql for JSONB extraction
import { CACHE_TAGS, dbCache, getUserTag, getIdTag, getGlobalTag } from "@/lib/cache";
import { PointLocation } from "@/lib/types"; // Adjust import based on your types file
// import { unstable_noStore as noStore } from "@vercel/nextjs-cors/headers"; // Or if not using Vercel, adjust or remove

export async function getUserCommunityDetails(clerkUserId: string) {
  const cacheFn = dbCache(getUserCommunityDetailsInternal, {
    tags: [getUserTag(clerkUserId, CACHE_TAGS.users), getGlobalTag(CACHE_TAGS.communities)],
  });

  return cacheFn({ clerkUserId });
}

async function getUserCommunityDetailsInternal({ clerkUserId }: { clerkUserId: string }) {
  console.log(`[getUserCommunityDetailsInternal] Attempting to find user for clerkUserId: ${clerkUserId}`);

  const userWithCommunity = await db.query.UsersTable.findFirst({
    where: eq(UsersTable.clerkUserId, clerkUserId),
    columns: {
      id: true,
      community_id: true,
    },
    with: {
      community: {
        columns: {
          id: true,
          name: true,
          point_location: true, // Fetch the jsonb point_location
          radius: true,
        },
      },
    },
  });

  console.log("[getUserCommunityDetailsInternal] Raw userWithCommunity query result:", JSON.stringify(userWithCommunity, null, 2));

  if (!userWithCommunity) {
    console.warn(`[getUserCommunityDetailsInternal] User not found for clerkUserId: ${clerkUserId}`);
    return null;
  }

  if (userWithCommunity.community_id === null) {
    console.warn(`[getUserCommunityDetailsInternal] User found, but community_id is null for user ID: ${userWithCommunity.id}`);
    return null;
  }

  if (!userWithCommunity.community) {
    console.warn(`[getUserCommunityDetailsInternal] User found with community_id: ${userWithCommunity.community_id}, but related community data is missing.`);
    return null;
  }

  console.log("[getUserCommunityDetailsInternal] User and community data retrieved successfully.");

  // **FIX IS HERE:** Extract latitude and longitude directly from 'lat' and 'lng' properties
  const communityPointLocation = userWithCommunity.community.point_location as PointLocation;
  const communityLatitude = communityPointLocation?.lat;
  const communityLongitude = communityPointLocation?.lng;

  console.log(`[getUserCommunityDetailsInternal] Extracted Community Latitude: ${communityLatitude}, Longitude: ${communityLongitude}`);
  console.log(`[getUserCommunityDetailsInternal] Full point_location object:`, userWithCommunity.community.point_location);


  if (typeof communityLatitude !== 'number' || typeof communityLongitude !== 'number') {
    console.error("Community point_location coordinates are invalid for community:", userWithCommunity.community.id, userWithCommunity.community.point_location);
    return null; // Invalid coordinates
  }

  return {
    userId: userWithCommunity.id,
    community: {
      id: userWithCommunity.community.id,
      name: userWithCommunity.community.name,
      latitude: communityLatitude,
      longitude: communityLongitude,
      radius: userWithCommunity.community.radius,
    },
  };
}

export type ActivePickup = {
  id: string;
  latitude: number;
  longitude: number;
  trash_type: string;
  estimated_weight: number | null;
  image_urls: string[] | null;
  reported_at: Date | null; // <-- Changed to Date | null
  reported_by_username: string | null; // <-- Changed to string | null
};


export async function getActivePickupsInCommunity(communityId: string): Promise<ActivePickup[]> {
  const cacheFn = dbCache(getActivePickupsInCommunityInternal, {
    tags: [
      getIdTag(communityId, CACHE_TAGS.communities),
      getGlobalTag(CACHE_TAGS.pickups),
      getGlobalTag(CACHE_TAGS.activities), // Activities now affect pickups being displayed
      getGlobalTag(CACHE_TAGS.users) // Usernames are also involved
    ],
  });

  return cacheFn({ communityId });
}

async function getActivePickupsInCommunityInternal({ communityId }: { communityId: string }): Promise<ActivePickup[]> {
  const pickups = await db
    .select({
      id: PickupsTable.id,
       latitude: sql<number>`(pickups.location->>'lat')::float`, // Extract 'lat' property and cast to float
      longitude: sql<number>`(pickups.location->>'lng')::float`, // Extract 'lng' property and cast to floatExtract longitude (index 0)
      trash_type: PickupsTable.trash_type,
      estimated_weight: PickupsTable.estimated_weight,
      image_urls: PickupsTable.image_urls,
      reported_at: ActivitiesTable.created_at, // Get reported_at from ActivitiesTable
      reported_by_username: UsersTable.username, // Get username from UsersTable via Activities
    })
    .from(PickupsTable)
    .leftJoin(ActivitiesTable,
      and(
        eq(ActivitiesTable.pickup_id, PickupsTable.id),
        eq(ActivitiesTable.type, 'trash_report') // Crucial: only get the 'trash_report' activity for this pickup
      )
    )
    .leftJoin(UsersTable, eq(ActivitiesTable.user_id, UsersTable.id)) // Join UsersTable via ActivitiesTable
    .where(
      and(
        eq(PickupsTable.community_id, communityId),
        eq(PickupsTable.status, 'pending') // Use the 'pending' status for active trash
      )
    );
   
console.log("[getActivePickupsInCommunityInternal] Raw pickups query result:", JSON.stringify(pickups, null, 2));
  // Filter out any pickups that might have missing reporter info due to join issues
  return pickups.filter(p => p.reported_by_username !== null && p.reported_at !== null) as ActivePickup[];
}