// app/api/collect/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { processImage } from "@/lib/image-downsizer";
import { verifyTrashCleanup } from "@/lib/ai-service";
import { confirmTrashCollection } from "@/server/actions/collect"; // New server action
import { currentUser } from "@clerk/nextjs/server"; // To get current user ID
import { db } from "@/drizzle/db"; // Assuming you have your Drizzle DB instance exported as 'db'
import { UsersTable } from "@/drizzle/schema"; // Import UsersTable to get user's internal ID
import { eq } from "drizzle-orm"; // IMPORT THIS LINE: Import eq for database queries
import { env } from "@/data/env/client";

// Get max image size from env or default to 4.5MB
const MAX_IMAGE_SIZE_MB = Number(env.NEXT_PUBLIC_MAX_IMAGE_SIZE_MB || "4.5");
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

export async function POST(
  request: NextRequest,
  { params }: { params: { pickupId: string } } // Accept dynamic parameter
) {
  try {
    const { images: base64Images } = await request.json();
    const { pickupId } = params; // Extract pickupId from params

    if (!pickupId) {
      return NextResponse.json({ error: "Pickup ID is missing." }, { status: 400 });
    }

    // Authenticate user to get userId
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "User not authenticated." }, { status: 401 });
    }

    // Get the internal database user ID
    const userInDb = await db.query.UsersTable.findFirst({
      where: eq(UsersTable.clerkUserId, clerkUser.id),
      columns: { id: true },
    });

    if (!userInDb?.id) {
      return NextResponse.json({ error: "User not found in database." }, { status: 404 });
    }

    const userId = userInDb.id;

    // Validate images before processing
    if (
      !base64Images ||
      !Array.isArray(base64Images) ||
      base64Images.length === 0
    ) {
      return NextResponse.json(
        { error: "No images provided." },
        { status: 400 }
      );
    }

    // Validate image format and create filtered array
    const validatedImages = base64Images.filter((image) => {
      return (
        typeof image === "string" &&
        image.match(/^data:image\/(jpeg|png|gif|webp);base64,/)
      );
    });

    if (validatedImages.length === 0) {
      return NextResponse.json(
        { error: "No valid images provided." },
        { status: 400 }
      );
    }

    if (validatedImages.length > 3) {
      return NextResponse.json(
        { error: "Maximum 3 images allowed." },
        { status: 400 }
      );
    }

    // Process and validate images
    const processedImages: string[] = [];
    for (const base64Image of validatedImages) {
      try {
        // Convert base64 to File object
        const matches = base64Image.match(/^data:(.+);base64,(.+)$/);
        if (!matches) continue;

        const [, mimeType, base64Data] = matches;
        const byteString = Buffer.from(base64Data, "base64");
        const file = new File([byteString], `image.${mimeType.split("/")[1]}`, {
          type: mimeType,
        });

        // Process the image
        const processedBuffer = await processImage(file, MAX_IMAGE_SIZE_BYTES);
        const processedBase64 = `data:${mimeType};base64,${processedBuffer.toString(
          "base64"
        )}`;
        processedImages.push(processedBase64);
      } catch (error) {
        console.error("Error processing image:", error);
        continue;
      }
    }

    if (processedImages.length === 0) {
      return NextResponse.json(
        { error: "Failed to process any of the provided images." },
        { status: 400 }
      );
    }

    // 1. Call AI verification with processed images and user ID
    const { confidence, error: aiError } = await verifyTrashCleanup(userId, processedImages);

    if (aiError) {
      return NextResponse.json({ error: aiError, message: "AI verification failed." }, { status: 500 });
    }

    // If confidence is 50 or less, indicate that cleaning was not confirmed
    if (confidence <= 50) {
      return NextResponse.json(
        {
          confidence,
          message: "The AI could not confirm that the area has been cleaned.",
        },
        { status: 200 } // Still a 200 OK response, but with specific status indicating unconfirmed
      );
    }

    // 2. If AI confidence is high enough, proceed to confirm cleanup
    // Pass pickupId to confirmTrashCollection
    const result = await confirmTrashCollection(userId, pickupId, confidence);

    if (result.error) {
      return NextResponse.json({ error: result.error, message: result.error }, { status: 400 });
    }

    return NextResponse.json({ ...result, message: "Cleanup successfully confirmed!", confidence });
  } catch (error) {
    console.error("Error in /api/collect route handler:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { error: `Failed to process cleanup verification: ${errorMessage}`, message: `Failed to process cleanup verification: ${errorMessage}` },
      { status: 500 }
    );
  }
}
