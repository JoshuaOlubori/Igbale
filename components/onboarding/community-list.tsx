"use client"

import { useState } from 'react';
// import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

// Sample community data
const SAMPLE_COMMUNITIES = [
  { id: 'community-123', name: 'Greenville', members: 127, area: 'Downtown' },
  { id: 'community-456', name: 'River Park', members: 89, area: 'Riverside' },
  { id: 'community-789', name: 'Oakwood', members: 215, area: 'North Hills' },
  { id: 'community-101', name: 'Pine Ridge', members: 64, area: 'West Side' },
];

interface CommunityListProps {
  onSelectCommunity: (id: string) => void;
  selectedCommunity: string | null;
}

export default function CommunityList({ onSelectCommunity, selectedCommunity }: CommunityListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredCommunities = SAMPLE_COMMUNITIES.filter(community => 
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.area.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search communities..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        {filteredCommunities.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No communities found. Try a different search.
          </div>
        ) : (
          filteredCommunities.map(community => (
            <div
              key={community.id}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                selectedCommunity === community.id 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => onSelectCommunity(community.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{community.name}</h3>
                  <p className="text-sm text-muted-foreground">{community.area} • {community.members} members</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-muted-foreground">Active</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}