"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users } from "lucide-react";

interface Community {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  radius: number;
  memberCount: number;
  description?: string;
  tags?: string[];
}

interface CommunityListProps {
  onSelectCommunity: (communityId: string) => void;
  selectedCommunity: string | null;
}

// Dummy data for existing communities in Lagos, Nigeria
const dummyCommunities: Community[] = [
  {
    id: "1",
    name: "Victoria Island Green Initiative",
    location: { lat: 6.4281, lng: 3.4219 },
    radius: 1000,
    memberCount: 45,
    description: "Focused on urban sustainability and green spaces in Victoria Island business district.",
    tags: ["Urban", "Green Spaces", "Business District"]
  },
  {
    id: "2",
    name: "Ikoyi Sustainability Hub",
    location: { lat: 6.4498, lng: 3.4343 },
    radius: 1500,
    memberCount: 32,
    description: "Community dedicated to environmental conservation and sustainable living in Ikoyi.",
    tags: ["Conservation", "Sustainable Living", "Ikoyi"]
  },
  {
    id: "3",
    name: "Lekki Eco Warriors",
    location: { lat: 6.4698, lng: 3.5852 },
    radius: 800,
    memberCount: 28,
    description: "Grassroots environmental activism in the growing Lekki Peninsula area.",
    tags: ["Activism", "Community", "Lekki"]
  },
  {
    id: "4",
    name: "Mainland Climate Action",
    location: { lat: 6.5244, lng: 3.3792 },
    radius: 1200,
    memberCount: 51,
    description: "Fighting climate change through local action and education on Lagos Mainland.",
    tags: ["Climate", "Education", "Mainland"]
  }
];

export default function CommunityList({
  onSelectCommunity,
  selectedCommunity
}: CommunityListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Available Communities</h3>
        <Badge variant="secondary" className="text-xs">
          {dummyCommunities.length} communities
        </Badge>
      </div>
      
      <div className="grid gap-4 max-h-96 overflow-y-auto">
        {dummyCommunities.map((community) => (
          <Card
            key={community.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedCommunity === community.id
                ? "ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20"
                : "hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
            onClick={() => onSelectCommunity(community.id)}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-base leading-tight">
                      {community.name}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{community.memberCount} members</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{community.radius}m radius</span>
                      </div>
                    </div>
                  </div>
                  {selectedCommunity === community.id && (
                    <Badge className="bg-green-600 hover:bg-green-700">
                      Selected
                    </Badge>
                  )}
                </div>

                {/* Description */}
                {community.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {community.description}
                  </p>
                )}

                {/* Tags */}
                {community.tags && community.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {community.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs px-2 py-1"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Location */}
                <div className="text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 rounded p-2">
                  <span className="font-mono">
                    {community.location.lat.toFixed(4)}, {community.location.lng.toFixed(4)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {dummyCommunities.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No communities found in your area.</p>
          <p className="text-sm">Consider creating a new one!</p>
        </div>
      )}
    </div>
  );
}