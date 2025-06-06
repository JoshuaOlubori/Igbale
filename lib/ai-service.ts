// lib/ai-service.ts
import { GoogleGenAI, createUserContent } from "@google/genai";
import { env } from "@/data/env/server";
import { db } from "@/drizzle/db"; // Assuming you have your Drizzle DB instance exported as 'db'
import { ActivitiesTable, 
//  PickupsTable 
} from "@/drizzle/schema"; // Import your schema tables
import { desc, eq } from "drizzle-orm"; // Import desc and eq for querying

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
console.log("AI service initialized with API key:", env.GEMINI_API_KEY);
export interface TrashAnalysisResult {
  estimated_weight: number; // in kg
  trash_type: string;
}

export async function analyzeTrashImages(
  base64Images: string[]
): Promise<TrashAnalysisResult> {
  try {
    const model = "gemini-2.0-flash";
    const prompt = `Analyze the provided images of trash. Based on the visual information, estimate the total weight of the trash in kilograms (as a decimal number, e.g., 2.5) and identify the primary type of trash (e.g., "Mixed plastics", "Organic waste", "Paper and cardboard", "Glass bottles", "Metal cans", "Electronics", "General waste").

Respond in JSON format only, with the following schema:
{
  "estimated_weight": number,
  "trash_type": string,
}`;

    // Fix the image parts creation to match the format expected by Gemini
    const imageParts = base64Images.map((base64Image) => {
      const matches = base64Image.match(/^data:(image\/[^;]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error("Invalid base64 image format");
      }

      return {
        inlineData: {
          mimeType: matches[1],
          data: matches[2],
        },
      };
    });

    // Fix the content structure for generateContent
    const result = await ai.models.generateContent({
      model,
      contents: createUserContent([{ text: prompt }, ...imageParts]),
    });

    const text = result.text
    if (!text) {
      throw new Error("AI model returned empty response");
    }

    // Extract JSON from the response text which might be wrapped in markdown
    const jsonMatch =
      text.match(/```json\s*(\{[\s\S]*?\})\s*```/) ||
      text.match(/\{[\s\S]*?\}/);

    if (!jsonMatch || !jsonMatch[1]) {
      console.error("Could not find valid JSON in response:", text);
      throw new Error("Invalid response format from AI model");
    }

    const jsonString = jsonMatch[1];

    // Parse the JSON response
    let parsedResult: TrashAnalysisResult;
    try {
      parsedResult = JSON.parse(jsonString.trim());
    } catch (parseError) {
      console.error(
        "JSON parse error from Gemini response:",
        parseError,
        "Raw JSON string:",
        jsonString
      );
      throw new Error("Failed to parse AI response JSON.");
    }

    // Validate the response structure
    if (
      typeof parsedResult.estimated_weight !== "number" ||
      typeof parsedResult.trash_type !== "string"
    ) {
      console.error("Invalid AI response format after parsing:", parsedResult);
      throw new Error(
        "AI analysis result is missing required fields (weight, type)."
      );
    }

    return parsedResult;
  } catch (error) {
    console.error("Error during AI trash analysis:", error);
    throw error;
  }
}



async function fetchImageAsBase64(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    
    // Determine MIME type from response headers or URL extension
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error(`Error fetching image from ${imageUrl}:`, error);
    throw new Error(`Failed to fetch image from URL: ${imageUrl}`);
  }
}

export interface CleanupVerificationResult {
  confidence: number;
  error?: string;
}

export async function verifyTrashCleanup(
  userId: string,
  base64CleanedImages: string[]
): Promise<CleanupVerificationResult> {
  try {
    // 1. Query the database for the most recent trash report by the user
    const latestActivity = await db.query.ActivitiesTable.findFirst({
      where: eq(ActivitiesTable.user_id, userId),
      orderBy: desc(ActivitiesTable.created_at),
      with: {
        pickup: {
          columns: {
            image_urls: true,
          },
        },
      },
    });

    if (!latestActivity || !latestActivity.pickup?.image_urls) {
      return {
        confidence: 0,
        error: "No recent trash report found for this user with images.",
      };
    }

    const originalImageUrls = latestActivity.pickup.image_urls;

    if (originalImageUrls.length === 0) {
      return {
        confidence: 0,
        error: "No original images found in the latest trash report.",
      };
    }

    // 2. Fetch and convert original images from URLs to base64
    const originalBase64Images: string[] = [];
    for (const url of originalImageUrls) {
      try {
        const base64Image = await fetchImageAsBase64(url);
        originalBase64Images.push(base64Image);
      } catch (error) {
        console.error(`Failed to fetch original image from ${url}:`, error);
        // Continue with other images even if one fails
      }
    }

    if (originalBase64Images.length === 0) {
      return {
        confidence: 0,
        error: "Failed to fetch any original images from URLs.",
      };
    }

    // 3. Prepare AI model and prompt
    const model = "gemini-2.0-flash";
    const prompt = `Analyze the provided images to determine if an area has been cleaned. You will see two sets of images:

1. BEFORE images: Show the area with trash/litter before cleanup
2. AFTER images: Show the same area after alleged cleanup

Compare these images and provide a confidence score from 1 to 100:
- 100: Extremely confident the area has been thoroughly cleaned
- 75-99: Very confident significant cleaning occurred
- 50-74: Moderately confident some cleaning occurred
- 25-49: Slight evidence of cleaning
- 1-24: Little to no evidence of cleaning

Consider factors like:
- Reduction in visible trash/litter
- Cleanliness of the ground/surfaces
- Overall tidiness improvement
- Consistency between before and after scenes

It is important that you respond in JSON format only:
{
  "confidence": number
}`;

    // 4. Prepare image parts for AI model
    const beforeImageParts = originalBase64Images.map((base64Image) => {
      const matches = base64Image.match(/^data:(image\/[^;]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error("Invalid original base64 image format");
      }

      return {
        inlineData: {
          mimeType: matches[1],
          data: matches[2],
        },
      };
    });

    const afterImageParts = base64CleanedImages.map((base64Image) => {
      const matches = base64Image.match(/^data:(image\/[^;]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error("Invalid cleaned base64 image format");
      }

      return {
        inlineData: {
          mimeType: matches[1],
          data: matches[2],
        },
      };
    });

    // 5. Create content for AI model
    const contentParts = [
      { text: prompt },
      { text: "BEFORE images (original trash report):" },
      ...beforeImageParts,
      { text: "AFTER images (claimed cleanup):" },
      ...afterImageParts,
    ];

    // 6. Call AI model
    const result = await ai.models.generateContent({
      model,
      contents: createUserContent(contentParts),
    });

    const text = result.text;
    if (!text) {
      throw new Error("AI model returned empty response for cleanup verification");
    }

    // 7. Extract and parse JSON response
    const jsonMatch =
      text.match(/```json\s*(\{[\s\S]*?\})\s*```/) ||
      text.match(/\{[\s\S]*?\}/);

    if (!jsonMatch || !jsonMatch[1]) {
      console.error("Could not find valid JSON in verification response:", text);
      throw new Error("Invalid response format from AI model for cleanup verification");
    }

    const jsonString = jsonMatch[1];
    let parsedResult: { confidence: number };
    
    try {
      parsedResult = JSON.parse(jsonString.trim());
    } catch (parseError) {
      console.error(
        "JSON parse error from Gemini verification response:",
        parseError,
        "Raw JSON string:",
        jsonString
      );
      throw new Error("Failed to parse AI verification response JSON.");
    }

    // 8. Validate response
    if (
      typeof parsedResult.confidence !== "number" ||
      parsedResult.confidence < 1 ||
      parsedResult.confidence > 100
    ) {
      console.error("Invalid AI confidence score format after parsing:", parsedResult);
      throw new Error("AI verification result is missing a valid confidence score (1-100).");
    }

    return { confidence: parsedResult.confidence };

  } catch (error) {
    console.error("Error during AI trash cleanup verification:", error);
    return {
      confidence: 0,
      error: error instanceof Error ? error.message : "Unknown error occurred during verification",
    };
  }
}
