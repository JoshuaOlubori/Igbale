// app/api/collect/[pickupId]/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { processImage } from "@/lib/image-downsizer";
import { verifyTrashCleanup } from "@/lib/ai-service";
import { confirmTrashCollection } from "@/server/actions/collect";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/drizzle/db";
import { UsersTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { env } from "@/data/env/client";

// Get max image size from env or default to 4.5MB
const MAX_IMAGE_SIZE_MB = Number(env.NEXT_PUBLIC_MAX_IMAGE_SIZE_MB || "4.5");
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ pickupId: string }> }
) {
  try {
    const { images: base64Images } = await request.json();
    // Await the params promise
    const { pickupId } = await context.params;

    if (!pickupId) {
      return NextResponse.json({ error: "Pickup ID is missing." }, { status: 400 });
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "User not authenticated." }, { status: 401 });
    }

    const userInDb = await db.query.UsersTable.findFirst({
      where: eq(UsersTable.clerkUserId, clerkUser.id),
      columns: { id: true },
    });

    // Declare userId here to ensure its scope covers the entire try block
    let userId: string;
    if (!userInDb?.id) {
      return NextResponse.json({ error: "User not found in database." }, { status: 404 });
    } else {
      userId = userInDb.id;
    }

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

    // Declare validatedImages here to ensure its scope covers the subsequent loop and checks
    const validatedImages = base64Images.filter((image) => {
      // Fix: Use a correct regex literal for the match method.
      // The double backslash was causing the 'not callable' error.
      return (
        typeof image === "string" &&
        image.match(/^data:image\/(jpeg|png|gif|webp|heic|heif|jpg|tiff|bmp);base64,/i)
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

    const processedImages: string[] = [];
    for (const base64Image of validatedImages) {
      try {
        const matches = base64Image.match(/^data:(.+);base64,(.+)$/);
        if (!matches) continue;

        const [, mimeType, base64Data] = matches;
        const byteString = Buffer.from(base64Data, "base64");
        const file = new File([byteString], `image.${mimeType.split("/")[1]}`, {
          type: mimeType,
        });

        const processedBuffer = await processImage(file, MAX_IMAGE_SIZE_BYTES);
        const processedBase64 = `data:${mimeType};base64,${processedBuffer.toString(
          "base64"
        )}`;
        processedImages.push(processedBase64);
      } catch (error) {
        console.error("Error processing single image:", error);
        // Do not return here, continue processing other images
      }
    }

    if (processedImages.length === 0) {
      return NextResponse.json(
        { error: "Failed to process any of the provided images." },
        { status: 400 }
      );
    }

    const { confidence, error: aiError } = await verifyTrashCleanup(userId, processedImages);

    if (aiError) {
      // If AI service returns an error, return it as a 500
      return NextResponse.json({ error: aiError, message: "AI verification failed." }, { status: 500 });
    }

    if (confidence <= 50) {
      return NextResponse.json(
        {
          confidence,
          message: "The AI could not confirm that the area has been cleaned.",
        },
        { status: 200 }
      );
    }

    const result = await confirmTrashCollection(userId, pickupId);

    if (result.error) {
      return NextResponse.json({ error: result.error, message: result.error }, { status: 400 });
    }

    return NextResponse.json({ ...result, message: "Cleanup successfully confirmed!", confidence });
  } catch (error: any) // eslint-disable-line @typescript-eslint/no-explicit-any
  { // Explicitly type error as 'any' for broader error catching
    console.error("Unhandled error in /api/collect route handler:", error);
    let errorMessage = "An unexpected server error occurred.";
    if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String(error.message);
    }

    // Always return a JSON response, even for unexpected errors
    return NextResponse.json(
      { error: `Server Error: ${errorMessage}`, message: `Server Error: ${errorMessage}` },
      { status: 500 }
    );
  }
}