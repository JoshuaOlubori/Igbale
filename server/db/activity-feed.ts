// server/db/activity-feed.ts
import { db } from "@/drizzle/db";
import { ActivitiesTable, PickupsTable, CommunitiesTable } from "@/drizzle/schema";
import { CACHE_TAGS, revalidateDbCache, dbCache, getGlobalTag } from "@/lib/cache";
import { ActivityFeedItem } from "@/lib/types"; // Import the new types
import { eq } from "drizzle-orm";
import { formatDistanceToNowStrict } from "date-fns"; // For formatting timestamps
import { GeoJsonPoint } from "@/lib/types";

export async function getRecentActivities(
  communityId?: string, // Optional: filter by community
  limit: number = 10 // Default limit
): Promise<ActivityFeedItem[]> {
  const cacheFn = dbCache(getRecentActivitiesInternal, {
    // Cache tag for activities. Invalidate when new activities are added or pickups are updated.
    tags: [getGlobalTag(CACHE_TAGS.activities)], // Assuming you have a CACHE_TAGS.activities
  });

  return cacheFn({ communityId, limit });
}
async function getRecentActivitiesInternal({
  communityId,
  limit,
}: {
  communityId?: string;
  limit: number;
}): Promise<ActivityFeedItem[]> {
  const activities = await db.query.ActivitiesTable.findMany({
    where: communityId
      ? eq(CommunitiesTable.id, communityId)
      : undefined,
    orderBy: ({ created_at }, { desc }) => desc(created_at),
    limit: limit,
    with: {
      user: {
        columns: {
          username: true,
          avatar_url: true,
        },
      },
      pickup: {
        with: {
          community: {
            columns: {
              name: true,
              location: true,
            },
          },
        },
        columns: {
          location: true,
          estimated_weight: true,
          trash_type: true,
        },
      },
    },
  });

  return activities.map((activity) => {
    let locationString: string;

    // Safely check if pickup.location exists AND is an object AND has coordinates
    // We'll cast it to the GeoJsonPoint type for type safety after the check
    if (activity.pickup?.location && typeof activity.pickup.location === 'object' && 'coordinates' in activity.pickup.location) {
        const pickupLocation = activity.pickup.location as GeoJsonPoint;
        locationString = pickupLocation.name || `Lat: ${pickupLocation.coordinates[1].toFixed(2)}, Lon: ${pickupLocation.coordinates[0].toFixed(2)}`;
    } else if (activity.pickup?.community?.location && typeof activity.pickup.community.location === 'object' && 'coordinates' in activity.pickup.community.location) {
        const communityLocation = activity.pickup.community.location as GeoJsonPoint;
        locationString = communityLocation.name || `Lat: ${communityLocation.coordinates[1].toFixed(2)}, Lon: ${communityLocation.coordinates[0].toFixed(2)}`;
    }
    else {
      locationString = "Unknown location";
    }

    const points = activity.type === 'trash_pickup' && activity.pickup?.estimated_weight ? Math.round(activity.pickup.estimated_weight * 10) : 0;

    return {
      id: activity.id,
      user: {
        name: activity.user.username,
        avatar: activity.user.avatar_url,
      },
      type: activity.type === 'trash_pickup' ? 'collection' : 'reporting',
      location: locationString, // Use the determined location string
      timestamp: formatDistanceToNowStrict(activity.created_at, { addSuffix: true }),
      details: {
        weight: activity.pickup?.estimated_weight || 0,
        type: activity.pickup?.trash_type || "N/A",
        points: points,
      },
    };
  });
}

// Function to add a new activity (e.g., when a pickup is reported or completed)
export async function addActivity(
  data: typeof ActivitiesTable.$inferInsert
) {
  const [newActivity] = await db
    .insert(ActivitiesTable)
    .values(data)
    .returning({
      id: ActivitiesTable.id,
      userId: ActivitiesTable.user_id,
      type: ActivitiesTable.type,
      pickupId: ActivitiesTable.pickup_id,
      createdAt: ActivitiesTable.created_at,
    });

  if (newActivity) {
    // Revalidate the activities cache
    revalidateDbCache({
      tag: CACHE_TAGS.activities,
      id: getGlobalTag(CACHE_TAGS.activities).split(":")[1], // Revalidate global activity feed
    });
    // You might also want to revalidate user-specific caches if relevant
  }
  return newActivity;
}


// You will also need update functions for pickups if you are changing their status
// and want to reflect that in activity or trigger new activity entries.
// For example:
export async function updatePickupStatus(pickupId: string, status: typeof PickupsTable.$inferInsert['status']) {
  const [updatedPickup] = await db
    .update(PickupsTable)
    .set({ status: status })
    .where(eq(PickupsTable.id, pickupId))
    .returning({
      id: PickupsTable.id,
      communityId: PickupsTable.community_id,
      status: PickupsTable.status,
    });

  if (updatedPickup) {
    revalidateDbCache({
      tag: CACHE_TAGS.pickups, // Assuming a CACHE_TAGS.pickups
      id: updatedPickup.id,
    });
    // If updating pickup status constitutes a new 'activity' (e.g., trash_pickup done)
    // you would call addActivity here.
  }
  return updatedPickup;
}