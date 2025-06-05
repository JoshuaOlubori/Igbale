// server/db/scan.ts
import { db } from "@/drizzle/db";
import {
  PickupsTable,
  ActivitiesTable,
  UsersTable,
  ActivityTypeEnum, // StatusEnum
} from "@/drizzle/schema";
import { eq } from "drizzle-orm";
// import { CACHE_TAGS, dbCache, getUserTag, getIdTag, getGlobalTag } from "@/lib/cache";
// import { sql } from "drizzle-orm"; // For JSONB insertion

export interface NewPickupData {
  communityId: string;
  location: { lat: number; lng: number };
  imageUrls: string[];
  estimatedWeight: number;
  trashType: string;
  status?: "pending" | "active" | "done";
}

export interface InsertedPickup {
  id: string;
  community_id: string;
  location: { lat: number; lng: number };
  image_urls: string[];
  estimated_weight: number;
  trash_type: string;
  status: "pending" | "active" | "done";
}

/**
 * Inserts a new trash pickup record into the PickupsTable.
 * @param data New pickup data including community ID, location, image URLs, estimated weight, and trash type.
 * @returns The inserted pickup record.
 */
export async function insertPickup(
  data: NewPickupData
): Promise<InsertedPickup> {
  // Invalidate cache for pickups and the specific community's pickups
  // Note: For real-time updates, you might want to revalidate the map data cache after this.
  // This is handled by the `revalidateTag` in the action/route handler.

  const [newPickup] = await db
    .insert(PickupsTable)
    .values({
      community_id: data.communityId,
      location: data.location, // Drizzle should handle JSONB insertion directly
      image_urls: data.imageUrls,
      estimated_weight: data.estimatedWeight,
      trash_type: data.trashType,
      status: data.status || "pending", // Default status for newly reported trash
    })
    .returning();

  if (!newPickup) {
    throw new Error("Failed to insert new pickup.");
  }

  // Drizzle returns the JSONB as an object, ensure it matches the type
  const insertedPickup: InsertedPickup = {
    id: newPickup.id,
    community_id: newPickup.community_id,
    location: newPickup.location as { lat: number; lng: number }, // Cast to ensure type correctness
    image_urls: newPickup.image_urls,
    estimated_weight: newPickup.estimated_weight,
    trash_type: newPickup.trash_type,
    status: newPickup.status,
  };

  return insertedPickup;
}

/**
 * Inserts a new activity record into the ActivitiesTable.
 * @param userId The internal user ID performing the activity.
 * @param type The type of activity (e.g., 'trash_report', 'trash_pickup').
 * @param pickupId Optional: The ID of the pickup related to this activity.
 * @returns The ID of the newly inserted activity.
 */
export async function insertActivity(
  userId: string,
  type: (typeof ActivityTypeEnum.enumValues)[number], // Use Drizzle's enum values type
  pickupId?: string | null
): Promise<string> {
  const [newActivity] = await db
    .insert(ActivitiesTable)
    .values({
      user_id: userId,
      type: type,
      pickup_id: pickupId,
      created_at: new Date(), // Explicitly set, though defaultNow() should handle it
    })
    .returning({ id: ActivitiesTable.id });

  if (!newActivity) {
    throw new Error("Failed to insert new activity.");
  }

  return newActivity.id;
}

/**
 * Retrieves a user's internal ID and their associated community ID based on Clerk user ID.
 * @param clerkUserId The Clerk user ID.
 * @returns An object containing the user's internal ID and community ID, or null if not found/no community.
 */
export async function getUserInternalIdAndCommunityId(
  clerkUserId: string
): Promise<{ internalUserId: string; communityId: string } | null> {
  const user = await db.query.UsersTable.findFirst({
    where: eq(UsersTable.clerkUserId, clerkUserId),
    columns: {
      id: true,
      community_id: true,
    },
  });

  if (!user || !user.community_id) {
    return null;
  }

  return {
    internalUserId: user.id,
    communityId: user.community_id,
  };
}
