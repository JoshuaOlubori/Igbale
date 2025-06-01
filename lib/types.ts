import { InferSelectModel } from "drizzle-orm";


import {
  CommunitiesTable,
  UsersTable,
  ActivitiesTable,
  PickupsTable,
  BadgesTable,
} from "@/drizzle/schema";
// import { type ColumnType } from "drizzle-orm"; // Import ColumnType for optional use if needed

export type PointLocation = {
  lat: number;
  lng: number;
};

// Define the type for the basic Community data directly from the schema
// Drizzle's $inferSelect is generally the best way to get the exact type from the table.
export type Community = typeof CommunitiesTable.$inferSelect;

// Extend the basic Community type to include the joined and aggregated data
export type CommunityWithDetails = Community & {
  members: Array<typeof UsersTable.$inferSelect>; // Array of full user objects
  totalKgTrashPicked: number;
  totalPickups: number;
};

// Define the structure for a single activity item as expected by the frontend
export type ActivityFeedItem = {
  id: string;
  user: {
    name: string;
    avatar: string | null;
  };
  type: "collection" | "reporting"; // Map from 'trash_pickup'/'trash_report'
  location: string; // From PickupsTable.location
  timestamp: string; // Formatted time
  details: {
    weight: number;
    type: string; // From PickupsTable.trash_type
    points: number; // Placeholder for now, will calculate later or pull from ActivitiesTable if you add it.
  };
};

// Optionally, define the full data structure fetched from Drizzle before transformation
export type ActivityWithRelations = InferSelectModel<typeof ActivitiesTable> & {
  user: InferSelectModel<typeof UsersTable>;
  pickup:
    | (InferSelectModel<typeof PickupsTable> & {
        community?: InferSelectModel<typeof CommunitiesTable>; // Include community if you need its name for location
      })
    | null;
};

export type GeoJsonPoint = {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
  name?: string; // Optional name for the location
};


// Define the shape for user stats
export type UserStatsData = {
  name: string | null;
  avatar: string | null;
  community: string | null;
  rank: number;
  points: number;
  nextLevel: number; // This will be hardcoded for now or fetched from a config
  trashCollected: number;
  badges: Array<{
    id: string;
    name: string;
    icon: string | null;
  }>;
};

// Optionally, define the raw Drizzle types if needed for debugging
export type UserWithCommunityAndBadges = InferSelectModel<typeof UsersTable> & {
  community?: InferSelectModel<typeof CommunitiesTable> | null;
  userBadges: Array<{
    badge: InferSelectModel<typeof BadgesTable>;
  }>;
};