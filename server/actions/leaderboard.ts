// server/actions/leaderboard.ts
"use server";

import { getLeaderboard as getLeaderboardDb } from "@/server/db/leaderboard";
import { LeaderboardEntry } from "@/lib/types"; // Import the type
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/drizzle/db";
import { UsersTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

type Timeframe = 'weekly' | 'monthly' | 'yearly';

export async function getCommunityLeaderboard(
  timeframe: Timeframe
): Promise<{
  leaderboard: LeaderboardEntry[];
  error?: string;
}> {
  try {
    const clerkUser = await currentUser();
    let communityId: string | undefined;

    if (clerkUser) {
      // Fetch the user from your database to get their communityId
      const userInDb = await db.query.UsersTable.findFirst({
        where: eq(UsersTable.clerkUserId, clerkUser.id),
        columns: {
          community_id: true,
        },
      });
      communityId = userInDb?.community_id || undefined;
    }

    const leaderboard = await getLeaderboardDb(timeframe, communityId);

    return { leaderboard };
  } catch (error) {
    console.error(`Error fetching ${timeframe} leaderboard:`, error);
    return { leaderboard: [], error: `Failed to load ${timeframe} leaderboard.` };
  }
}