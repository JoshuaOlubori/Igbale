// app/dashboard/page.tsx
// This file is a Server Component by default, no "use client" needed here.

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Camera, MapPin } from 'lucide-react';
import UserStats from '@/components/dashboard/user-stats';
import ActivityFeed from '@/components/dashboard/activity-feed'; // Correct import path
import CommunityLeaderboard from '@/components/dashboard/community-leaderboard';
import Link from 'next/link';
import { getDashboardActivityFeed } from '@/server/actions/activity-feed'; // Import the server action


export default async function Dashboard() { // Make it an async function
  const { activities, error } = await getDashboardActivityFeed(10); // Fetch data

  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Track your progress and impact.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            asChild
            className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
          >
            <Link href="/pickup/new">
              <Camera className="mr-2 h-4 w-4" />
              Record Pickup
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/map">
              <MapPin className="mr-2 h-4 w-4" />
              View Map
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        {/* UserStats can remain as is, assuming it fetches its own data or is static for now */}
        <UserStats />

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Community Activity</CardTitle>
              <CardDescription>
                Recent trash collections in your community
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error ? (
                <p className="text-red-500 text-center py-4">Error loading activity feed: {error}</p>
              ) : activities.length > 0 ? (
                <ActivityFeed activities={activities}/> // Pass the fetched activities to the component
              ) : (
                <p className="text-muted-foreground text-center py-4">No recent activities found.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Community Leaderboard</CardTitle>
              <CardDescription>
                See who&apos;s making the biggest impact this week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="weekly">
                <TabsList className="mb-4">
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="yearly">Yearly</TabsTrigger>
                </TabsList>
                <TabsContent value="weekly">
                  <CommunityLeaderboard timeframe="weekly" />
                </TabsContent>
                <TabsContent value="monthly">
                  <CommunityLeaderboard timeframe="monthly" />
                </TabsContent>
                <TabsContent value="yearly">
                  <CommunityLeaderboard timeframe="yearly" />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    
    </div>
  );
}