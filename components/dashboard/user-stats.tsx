// dashboard/components/user-stats.tsx
"use client";

import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Award, Trash2 } from 'lucide-react';
import { ClipLoader } from "react-spinners";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { motion } from '@/lib/framer-motion';
import { useEffect, useState } from "react"; // Import useEffect and useState
import { getDashboardUserStats } from "@/server/actions/user-stats"; // Import the server action
import { UserStatsData } from "@/lib/types"; // Import the type

export default function UserStats() {
  const {  isLoaded: isClerkLoaded } = useUser();
  const [userData, setUserData] = useState<UserStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch data if Clerk user is loaded and not already loading/loaded
    if (isClerkLoaded && !userData && isLoading) {
      const fetchStats = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const { userStats, error: fetchError } = await getDashboardUserStats();
          if (fetchError) {
            setError(fetchError);
          } else if (userStats) {
            setUserData(userStats);
          } else {
            setError("User stats not found."); // Case where userStats is null but no specific error
          }
        } catch (err) {
          console.error("Failed to fetch user stats:", err);
          setError("Failed to load user statistics due to an unexpected error.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchStats();
    }
  }, [isClerkLoaded, userData, isLoading]); // Depend on clerk loaded state to trigger fetch

  if (isLoading || !isClerkLoaded) {
    return (
      <Card className="h-full flex items-center justify-center p-6">
        <ClipLoader color="#36d7b7" size={50} />
      </Card>
    );
  }

  if (error || !userData) {
    return (
      <Card className="h-full flex items-center justify-center p-6 text-center text-red-500">
        <p>{error || "Could not load user data."}</p>
      </Card>
    );
  }

  const progressPercentage = (userData.points / userData.nextLevel) * 100;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12 border-2 border-primary">
            <AvatarImage src={userData.avatar || '/placeholder-avatar.jpg'} alt={userData.name || 'User'} />
            <AvatarFallback>{(userData.name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{userData.name}</CardTitle>
            <CardDescription>
              {userData.community} Community • Rank #{userData.rank}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-end text-sm">
            <span className="font-medium">{userData.points} Points</span>
            <span className="text-muted-foreground">{userData.nextLevel} Next Level</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
              <Trash2 className="h-4 w-4" />
            </div>
            <div>
              <div className="text-lg font-bold">{userData.trashCollected} kg</div>
              <div className="text-xs text-muted-foreground">Collected</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <div className="text-lg font-bold">{userData.badges.length}</div>
              <div className="text-xs text-muted-foreground">Badges</div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3">Recent Badges</h3>
          <div className="flex flex-wrap gap-2">
            {userData.badges.map((badge) => (
              <motion.div
                key={badge.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Badge variant="outline" className="px-2 py-1 flex items-center gap-1 text-sm bg-background">
                  {/* You might need to map your badge icon string to an actual emoji or component */}
                  <span className="text-base">{badge.icon || "✨"}</span>
                  {badge.name}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}