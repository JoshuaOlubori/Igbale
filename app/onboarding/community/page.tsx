"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CommunityMap from "@/components/onboarding/community-map";
// import CommunityList from "@/components/onboarding/community-list";
import { MapPin, Users } from "lucide-react";
import { createCommunity } from "@/server/actions/communities";
import { getReverseGeocode } from "@/lib/utils";

export default function CommunitySelectionPage() {
  const router = useRouter();
  const [, setTab] = useState("join");
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(
    null
  );
  // const [drawingBoundary, setDrawingBoundary] = useState(false);
  const [communityName, setCommunityName] = useState("");
  const [communityLocation, setCommunityLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [communityRadius, setCommunityRadius] = useState(1);
  const [communityDescription, setCommunityDescription] = useState("");
  const [communityAddress, setCommunityAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const handleJoinCommunity = () => {
    if (!selectedCommunity) {
      toast.warning("No community selected", {
        description: "Please select a community to join.",
      });
      return;
    }

    // Simulate successful community join

    toast.warning("Community joined!", {
      description: "You've successfully joined the community.",
    });
    router.push("/dashboard");
  };

  // const getReverseGeocode = async (lat: number, lng: number) => {
  //   try {
  //     const response = await fetch(
  //       `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
  //     );
  //     const data = await response.json();
  //     return data.features[0]?.place_name || "";
  //   } catch (error) {
  //     console.error("Error getting address:", error);
  //     return "";
  //   }
  // };

  const handleCreateCommunity = async () => {
    if (!communityName || !communityLocation) {
      toast.warning("Required fields missing", {
        description: "Please provide all required information.",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get address if not already set, or if the user updated the location on the map
      // Always try to get the address based on the final communityLocation
      const address = await getReverseGeocode(
        communityLocation.lat,
        communityLocation.lng
      );

      const result = await createCommunity({
        name: communityName,
        location: address, // Use the dynamically obtained address
        description: communityDescription,
        point_location: communityLocation,
        radius: communityRadius * 1000, // Convert to meters
      });

      if (result?.error) {
        toast.error("Error", {
          description: result.message,
        });
      } else {
        toast.success("Community created!", {
          description: `You've successfully created the community "${communityName}"`,
        });
        router.push("/communities");
      }
    } catch (error) {
      toast.error("Error", {
        description: `Error: ${error}: Failed to create community. Please try again.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get user's location when switching to create tab
  const handleTabChange = async (tab: string) => {
    setTab(tab);
    if (tab === "create" && !userLocation) {
      setIsLoadingLocation(true);
      try {
        const permission = await navigator.permissions.query({
          name: "geolocation",
        });

        if (permission.state === "denied") {
          toast.error("Location Access Denied", {
            description:
              "Please enable location access in your browser settings to create a community.",
          });
          setIsLoadingLocation(false); // Stop loading even if denied
          return;
        }

        if (permission.state === "prompt") {
          toast.info("Location Access Required", {
            description:
              "We need your location to help set up your community area.",
          });
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setUserLocation(newLocation);
            setCommunityLocation(newLocation);

            // Get address for the location
            getReverseGeocode(newLocation.lat, newLocation.lng).then(
              (address) => setCommunityAddress(address)
            );
            setIsLoadingLocation(false);
          },
          (error) => {
            console.error("Error getting location:", error);
            toast.error("Location Error", {
              description:
                "Could not get your location. You can still select a location manually on the map.",
            });
            setIsLoadingLocation(false); // Stop loading on error
          }
        );
      } catch (error) {
        console.error("Permission error:", error);
        setIsLoadingLocation(false); // Stop loading on permission error
      }
    }
  };

  return (
    <div className="container max-w-5xl py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Choose Your Community</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Join an existing community in your area or create a new one to start
          making an impact.
        </p>
      </div>

      <Tabs
        defaultValue="join"
        className="w-full"
        onValueChange={handleTabChange}
      >
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
          <TabsTrigger value="join" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Join Existing
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Create New
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="join" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Join an Existing Community</CardTitle>
                <CardDescription>
                  Select a community from the list or find one on the map
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <CommunityMap
                    joinMode={true}
                    onSelectCommunity={setSelectedCommunity}
                    selectedCommunity={selectedCommunity}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleJoinCommunity}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
                >
                  Join Selected Community
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create a New Community</CardTitle>
                <CardDescription>
                  Name your community and draw its boundaries on the map
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="community-name"
                    className="text-sm font-medium"
                  >
                    Community Name
                  </label>
                  <input
                    id="community-name"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="e.g., Green Valley Community"
                    value={communityName}
                    onChange={(e) => setCommunityName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="community-description"
                    className="text-sm font-medium"
                  >
                    Description (Optional)
                  </label>
                  <textarea
                    id="community-description"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Describe your community..."
                    value={communityDescription}
                    onChange={(e) => setCommunityDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="community-address"
                    className="text-sm font-medium"
                  >
                    Address
                  </label>
                  <input
                    id="community-address"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Type in your community address"
                    value={communityAddress}
                    onChange={(e) => setCommunityAddress(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Community Location
                    {isLoadingLocation && " (Getting your location...)"}
                  </label>
                  <CommunityMap
                    joinMode={false}
                    onLocationSelect={setCommunityLocation}
                    radius={communityRadius}
                    onRadiusChange={setCommunityRadius}
                    initialLocation={userLocation}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleCreateCommunity}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating..." : "Create Community"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}