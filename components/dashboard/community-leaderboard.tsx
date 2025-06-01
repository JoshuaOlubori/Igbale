// components/dashboard/community-leaderboard.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Medal, Trophy } from 'lucide-react';
import { motion } from '@/lib/framer-motion';
import { useEffect, useState } from 'react'; // Import hooks
import { getCommunityLeaderboard } from '@/server/actions/leaderboard'; // Import the server action
import { LeaderboardEntry } from '@/lib/types'; // Import the type
import { ClipLoader } from "react-spinners"; // For loading spinner

interface CommunityLeaderboardProps {
  timeframe: 'weekly' | 'monthly' | 'yearly';
}

export default function CommunityLeaderboard({ timeframe }: CommunityLeaderboardProps) {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { leaderboard, error: fetchError } = await getCommunityLeaderboard(timeframe);
        if (fetchError) {
          setError(fetchError);
        } else if (leaderboard) {
          setLeaderboardData(leaderboard);
        }
      } catch (err) {
        console.error(`Failed to fetch ${timeframe} leaderboard:`, err);
        setError(`Failed to load ${timeframe} leaderboard.`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [timeframe]); // Re-fetch whenever the timeframe prop changes

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <ClipLoader color="#36d7b7" size={30} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        {error}
      </div>
    );
  }

  if (leaderboardData.length === 0) {
    return (
      <div className="text-muted-foreground text-center py-4">
        No leaderboard data available for this timeframe.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {leaderboardData.slice(0, 3).map((user, index) => (
        <motion.div
          key={user.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className={`flex items-center justify-between p-3 rounded-lg ${
            index === 0
              ? 'bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/10 border border-amber-200 dark:border-amber-800/20'
              : index === 1
              ? 'bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/20 dark:to-slate-700/10 border border-slate-200 dark:border-slate-700/20'
              : index === 2
              ? 'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/10 border border-orange-200 dark:border-orange-800/20'
              : 'bg-muted/30'
          }`}
        >
          <div className="flex items-center gap-3">
            {index === 0 ? (
              <div className="w-8 h-8 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-amber-500" />
              </div>
            ) : index === 1 ? (
              <div className="w-8 h-8 flex items-center justify-center">
                <Medal className="h-6 w-6 text-slate-400" />
              </div>
            ) : index === 2 ? (
              <div className="w-8 h-8 flex items-center justify-center">
                <Medal className="h-6 w-6 text-orange-600" />
              </div>
            ) : (
              <div className="w-8 h-8 flex items-center justify-center text-muted-foreground font-medium">
                {index + 1}
              </div>
            )}

            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar || '/placeholder-avatar.jpg'} alt={user.name || 'User'} />
              <AvatarFallback>{(user.name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>

            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.collections} collections</div>
            </div>
          </div>

          <div className="text-right">
            <div className="font-bold text-lg">{user.points.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">points</div>
          </div>
        </motion.div>
      ))}

      {/* For users ranked 4th and below */}
      {leaderboardData.slice(3).map((user, index) => (
        <div key={user.id} className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center text-muted-foreground font-medium">
              {index + 4} {/* +4 because slice(3) means index 0 is rank 4 */}
            </div>

            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar || '/placeholder-avatar.jpg'} alt={user.name || 'User'} />
              <AvatarFallback>{(user.name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="font-medium">{user.name}</div>
          </div>

          <div className="font-medium">{user.points.toLocaleString()} pts</div>
        </div>
      ))}
    </div>
  );
}