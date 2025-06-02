// components/dashboard/user-stats.tsx
"use client";

import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Award, Trash2, LogOut } from 'lucide-react';
import { ClipLoader } from "react-spinners";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { motion } from '@/lib/framer-motion';
import { useEffect, useState } from "react";
import { getDashboardUserStats } from "@/server/actions/user-stats";
import { UserStatsData } from "@/lib/types";
import { leaveCommunity } from "@/server/actions/communities";
import { Button } from "../ui/button";
import Link from "next/link"; // Use Link for client-side navigation
// import { useRouter } from 'next/navigation'; // Keep useRouter for potential future client-side uses or type hints

interface UserStatsProps {
  userCommunityId: string | null;
}

export default function UserStats({ userCommunityId }: UserStatsProps) {
  const {  isLoaded: isClerkLoaded } = useUser();
  const [userData, setUserData] = useState<UserStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);
  // const router = useRouter(); // Initialize router (can be useful for router.refresh() later)

  useEffect(() => {
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
            setError("User stats not found.");
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
  }, [isClerkLoaded, userData, isLoading]);

  const handleLeaveCommunity = async () => {
    if (!confirm("Are you sure you want to leave your community? You will lose access to community-specific features and your progress will no longer contribute to its leaderboard.")) {
      return;
    }
    setIsLeaving(true);
    try {
      // Call the server action. It will redirect directly.
      await leaveCommunity();
      // Code here will NOT be reached if redirect is successful
      // If the Server Action throws a non-redirect error, it will be caught below
    } catch (err: any ) // eslint-disable-line @typescript-eslint/no-explicit-any
     { 
      // Use any for the error type to catch NEXT_REDIRECT 
      // Next.js redirect throws a special error object.
      // We check for the 'NEXT_REDIRECT' digest to confirm it's a redirect.
      // If it's a redirect, we don't need to do anything, as the navigation will happen.
      if (err && err.digest && err.digest.startsWith('NEXT_REDIRECT')) {
        // This is the expected behavior for a redirect, so do nothing here.
        // The page will navigate.
        console.log("Redirect initiated by server action.");
      } else {
        // This is a genuine error from the server action (e.g., authentication fail, DB error)
        console.error("Error leaving community:", err);
        alert(`Failed to leave community: ${err.message || "An unknown error occurred."}`);
      }
    } finally {
      // Only set isLeaving to false if it's NOT a redirect (i.e., if an actual error occurred
      // and the component is still mounted and visible).
      // If it's a redirect, the component will unmount, and this state update is irrelevant.
      // However, for robustness, keep it here.
      setIsLeaving(false);
    }
  };


  if (isLoading || !isClerkLoaded) {
    return (
      <Card className="h-full flex items-center justify-center p-6">
        <ClipLoader color="#36d7b7" size={50} />
      </Card>
    );
  }

  // If user is logged in but has no community_id, display the "Join a community" message
  if (!userCommunityId) {
    return (
      <Card className="h-full flex flex-col justify-center items-center p-6 text-center">
        <CardTitle className="mb-2">Not in a community</CardTitle>
        <CardDescription className="mb-4">
          Join a community to start tracking your individual progress, earn points, and contribute to local cleanup efforts!
        </CardDescription>
        <Link href="/communities" passHref>
          <Button>Browse Communities</Button>
        </Link>
      </Card>
    );
  }

  // If there's an error loading user stats (and they are in a community)
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
                  <span className="text-base">{badge.icon || "✨"}</span>
                  {badge.name}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Leave Community Button */}
        <div className="pt-4 border-t mt-6">
          <Button
            variant="outline"
            className="w-full text-red-500 hover:text-red-600 border-red-300 hover:border-red-500"
            onClick={handleLeaveCommunity}
            disabled={isLeaving}
          >
            {isLeaving ? (
              <ClipLoader color="currentColor" size={16} />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            {isLeaving ? 'Leaving...' : 'Leave Community'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}