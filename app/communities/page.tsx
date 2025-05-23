"use client"

import { useState } from 'react';
import { Card, CardContent, 
    // CardDescription, 
    CardFooter, 
    // CardHeader,
    // CardTitle
     } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Users, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';
import { motion } from '@/lib/framer-motion';
import Image from 'next/image';

// Sample data
const COMMUNITIES = [
  { 
    id: 'community-123', 
    name: 'Greenville', 
    location: 'Downtown',
    members: 127, 
    trashCollected: 534,
    image: 'https://images.pexels.com/photos/417344/pexels-photo-417344.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    isActive: true,
    isMember: true,
  },
  { 
    id: 'community-456', 
    name: 'River Park', 
    location: 'Riverside',
    members: 89, 
    trashCollected: 375,
    image: 'https://images.pexels.com/photos/1755683/pexels-photo-1755683.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    isActive: true,
    isMember: false,
  },
  { 
    id: 'community-789', 
    name: 'Oakwood', 
    location: 'North Hills',
    members: 215, 
    trashCollected: 892,
    image: 'https://images.pexels.com/photos/1552212/pexels-photo-1552212.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    isActive: true,
    isMember: false,
  },
  { 
    id: 'community-101', 
    name: 'Pine Ridge', 
    location: 'West Side',
    members: 64, 
    trashCollected: 213,
    image: 'https://images.pexels.com/photos/1292115/pexels-photo-1292115.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    isActive: true,
    isMember: false,
  },
];

export default function CommunitiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredCommunities = COMMUNITIES.filter(community => 
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
        {filteredCommunities.map((community, index) => (
          <motion.div
            key={community.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="overflow-hidden h-full flex flex-col">
              <div className="relative h-36">
                <Image 
                  src={community.image} 
                  alt={community.name} 
                  width={500}
                    height={200}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                  <h3 className="text-white font-bold text-xl drop-shadow-md">{community.name}</h3>
                  {community.isActive && (
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
                        <div className="text-sm font-medium">{community.members}</div>
                        <div className="text-xs text-muted-foreground">Members</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{community.trashCollected} kg</div>
                        <div className="text-xs text-muted-foreground">Collected</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="pt-0">
                {community.isMember ? (
                  <Button variant="secondary" className="w-full">
                    View Community
                  </Button>
                ) : (
                  <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600">
                    Join Community
                  </Button>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}