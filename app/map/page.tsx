// map/page.tsx
"use client";

import { useState, useEffect } from "react";
import { ClipLoader } from "react-spinners"; // Assuming you still use this for loading
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { getMapData, MapPageData } from "@/server/actions/map";

// Import your new MapPage component
import FixedMap from "@/components/map/fixed-map";

export default function HomePage() { // Renamed from MapPage to avoid conflict with the component
  const [mapData, setMapData] = useState<MapPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch map data from server
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getMapData();
      setMapData(data);
      if (data.error) {
        setError(data.error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="space-y-4 text-center">
          <h2 className="text-xl font-bold">Loading Map Data...</h2>
          <p className="text-muted-foreground">
            Fetching community and trash information.
          </p>
          <ClipLoader color="#36d7b7" size={50} />
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Map error:", error);
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <CardTitle className="text-2xl text-red-500 mb-4">
            Map Error
          </CardTitle>
          <CardDescription className="mb-6">{error}</CardDescription>
          {error.includes("not currently a member") && (
            <Button onClick={() => (window.location.href = "/communities")}>
              Join a Community
            </Button>
          )}
          {!error.includes("not currently a member") && (
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          )}
        </Card>
      </div>
    );
  }

  // If mapData is loaded and no error, but community is null (user not in community), show join message
  if (!mapData?.community) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <CardTitle className="text-2xl mb-4">No Community Found</CardTitle>
          <CardDescription className="mb-6">
            You need to be a member of a community to view the map and track
            trash. Join one to start making an impact!
          </CardDescription>
          <Button onClick={() => (window.location.href = "/communities")}>
            Browse Communities
          </Button>
        </Card>
      </div>
    );
  }

  // If we reach here, mapData.community exists and is valid.
  // Prepare props for the FixedMap component.
  // Note: Your FixedMap expects `pickups` with `location: { lat, lng }`.
  // The `getMapData` action returns `activePickups` where the lat/lng are direct numbers.
  // We need to transform `activePickups` to match the `FixedMap`'s `Pickup` interface.
  const transformedPickups = mapData.activePickups.map(pickup => ({
    id: pickup.id,
    location: {
      lat: pickup.latitude,
      lng: pickup.longitude,
    },
    trash_type: pickup.trash_type,
    estimated_weight: pickup.estimated_weight,
    image_urls: pickup.image_urls,
    reported_at: pickup.reported_at,
    reported_by_username: pickup.reported_by_username
  }));

  // For userLocation, the FixedMap component has a default, but if you want
  // to pass a more precise user location, you'd fetch it here (e.g., using navigator.geolocation)
  // For now, we'll use the community center as a reasonable default for centering the map
  // if a specific user location isn't tracked yet in this higher-level component.
  const userLat = mapData.community.latitude;
  const userLng = mapData.community.longitude;


  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      <div className="relative z-10 px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-lg">
            Community Map - {mapData.community.name}
          </h1>
          {/* You might want to move these buttons into FixedMap or reconsider their placement */}
          {/* <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </Button>
            <Button variant="outline" size="sm" disabled>
              <Layers className="h-4 w-4 mr-1" />
              Layers
            </Button>
          </div> */}
        </div>
      </div>

      {/* The Map component will take up the rest of the available height */}
      <div className="flex-1 relative">
        <FixedMap
          pickups={transformedPickups}
          userLocation={{ lat: userLat, lng: userLng }}
          radius={mapData.community.radius} // Pass the community radius from mapData
        />
      </div>
    </div>
  );
}