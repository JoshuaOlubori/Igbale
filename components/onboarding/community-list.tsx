// components/onboarding/community-list.tsx
"use client"; // This component must be a Client Component to handle user interaction (onClick)

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users } from "lucide-react";
import { ClipLoader } from "react-spinners"; // For loading indicator

// Assuming this type is available in your lib/types.ts
interface Community {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  radius: number;
  memberCount: number; // This needs to be calculated or fetched
  description?: string;
  tags?: string[]; // If your DB schema supports tags
  point_location: {
    lat: number;
    lng: number;
  };
}

// Interface for the detailed community data coming from the server
// This should match the return type of `getCommunitiesWithDetails` from `server/db/communities.ts`
// Assuming it returns something similar to this structure:
interface CommunityWithDetailsForClient {
  id: string;
  name: string;
  description: string | null;
  point_location: {
    lat: number;
    lng: number;
  };
  radius: number;
  createdAt: Date;
  created_by_user_id: string | null;
  members: { // Assuming 'users' are renamed to 'members' in the return type
    id: string;
    username: string;
    avatar_url: string | null;
    // ...other user properties you might fetch
  }[];
  totalKgTrashPicked: number;
  totalPickups: number;
  // tags?: string[]; // Uncomment if you add tags to your DB schema and fetch them
}


interface CommunityListProps {
  onSelectCommunity: (communityId: string) => void;
  selectedCommunity: string | null;
}

export default function CommunityList({
  onSelectCommunity,
  selectedCommunity,
}: CommunityListProps) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCommunities() {
      setLoading(true);
      setError(null);
      try {
        // Option 1: Call a Server Action directly if it's safe to import here
        // import { getCommunitiesWithDetails } from "@/server/db/communities";
        // const fetchedData = await getCommunitiesWithDetails({ limit: 100 });

        // Option 2 (Safer for Client Components): Call an API route
        const response = await fetch('/api/communities-list'); // Create this API route
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const fetchedData: CommunityWithDetailsForClient[] = await response.json();

        // Transform the fetched data to match the local `Community` interface for rendering
        const transformedCommunities: Community[] = fetchedData.map(dbCommunity => ({
          id: dbCommunity.id,
          name: dbCommunity.name,
          location: dbCommunity.point_location, // Use point_location for display
          radius: dbCommunity.radius,
          memberCount: dbCommunity.members.length, // Calculate member count
          description: dbCommunity.description || undefined,
          // tags: dbCommunity.tags || undefined, // Uncomment if tags are fetched
          point_location: dbCommunity.point_location, // Keep for internal use if needed
        }));

        setCommunities(transformedCommunities);
      } catch (err) {
        console.error("Failed to fetch communities:", err);
        setError("Failed to load communities. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchCommunities();
  }, []); // Empty dependency array means this runs once on mount

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <ClipLoader color="#36d7b7" size={50} />
        <p className="mt-4 text-muted-foreground">Loading communities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>{error}</p>
        <p>Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Available Communities</h3>
        <Badge variant="secondary" className="text-xs">
          {communities.length} communities
        </Badge>
      </div>

      <div className="grid gap-4 max-h-96 overflow-y-auto">
        {communities.length > 0 ? (
          communities.map((community) => (
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

                  {/* Tags (uncomment if you add tags to your DB schema and fetch them) */}
                  {/* {community.tags && community.tags.length > 0 && (
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
                  )} */}

                  {/* Location */}
                  <div className="text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 rounded p-2">
                    <span className="font-mono">
                      Lat: {community.location.lat.toFixed(4)}, Lng: {community.location.lng.toFixed(4)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No communities found.</p>
            <p className="text-sm">Consider creating a new one!</p>
          </div>
        )}
      </div>
    </div>
  );
}