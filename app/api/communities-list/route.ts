// app/api/communities-list/route.ts
// This API route will serve the list of communities to the client component.

import { NextResponse } from "next/server";
import { getCommunitiesWithDetails } from "@/server/db/communities"; // Import your server DB function

export async function GET() {
  try {
    const communities = await getCommunitiesWithDetails({ limit: 100 }); // Fetch communities with details

    // Return the data directly
    return NextResponse.json(communities);
  } catch (error) {
    console.error("Error fetching communities for API:", error);
    return NextResponse.json(
      { error: "Failed to fetch communities." },
      { status: 500 }
    );
  }
}