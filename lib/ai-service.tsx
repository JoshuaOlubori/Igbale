// lib/ai-se
import { GoogleGenAI, createUserContent } from "@google/genai";
import {env} from "@/data/env/client";

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
