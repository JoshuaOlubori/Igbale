// components/community/client-community-page.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Users, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';
import { motion } from '@/lib/framer-motion';
import Image from 'next/image';
import { useUser, RedirectToSignIn } from "@clerk/nextjs";
import { CommunityWithDetails } from '@/lib/types';
import { joinCommunity } from '@/server/actions/communities'; // Import the server action
import { useRouter } from 'next/navigation'; // Import useRouter for redirection
import { toast } from 'sonner'; // Import toast for notifications

interface ClientCommunityPageProps {
  initialCommunities: CommunityWithDetails[];
}

export default function ClientCommunityPage({ initialCommunities }: ClientCommunityPageProps) {
  const { isSignedIn, user } = useUser();
  const router = useRouter(); // Initialize router
  const [searchQuery, setSearchQuery] = useState('');
  const [communities] = useState<CommunityWithDetails[]>(initialCommunities);
  const [isJoining, setIsJoining] = useState<string | null>(null); // State to track which community is being joined

  // Handle authentication
  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleJoinCommunity = async (communityId: string) => {
    setIsJoining(communityId); // Set the community being joined
    try {
      const result = await joinCommunity(communityId);
      if (result.error) {
        toast.error("Failed to join community", {
          description: result.message,
        });
      } else {
        toast.success("Community Joined!", {
          description: result.message,
        });
        router.push('/dashboard'); // Redirect on success
      }
    } catch (error) {
      console.error("Client-side error joining community:", error);
      toast.error("An unexpected error occurred.", {
        description: "Please try again.",
      });
    } finally {
      setIsJoining(null); // Reset joining state
    }
  };

  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Communities</h1>
          <p className="text-muted-foreground">
            Discover and join communities in your area
          </p>
        </div>
        <Button asChild className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600">
          <Link href="/onboarding/community">
            <Plus className="mr-2 h-4 w-4" />
            Create New Community
          </Link>
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search communities..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCommunities.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground">No communities found.</p>
        ) : (
          filteredCommunities.map((community, index) => {
            // Determine if the current signed-in user is a member of this specific community
            const isMemberOfThisCommunity = user ? community.members.some(member => member.clerkUserId === user.id) : false;

            // Determine if the user is a member of ANY community
            // This relies on the 'user' object from Clerk and assumes your Drizzle 'UsersTable'
            // has a 'community_id' column that is populated upon joining.
            // If the `initialCommunities` were fetched *after* the user's Clerk profile was loaded,
            // `user.publicMetadata.community_id` or similar might be available.
            // For now, we'll assume `user.id` is linked to `community.members` and check if
            // the Clerk user's ID exists in *any* community's member list (if you don't have
            // a single `community_id` on the main Clerk `user` object).
            // A more robust way would be to fetch the user's community_id when the page loads
            // or directly from the Clerk user object if you sync that data.
            // For simplicity, let's assume `user.publicMetadata.community_id` is where you store it.
            // If not, you'd need another server action to fetch `UsersTable`'s community_id for the current clerk user.
            const userCurrentCommunityId = user?.publicMetadata?.community_id as string | undefined;
            const isMemberOfAnyCommunity = !!userCurrentCommunityId; // Check if the user has *any* community_id assigned

            const isActive = true; // Placeholder

            return (
              <motion.div
                key={community.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden h-full flex flex-col">
                  <div className="relative h-36">
                    <Image
                      src={community.cover_image || "/placeholder-community.jpg"}
                      alt={community.name}
                      width={500}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                      <h3 className="text-white font-bold text-xl drop-shadow-md">{community.name}</h3>
                      {isActive && (
                        <Badge variant="secondary" className="bg-green-500/90 text-white border-none">
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardContent className="flex-1 pt-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {community.location}
                      </div>

                      <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <Users className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">{community.members.length}</div>
                            <div className="text-xs text-muted-foreground">Members</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">{community.totalKgTrashPicked.toFixed(1)} kg</div>
                            <div className="text-xs text-muted-foreground">Collected</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0">
                    {isMemberOfThisCommunity ? (
                      // If the user is already a member of THIS specific community
                      <Button variant="secondary" className="w-full" asChild>
                        <Link href="/dashboard">View Community</Link>
                      </Button>
                    ) : isMemberOfAnyCommunity ? (
                      // If the user is a member of ANOTHER community
                      <Button
                        variant="destructive" // Indicate inability to join
                        className="w-full"
                        disabled={true} // Disable the button
                        onClick={() => toast.info("Already a Member", {
                          description: "You are already a member of a community. Leave your current community to join another.",
                        })}
                      >
                        Join Community
                      </Button>
                    ) : (
                      // If the user is not a member of any community
                      <Button
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
                        onClick={() => handleJoinCommunity(community.id)}
                        disabled={isJoining === community.id} // Disable while joining this specific community
                      >
                        {isJoining === community.id ? "Joining..." : "Join Community"}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}