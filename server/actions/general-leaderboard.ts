// server/actions/leaderboard.ts
"use server";

import { getLeaderboardData, getCommunitiesForLeaderboard, LeaderboardEntry, CommunityLeaderboard,
  // LeaderboardTimeframe 
  } from "@/server/db/general-leaderboard";

export interface LeaderboardPageData {
  communities: CommunityLeaderboard[];
  leaderboard: {
    weekly: LeaderboardEntry[];
    monthly: LeaderboardEntry[];
    yearly: LeaderboardEntry[];
  };
  error?: string;
}

/**
 * Server action to fetch all data required for the leaderboard page.
 * This includes communities for the filter and leaderboard data for all timeframes.
 *
 * @param selectedCommunityId Optional: The ID of the community to filter the leaderboard by.
 * @returns Promise<LeaderboardPageData>
 */
export async function getLeaderboardPageData(
  selectedCommunityId?: string | null
): Promise<LeaderboardPageData> {
  try {
    const communities = await getCommunitiesForLeaderboard();

    // Fetch leaderboard data for all timeframes
    const [weekly, monthly, yearly] = await Promise.all([
      getLeaderboardData('weekly', selectedCommunityId === 'all' ? null : selectedCommunityId),
      getLeaderboardData('monthly', selectedCommunityId === 'all' ? null : selectedCommunityId),
      getLeaderboardData('yearly', selectedCommunityId === 'all' ? null : selectedCommunityId),
    ]);

    return {
      communities,
      leaderboard: {
        weekly,
        monthly,
        yearly,
      },
    };
  } catch (err) {
    console.error("Error in getLeaderboardPageData server action:", err);
    return {
      communities: [{ id: 'all', name: 'All Communities' }], // Provide a fallback
      leaderboard: {
        weekly: [],
        monthly: [],
        yearly: [],
      },
      error: "Failed to load leaderboard data. Please try again later.",
    };
  }
}