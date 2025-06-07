// pickup/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Upload, X, MapPin } from "lucide-react"; // Added MapPin
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import TrashAnalysisResult from "@/components/pickup/trash-analysis-result";
import { toast } from "sonner";
import Image from "next/image";

// Define the type for the analysis result from the API
interface AnalysisResult {
  weight: number;
  type: string;
  points: number;
  location: string; // This would be a description of the location
  latitude: number; // Actual latitude reported
  longitude: number; // Actual longitude reported
}

export default function NewPickupPage() {
  const router = useRouter();

  const [step, setStep] = useState<"capture" | "analysis" | "confirm">(
    "capture"
  );
  const [imageFiles, setImageFiles] = useState<File[]>([]); // Store File objects
  const [imagePreviews, setImagePreviews] = useState<string[]>([]); // Store Blob URLs for previews
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null); // Store user's current location
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const [result, setResult] = useState<AnalysisResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the hidden file input

  // Effect to get user's location on component mount
  useEffect(() => {
    getGeolocation();
  }, []);

  // Effect to clean up Blob URLs when images change or component unmounts
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const getGeolocation = () => {
    if ("geolocation" in navigator) {
      setIsGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsGettingLocation(false);
          toast.success("Location acquired!", {
            description: "Your current location has been successfully fetched.",
          });
        },
        (error) => {
          console.error("Error getting geolocation:", error);
          setIsGettingLocation(false);
          toast.error("Location Error", {
            description:
              "Could not get your current location. Please enable location services and try again.",
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      toast.error("Geolocation Not Supported", {
        description: "Your browser does not support geolocation.",
      });
    }
  };

  const handleCaptureClick = () => {
    // Only allow one image for this form
    if (imageFiles.length >= 1) {
      toast.warning("Maximum photos reached", {
        description: "You can only upload 1 photo per trash report.",
      });
      return;
    }
    fileInputRef.current?.click(); // Programmatically click the hidden file input
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // We only care about the first file since we're limiting to 1
    const file = files[0];
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image too large", {
        description: `"${file.name}" exceeds the 10MB limit.`,
      });
      event.target.value = ""; // Reset the input value
      return;
    }

    // Clear previous images and add only the new one
    setImageFiles([file]);
    setImagePreviews([URL.createObjectURL(file)]);

    // Reset the input value to allow selecting the same file again if needed
    event.target.value = "";
  };

  const removeImage = (index: number) => {
    // Since we're only allowing one image, we clear everything
    if (index === 0) {
      setImageFiles([]);
      setImagePreviews([]);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Validate file type before processing
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/tiff', 'image/bmp'];
      if (!validTypes.includes(file.type)) {
        reject(new Error(`Unsupported file type: ${file.type}`));
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Validate the result format
        if (!result || !result.startsWith('data:image/')) {
          reject(new Error('Invalid file format'));
          return;
        }
        resolve(result);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmitImages = async () => {
    // Require exactly 1 photo
    if (imageFiles.length < 1) {
      toast.warning("Missing photo", {
        description: "Please take 1 photo of the trash.",
      });
      return;
    }

    if (!currentLocation) {
      toast.error("Location Required", {
        description: "Please allow access to your location to report trash.",
        action: {
          label: "Get Location",
          onClick: () => getGeolocation(),
        },
      });
      return;
    }

    setIsUploading(true);
    setStep("analysis"); // Move to analysis step immediately after starting upload

    try {
      // Convert the single image file to Base64
      const base64Image = await convertFileToBase64(imageFiles[0]);

      // Make API call to /api/scan
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          images: [base64Image], // Send as an array containing the single image
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to analyze trash.");
      }

      const apiResult: AnalysisResult = await response.json();
      setResult(apiResult); // Set the result from the API

      setIsUploading(false); // Upload is done
      setIsAnalyzing(false); // Analysis is done (as it's part of the API response)
      setAnalysisDone(true);
    } catch (error: any) // eslint-disable-line @typescript-eslint/no-explicit-any
    {
      console.error("Error during image submission or analysis:", error);
      toast.error("Submission Failed", {
        description:
          error.message ||
          "An error occurred during trash analysis. Please try again.",
      });
      setIsUploading(false);
      setIsAnalyzing(false);
      setAnalysisDone(false);
      setStep("capture"); // Go back to capture step on error
    }
  };

  // Removed handleConfirm as it's not part of this page's flow anymore

  return (
    <div className="container max-w-md py-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">Register Trash</h1>
        <p className="text-muted-foreground">Take a photo of the trash you&apos;ve found</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {step === "capture" && "Capture Photo"}
              {step === "analysis" && "Analyzing Trash"}
              {step === "confirm" && "Confirming Registration"}
            </CardTitle>
            {step === "capture" && (
              <Badge variant="outline">{imageFiles.length}/1 photo</Badge>
            )}
          </div>
          <CardDescription>
            {step === "capture" && "Take 1 photo of the trash."}
            {step === "analysis" && "Our AI is analyzing your trash photo"}
            {step === "confirm" && "Processing your trash registration"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === "capture" && (
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp, image/heic, image/tiff, image/bmp" // More specific
                // Removed 'multiple' attribute
                className="hidden"
              />
              {/* Only render one image slot */}
              <div className="flex justify-center"> {/* Centering the single image slot */}
                <div
                  key={0} // Fixed key for the single slot
                  className="relative aspect-square rounded-md border border-dashed border-muted-foreground/50 flex items-center justify-center overflow-hidden bg-muted/30 w-full max-w-sm" // Increased size for single image
                >
                  {imagePreviews[0] ? ( // Check for the first (and only) preview
                    <>
                      <Image
                        width={500}
                        height={500}
                        src={imagePreviews[0]}
                        alt={`Trash photo 1`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 rounded-full"
                        onClick={() => removeImage(0)} // Always remove the first (and only)
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </>
                  ) : (
                    <span className="text-2xl text-muted-foreground font-light">
                      1
                    </span>
                  )}
                </div>
              </div>

              <Button
                onClick={handleCaptureClick}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                Take Photo
              </Button>

              <Button
                onClick={getGeolocation}
                variant="secondary"
                className="w-full flex items-center gap-2"
                disabled={isGettingLocation}
              >
                {isGettingLocation ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Getting Location...
                  </>
                ) : (
                  <>
                    <MapPin className="mr-2 h-4 w-4" />
                    {currentLocation
                      ? `Location: ${currentLocation.lat.toFixed(
                          4
                        )}, ${currentLocation.lng.toFixed(4)}`
                      : "Get Current Location"}
                  </>
                )}
              </Button>
            </div>
          )}

          {step === "analysis" && (
            <div className="space-y-6">
              {/* Only render one image for analysis preview */}
              <div className="flex justify-center">
                {imagePreviews[0] && (
                  <motion.div
                    key={0}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: 0 }}
                    className="aspect-square rounded-md overflow-hidden w-full max-w-sm" // Adjusted size
                  >
                    <Image
                      src={imagePreviews[0]}
                      alt={`Trash photo 1`}
                      width={500}
                      height={500}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                )}
              </div>

              <div className="space-y-2 text-center py-4">
                {isAnalyzing || isUploading ? (
                  <>
                    <div className="flex justify-center mb-2">
                      <div className="relative h-16 w-16">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        </div>
                        <svg className="h-16 w-16 -rotate-90" viewBox="0 0 100 100">
                          <circle
                            className="text-muted stroke-current"
                            strokeWidth="8"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="font-medium">Analyzing your trash...</div>
                    <div className="text-sm text-muted-foreground">
                      This will take a moment
                    </div>
                  </>
                ) : (
                  <AnimatePresence>
                    {analysisDone && result && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <TrashAnalysisResult result={result} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            </div>
          )}

          {step === "confirm" && (
            <div className="space-y-6 py-4">
              <div className="text-center">
                <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <Upload className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="mt-4 text-xl font-medium">
                  Processing your registration
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Uploading your trash details...
                </p>
              </div>

              <Progress value={65} className="h-2" />
            </div>
          )}
        </CardContent>

        <CardFooter>
          {step === "capture" && (
            <Button
              onClick={handleSubmitImages}
              disabled={imageFiles.length < 1 || isUploading || isGettingLocation || !currentLocation} // Changed to < 1
              className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Submit Photo for Analysis
                </>
              )}
            </Button>
          )}

          {step === "analysis" && (
            <Button
              onClick={() => router.push('/collect')} // This button will now lead to the collect route
              disabled={isAnalyzing || !analysisDone || !result}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
            >
              Confirm trash pickup
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}