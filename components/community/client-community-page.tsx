// app/communities/client-community-page.tsx
"use client"; // This is explicitly a client component

import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Users, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';
import { motion } from '@/lib/framer-motion'; // Motion must be a client component
import Image from 'next/image';
import { useUser, 
   // SignInButton,
     RedirectToSignIn } from "@clerk/nextjs";
import { CommunityWithDetails } from '@/lib/types'; // Type import

interface ClientCommunityPageProps {
  initialCommunities: CommunityWithDetails[];
}

export default function ClientCommunityPage({ initialCommunities }: ClientCommunityPageProps) {
  const { isSignedIn, user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [communities] = useState<CommunityWithDetails[]>(initialCommunities); // Initialize with server-fetched data

  // Handle authentication
  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            const isMember = user ? community.members.some(member => member.clerkUserId === user.id) : false;
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
                    {isMember ? (
                      <Button variant="secondary" className="w-full" asChild>
                        <Link href={`/communities/${community.id}`}>View Community</Link>
                      </Button>
                    ) : (
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600" asChild>
                        <Link href={`/communities/${community.id}/join`}>Join Community</Link>
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