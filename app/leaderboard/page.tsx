// leaderboard/page.tsx
"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Medal, Trophy, Users } from 'lucide-react';
import { motion } from '@/lib/framer-motion';
import { ClipLoader } from "react-spinners";

// Import the server action and its types
import { getLeaderboardPageData, LeaderboardPageData } from "@/server/actions/general-leaderboard"; // Corrected import for action
import { LeaderboardEntry, CommunityLeaderboard, LeaderboardTimeframe } from '@/server/db/general-leaderboard'; // <--- CORRECTED: Import LeaderboardTimeframe from the DB file

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState<LeaderboardTimeframe>('weekly');
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>('all');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPageData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getLeaderboardPageData(selectedCommunityId);
        if (data.error) {
          setError(data.error);
        } else {
          setLeaderboardData(data);
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard page data:", err);
        setError("Failed to load leaderboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [selectedCommunityId]);

  const currentLeaderboard: LeaderboardEntry[] = leaderboardData?.leaderboard[timeframe] || [];
  const communities: CommunityLeaderboard[] = leaderboardData?.communities || [{ id: 'all', name: 'All Communities' }];

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground">
          See who&apos;s making the biggest impact in trash collection
        </p>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Top Contributors</CardTitle>
              <CardDescription>
                Ranked by points earned from trash collection
              </CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Select value={selectedCommunityId} onValueChange={setSelectedCommunityId}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select Community" />
                </SelectTrigger>
                <SelectContent>
                  {communities.map(community => (
                    <SelectItem key={community.id} value={community.id}>
                      {community.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <ClipLoader color="#36d7b7" size={50} />
              <p className="mt-4 text-muted-foreground">Loading leaderboard...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
              <p>Please try refreshing the page.</p>
            </div>
          ) : (
            <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as LeaderboardTimeframe)} className="mt-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">Yearly</TabsTrigger>
              </TabsList>

              <div className="mt-6">
                {['weekly', 'monthly', 'yearly'].map((period) => (
                  <TabsContent key={period} value={period} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                      {currentLeaderboard.slice(0, 3).map((user, index) => (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          className={`flex items-center gap-4 p-4 rounded-lg ${
                            index === 0
                              ? 'bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/10 border border-amber-200 dark:border-amber-800/20'
                              : index === 1
                                ? 'bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/20 dark:to-slate-700/10 border border-slate-200 dark:border-slate-700/20'
                                : index === 2
                                  ? 'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/10 border border-orange-200 dark:border-orange-800/20'
                                  : 'bg-muted/30'
                          }`}
                        >
                          {index === 0 ? (
                            <div className="w-12 h-12 flex items-center justify-center">
                              <Trophy className="h-8 w-8 text-amber-500" />
                            </div>
                          ) : index === 1 ? (
                            <div className="w-12 h-12 flex items-center justify-center">
                              <Medal className="h-8 w-8 text-slate-400" />
                            </div>
                          ) : index === 2 ? (
                            <div className="w-12 h-12 flex items-center justify-center">
                              <Medal className="h-8 w-8 text-orange-600" />
                            </div>
                          ) : (
                            <div className="w-12 h-12 flex items-center justify-center text-muted-foreground font-bold text-xl">
                              {index + 1}
                            </div>
                          )}

                          <Avatar className="h-12 w-12 border-2 border-background">
                            <AvatarImage src={user.avatar || undefined} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="font-medium text-lg">{user.name}</div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Users className="h-3 w-3" />
                              {user.community}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-bold text-xl">{user.points.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">{user.collections} collections</div>
                          </div>
                        </motion.div>
                      ))}

                      <div className="bg-muted/30 rounded-lg overflow-hidden">
                        <table className="w-full">
                          <tbody>
                            {currentLeaderboard.slice(3).map((user, index) => (
                              <tr key={user.id} className="border-b last:border-b-0 border-border">
                                <td className="py-3 px-4 whitespace-nowrap text-center">
                                  <div className="w-6 text-muted-foreground font-medium">
                                    {index + 4}
                                  </div>
                                </td>
                                <td className="py-3 px-4 whitespace-nowrap">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={user.avatar || undefined} alt={user.name} />
                                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">{user.name}</div>
                                      <div className="text-xs text-muted-foreground">{user.community}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4 whitespace-nowrap text-center">
                                  <div className="text-sm">{user.collections} collections</div>
                                </td>
                                <td className="py-3 px-4 whitespace-nowrap text-right">
                                  <div className="font-medium">{user.points.toLocaleString()}</div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}