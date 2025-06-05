// app/dashboard/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react'; // Camera icon no longer needed here, it's in the dropdown
import UserStats from '@/components/dashboard/user-stats';
import ActivityFeed from '@/components/dashboard/activity-feed';
import CommunityLeaderboard from '@/components/dashboard/community-leaderboard';
import Link from 'next/link';
import { getDashboardActivityFeed } from '@/server/actions/activity-feed';
import { currentUser } from '@clerk/nextjs/server';
import { getUserCommunityId } from '@/server/db/communities';

// Import the new CaptureDropdown component
import CaptureDropdown from '@/components/dashboard/capture-dashboard';

export default async function Dashboard() {
  const { activities, error: activityError } = await getDashboardActivityFeed(10);

  const clerkUser = await currentUser();
  let userCommunityId: string | null = null;
  if (clerkUser) {
    userCommunityId = await getUserCommunityId(clerkUser.id);
  }

  const hasCommunity = userCommunityId !== null;

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
          {/* Replaced the old "Record Pickup" button with the new CaptureDropdown */}
          <CaptureDropdown hasCommunity={hasCommunity} />

          <Button asChild variant="outline">
            <Link href="/map">
              <MapPin className="mr-2 h-4 w-4" />
              View Map
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        <UserStats userCommunityId={userCommunityId} />

        <div className="md:col-span-2 space-y-6">
          {!hasCommunity ? (
            <Card className="p-6 text-center">
              <CardTitle className="mb-2">Join a community and track your progress!</CardTitle>
              <CardDescription className="mb-4">
                To start recording pickups, earning points, and appearing on the leaderboard,
                you need to be part of a community.
              </CardDescription>
              <Link href="/communities" passHref>
                <Button>Browse Communities</Button>
              </Link>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Community Activity</CardTitle>
                  <CardDescription>
                    Recent trash collections in your community
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activityError ? (
                    <p className="text-red-500 text-center py-4">Error loading activity feed: {activityError}</p>
                  ) : activities.length > 0 ? (
                    <ActivityFeed activities={activities}/>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}