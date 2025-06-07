// server/actions/collect.ts
"use server";

import { db } from "@/drizzle/db";
import { ActivitiesTable, PickupsTable, UsersTable } from "@/drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS, getGlobalTag } from "@/lib/cache";
import { calculatePoints } from "@/lib/points"; // Import the new points calculation function

export async function confirmTrashCollection(
  userId: string,
  pickupId: string,
  // confidence: number
): Promise<{ success: boolean; pickupId?: string; error?: string }> {
  try {
    // 1. Verify the pickup exists and is in a 'pending' state
    const existingPickup = await db.query.PickupsTable.findFirst({
      where: eq(PickupsTable.id, pickupId),
      columns: { id: true, status: true, estimated_weight: true, community_id: true } // Retrieve estimated_weight
    });

    if (!existingPickup) {
      return { success: false, error: "Pickup not found." };
    }

    if (existingPickup.status !== 'pending') {
      return { success: false, error: "Pickup is not in a pending state." };
    }

    // 2. Calculate points for this pickup
    const pointsEarned = calculatePoints(existingPickup.estimated_weight || 0); // Use 0 if weight is null/undefined

    // 3. Update the status of the corresponding pickup in the PickupsTable to 'done'
    // AND populate the points_awarded field
    const [updatedPickup] = await db
      .update(PickupsTable)
      .set({ status: "done", points_awarded: pointsEarned }) // Set points_awarded
      .where(eq(PickupsTable.id, pickupId))
      .returning({ id: PickupsTable.id, communityId: PickupsTable.community_id, pointsAwarded: PickupsTable.points_awarded });

    if (!updatedPickup) {
      return { success: false, error: "Failed to update pickup status and award points." };
    }

    // 4. Add a new activity to the ActivitiesTable with type 'trash_pickup'
    const [newActivity] = await db.insert(ActivitiesTable).values({
      user_id: userId,
      type: "trash_pickup",
      pickup_id: updatedPickup.id,
    }).returning({ id: ActivitiesTable.id });

    if (!newActivity) {
      return { success: false, error: "Failed to record trash pickup activity." };
    }

    // 5. Update user's total points in UsersTable
    await db.update(UsersTable)
      .set({ points: sql`${UsersTable.points} + ${pointsEarned}` })
      .where(eq(UsersTable.id, userId));

    // 6. Revalidate caches
    revalidatePath("/dashboard");
    revalidateTag(getGlobalTag(CACHE_TAGS.activities));
    revalidateTag(`${CACHE_TAGS.pickups}:${updatedPickup.id}`);

    return { success: true, pickupId: updatedPickup.id };
  } catch (error) {
    console.error("Error confirming trash collection:", error);
    return { success: false, error: "An unexpected error occurred during collection confirmation." };
  }
}
