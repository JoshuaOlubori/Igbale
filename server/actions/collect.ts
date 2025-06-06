// server/actions/collect.ts
"use server";

import { db } from "@/drizzle/db";
import { ActivitiesTable, PickupsTable, UsersTable } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache"; // Import revalidatePath and revalidateTag
import { CACHE_TAGS, getGlobalTag } from "@/lib/cache"; // Assuming these are defined in your cache utility
import { sql } from "drizzle-orm";

export async function confirmTrashCollection(
  userId: string,
  confidence: number
): Promise<{ success: boolean; pickupId?: string; error?: string }> {
  try {
    // 1. Find the latest 'trash_report' activity by the user that is still 'pending'
    // This assumes a user typically collects the trash they reported.
    const latestPendingReportActivity = await db.query.ActivitiesTable.findFirst({
      where: eq(ActivitiesTable.user_id, userId),
      orderBy: desc(ActivitiesTable.created_at),
      with: {
        pickup: {
          columns: {
            id: true,
            status: true,
          },
        },
      },
    });

    // Check if a pending report exists and is associated with a pickup
    if (!latestPendingReportActivity || latestPendingReportActivity.type !== 'trash_report' || !latestPendingReportActivity.pickup?.id || latestPendingReportActivity.pickup.status !== 'pending') {
      return { success: false, error: "No pending trash report found for this user." };
    }

    const pickupIdToUpdate = latestPendingReportActivity.pickup.id;

    // 2. Update the status of the corresponding pickup in the PickupsTable to 'done'
    const [updatedPickup] = await db
      .update(PickupsTable)
      .set({ status: "done" })
      .where(eq(PickupsTable.id, pickupIdToUpdate))
      .returning({ id: PickupsTable.id, communityId: PickupsTable.community_id });

    if (!updatedPickup) {
      return { success: false, error: "Failed to update pickup status." };
    }

    // 3. Add a new activity to the ActivitiesTable with type 'trash_pickup'
    const [newActivity] = await db.insert(ActivitiesTable).values({
      user_id: userId,
      type: "trash_pickup",
      pickup_id: updatedPickup.id,
    }).returning({ id: ActivitiesTable.id });

    if (!newActivity) {
      return { success: false, error: "Failed to record trash pickup activity." };
    }

    // 4. Update user points (optional, but good for gamification)
    // You might want to calculate points based on weight or AI confidence,
    // For simplicity, let's just add a fixed amount or confidence as points
    const pointsEarned = Math.round(confidence * 0.5); // Example: 50 points for 100% confidence
    await db.update(UsersTable)
      .set({ points: sql`${UsersTable.points} + ${pointsEarned}` }) // Increment points
      .where(eq(UsersTable.id, userId));

    // 5. Revalidate caches
    revalidatePath("/dashboard"); // Revalidate dashboard to show updated activities/points
    revalidateTag(getGlobalTag(CACHE_TAGS.activities)); // Revalidate global activity feed
    revalidateTag(`${CACHE_TAGS.pickups}:${updatedPickup.id}`); // Revalidate specific pickup cache

    return { success: true, pickupId: updatedPickup.id };
  } catch (error) {
    console.error("Error confirming trash collection:", error);
    return { success: false, error: "An unexpected error occurred during collection confirmation." };
  }
}
