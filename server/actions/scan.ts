"use server";

import { currentUser } from "@clerk/nextjs/server";
import {
  getUserInternalIdAndCommunityId,
  insertPickup,
  insertActivity,
  type NewPickupData,
} from "@/server/db/scan";

interface ScanResult {
  pickupId: string;
  weight: number;
  type: string;
  points: number;
  latitude: number;
  longitude: number;
  error?: string;
}

export async function createTrashReport(data: {
  imageUrls: string[];
  latitude: number;
  longitude: number;
  estimatedWeight: number;
  trashType: string;
}): Promise<ScanResult> {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return {
        error: "User not authenticated.",
      } as ScanResult;
    }

    // Get user's internal ID and community ID
    const userDetails = await getUserInternalIdAndCommunityId(clerkUser.id);
    if (!userDetails) {
      return {
        error: "User not found or not associated with a community.",
      } as ScanResult;
    }

    const { internalUserId, communityId } = userDetails;

    // 1. Create the pickup record
    const pickupData: NewPickupData = {
      communityId: communityId,
      location: { lat: data.latitude, lng: data.longitude },
      imageUrls: data.imageUrls,
      estimatedWeight: data.estimatedWeight,
      trashType: data.trashType,
      status: "pending",
    };

    const newPickup = await insertPickup(pickupData);

    // 2. Create the activity record
    await insertActivity(internalUserId, "trash_report", newPickup.id);

    // 3. Return the result
    return {
      pickupId: newPickup.id,
      weight: newPickup.estimated_weight,
      type: newPickup.trash_type,
      points: 0, // Points are awarded on pickup confirmation, not report
      latitude: data.latitude,
      longitude: data.longitude,
    };
  } catch (error) {
    console.error("Error in createTrashReport:", error);
    return {
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    } as ScanResult;
  }
}
