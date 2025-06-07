// app/api/scan/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { nanoid } from "nanoid";
import { processImage } from "@/lib/image-downsizer";
import { analyzeTrashImages } from "@/lib/ai-service";
import { createTrashReport } from "@/server/actions/scan";
import { env } from "@/data/env/client";

// Get max image size from env or default to 4.5MB
const MAX_IMAGE_SIZE_MB = Number(env.NEXT_PUBLIC_MAX_IMAGE_SIZE_MB || "4.5");
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const { images: base64Images, latitude, longitude } = await request.json();

    // Add validation for coordinates
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return NextResponse.json(
        { error: "Invalid location coordinates." },
        { status: 400 }
      );
    }

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

    // 1. Call AI analysis with processed images
    const geminiAnalysisResult = await analyzeTrashImages(processedImages);

    // 2. Upload processed images to blob storage
    const uploadedImageUrls: string[] = [];
    for (const processedImage of processedImages) {
      const matches = processedImage.match(/^data:(.+);base64,(.+)$/);
      if (!matches) continue;

      const [, mimeType, base64Data] = matches;
      const buffer = Buffer.from(base64Data, "base64");
      const filename = `trash/${nanoid()}.${mimeType.split("/")[1]}`;

      const blob = await put(filename, buffer, {
        access: "public",
        contentType: mimeType,
      });
      uploadedImageUrls.push(blob.url);
    }

    if (uploadedImageUrls.length === 0) {
      return NextResponse.json(
        { error: "No valid images uploaded to blob storage." },
        { status: 500 }
      );
    }

    // 3. Create trash report using the server action
    const result = await createTrashReport({
      imageUrls: uploadedImageUrls,
      latitude,
      longitude,
      estimatedWeight: geminiAnalysisResult.estimated_weight,
      trashType: geminiAnalysisResult.trash_type,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in /api/scan route handler:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { error: `Failed to process trash registration: ${errorMessage}` },
      { status: 500 }
    );
  }
}
