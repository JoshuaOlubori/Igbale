// lib/types.ts

import { CommunitiesTable, UsersTable } from "@/drizzle/schema";
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