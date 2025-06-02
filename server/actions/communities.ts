// server/actions/communities.ts
"use server";

import { redirect } from "next/navigation" // Import redirect here

import { CommunitiesSchema } from "@/schema/communities";
import { z } from "zod";
import {
    createCommunity as createCommunityDb,
    joinCommunity as joinCommunityDb,
    leaveCommunity as leaveCommunityDb, // Import leaveCommunity
} from "@/server/db/communities";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/drizzle/db";
import { UsersTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function createCommunity(
    unsafeData: z.infer<typeof CommunitiesSchema>
): Promise<{ error: boolean; message: string } | undefined> {
    const { success, data } = CommunitiesSchema.safeParse(unsafeData);

    if (!success) {
        return { error: true, message: "There was an error creating your product" };
    }

    try {
        const { id } = await createCommunityDb(data);
        console.log("Community created with ID:", id);
        // Move the redirect outside of try/catch
        return { error: false, message: "Community created successfully" };
    } catch (error) {
        console.error("Error creating community:", error);
        if (
            error instanceof Error &&
            error.message === "A community with this name already exists."
        ) {
            return {
                error: true,
                message:
                    "A community with this name already exists. Please choose a different name.",
            };
        }
        return {
            error: true,
            message: "An unexpected error occurred while creating the community.",
        };
    }
}


export async function joinCommunity(
    communityId: string
): Promise<{ error: boolean; message: string }> {
    const clerkUser = await currentUser();

    if (!clerkUser || !clerkUser.id) {
        return { error: true, message: "User not authenticated." };
    }

    // Find your internal user ID using Clerk's user ID
    const userInDb = await db.query.UsersTable.findFirst({
        where: eq(UsersTable.clerkUserId, clerkUser.id),
        columns: { id: true, community_id: true },
    });

    if (!userInDb) {
        return {
            error: true,
            message:
                "User profile not found in database. Please ensure your user profile is fully set up.",
        };
    }

    try {
        const updatedUser = await joinCommunityDb(communityId, userInDb.id);

        if (updatedUser) {
            console.log(`User ${updatedUser.id} joined community ${communityId}`);
            return { error: false, message: "Successfully joined community!" };
        } else {
            return {
                error: true,
                message: "Failed to join community: User not found or update failed.",
            };
        }
    } catch (error) {
        console.error("Error joining community:", error);
        if (error instanceof Error) {
            if (error.message.includes("already a member of another community")) {
                return { error: true, message: error.message };
            }
            if (error.message.includes("already a member of this community")) {
                return { error: true, message: error.message };
            }
            if (error.message === "Community not found.") {
                return {
                    error: true,
                    message: "The community you tried to join does not exist.",
                };
            }
            return {
                error: true,
                message: `Failed to join community: ${error.message}`,
            };
        }
        return {
            error: true,
            message: "An unexpected error occurred while joining the community.",
        };
    }
}

export async function leaveCommunity(): Promise<{ error: boolean; message: string }> {
    const clerkUser = await currentUser();

    if (!clerkUser || !clerkUser.id) {
        return { error: true, message: "User not authenticated." };
    }

    // Find your internal user ID and current community ID
    const userInDb = await db.query.UsersTable.findFirst({
        where: eq(UsersTable.clerkUserId, clerkUser.id),
        columns: { id: true, community_id: true },
    });

    if (!userInDb) {
        return {
            error: true,
            message: "User profile not found in database.",
        };
    }

    if (!userInDb.community_id) {
        return {
            error: true,
            message: "You are not currently a member of any community.",
        };
    }

    try {
        const updatedUser = await leaveCommunityDb(userInDb.id, userInDb.community_id);

        if (updatedUser) {
            console.log(`User ${updatedUser.id} left community`);
            redirect('/communities'); // Redirect after successful leave
            return { error: false, message: "Successfully left community!" }; // This won't be reached due to redirect
        } else {
            return {
                error: true,
                message: "Failed to leave community: User not found or update failed.",
            };
        }
    } catch (error) {
        console.error("Error leaving community:", error);
        if (error instanceof Error) {
            return {
                error: true,
                message: `Failed to leave community: ${error.message}`,
            };
        }
        return {
            error: true,
            message: "An unexpected error occurred while leaving the community.",
        };
    }
}