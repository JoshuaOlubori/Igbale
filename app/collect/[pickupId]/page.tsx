// app/collect/[pickupId]/page.tsx
"use client";

import { useState, useRef, useEffect, use } from "react";
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
import {
  Camera,
  Loader2,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Image from "next/image";

interface CleanupVerificationResult {
  confidence: number;
  error?: string;
  message?: string; // Add message for display
}

interface CollectPickupPageProps {
  params: Promise<{
    pickupId: string;
  }>;
}

export default function CollectPickupPage({
  params: paramsPromise,
}: CollectPickupPageProps) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { pickupId } = params;

  const [step, setStep] = useState<"capture" | "verifying" | "result">(
    "capture"
  );
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] =
    useState<CleanupVerificationResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const handleCaptureClick = () => {
    if (imageFiles.length >= 1) {
      toast.warning("Maximum photos reached", {
        description: "You can only upload 1 photo for cleanup verification.",
      });
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newFiles: File[] = [];
    const newPreviews: string[] = [];
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.size > MAX_FILE_SIZE) {
        toast.error("Image too large", {
          description: `"${file.name}" exceeds the 10MB limit.`,
        });
        continue;
      }

      if (imageFiles.length + newFiles.length < 1) {
        newFiles.push(file);
        newPreviews.push(URL.createObjectURL(file));
      } else {
        toast.warning("Maximum photos reached", {
          description: "You can only upload 1 photo for cleanup verification.",
        });
        break;
      }
    }

    setImageFiles((prev) => [...prev, ...newFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);

    event.target.value = "";
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmitImages = async () => {
    if (imageFiles.length < 1) {
      toast.warning("Photo required", {
        description: "Please take 1 photo of the cleaned area.",
      });
      return;
    }

    setIsUploading(true);
    setStep("verifying");

    try {
      const base64Images = await Promise.all(
        imageFiles.map((file) => convertFileToBase64(file))
      );

      const response = await fetch(`/api/collect/${pickupId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          images: base64Images,
        }),
      });

      // Check if the response is JSON before parsing
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const apiResult: CleanupVerificationResult = await response.json();
        setVerificationResult(apiResult);

        if (
          !response.ok ||
          (apiResult.confidence && apiResult.confidence <= 50)
        ) {
          toast.error("Cleanup Not Confirmed", {
            description:
              apiResult.message ||
              "The AI could not confirm that the area has been cleaned. Please try again.",
          });
          setStep("result");
        } else {
          toast.success("Cleanup Confirmed!", {
            description:
              apiResult.message ||
              "Great job! Your cleanup has been successfully verified.",
          });
          router.push("/dashboard");
        }
      } else {
        // If the response is not JSON, it's likely an HTML error page
        const errorText = await response.text();
        console.error("Server returned non-JSON response:", errorText);
        throw new Error(
          "Received unexpected response from server. It might be an HTML error page. Check server logs for details."
        );
      }
    } catch (
      error: any // eslint-disable-line @typescript-eslint/no-explicit-any
    ) {
      console.error("Error during image submission or verification:", error);
      toast.error("Verification Failed", {
        description:
          error.message ||
          "An error occurred during cleanup verification. Please try again.",
      });
      setStep("capture");
    } finally {
      setIsUploading(false);
      setIsVerifying(false);
    }
  };

  const handleTryAgain = () => {
    setImageFiles([]);
    setImagePreviews([]);
    setVerificationResult(null);
    setStep("capture");
  };

  return (
    <div className="container max-w-md py-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">Confirm Cleanup</h1>
        <p className="text-muted-foreground">
          Take a photo of the cleaned area to verify your work
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {step === "capture" && "Capture Photo"}
              {step === "verifying" && "Verifying Cleanup"}
              {step === "result" && "Verification Result"}
            </CardTitle>
            {step === "capture" && (
              <Badge variant="outline">{imageFiles.length}/1 photo</Badge>
            )}
          </div>
          <CardDescription>
            {step === "capture" && "Take 1 photo of the cleaned area."}
            {step === "verifying" && "Our AI is analyzing your cleanup photo"}
            {step === "result" && "Review the AI's assessment of your cleanup"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === "capture" && (
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <div className="flex justify-center">
                <div className="relative aspect-square rounded-md border border-dashed border-muted-foreground/50 flex items-center justify-center overflow-hidden bg-muted/30 w-full max-w-sm">
                  {imagePreviews[0] ? (
                    <>
                      <Image
                        width={500}
                        height={500}
                        src={imagePreviews[0]}
                        alt="Clean photo"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 rounded-full"
                        onClick={() => removeImage(0)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </>
                  ) : (
                    <span className="text-2xl text-muted-foreground font-light">
                      📷
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
            </div>
          )}

          {step === "verifying" && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-2">
                {imagePreviews.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.1 }}
                    className="aspect-square rounded-md overflow-hidden"
                  >
                    <Image
                      src={image}
                      alt={`Clean photo ${index + 1}`}
                      width={500}
                      height={500}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                ))}
              </div>

              <div className="space-y-2 text-center py-4">
                {isVerifying || isUploading ? (
                  <>
                    <div className="flex justify-center mb-2">
                      <div className="relative h-16 w-16">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        </div>
                        <svg
                          className="h-16 w-16 -rotate-90"
                          viewBox="0 0 100 100"
                        >
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
                    <div className="font-medium">Verifying your cleanup...</div>
                    <div className="text-sm text-muted-foreground">
                      This will take a moment
                    </div>
                  </>
                ) : (
                  <AnimatePresence>
                    {verificationResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4 text-center"
                      >
                        {verificationResult.confidence > 50 ? (
                          <div className="flex flex-col items-center justify-center text-green-600 dark:text-green-400">
                            <CheckCircle2 className="h-16 w-16 mb-4" />
                            <h3 className="text-2xl font-semibold">
                              Cleanup Confirmed!
                            </h3>
                            <p className="text-lg text-muted-foreground">
                              AI Confidence: {verificationResult.confidence}%
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                              Great work! Redirecting to dashboard...
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-red-600 dark:text-red-400">
                            <AlertCircle className="h-16 w-16 mb-4" />
                            <h3 className="text-2xl font-semibold">
                              Cleanup Not Confirmed
                            </h3>
                            <p className="text-lg text-muted-foreground">
                              AI Confidence: {verificationResult.confidence}%
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                              It seems the AI is not confident the area has been
                              fully cleaned.
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            </div>
          )}

          {step === "result" && verificationResult && (
            <div className="space-y-6 py-4">
              <div className="text-center">
                {verificationResult.confidence > 50 ? (
                  <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                  </div>
                ) : (
                  <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                    <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                  </div>
                )}
                <h3 className="mt-4 text-xl font-medium">
                  {verificationResult.confidence > 50
                    ? "Cleanup Confirmed!"
                    : "Cleanup Not Confirmed"}
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  AI Confidence: {verificationResult.confidence}%
                </p>
                <p className="text-sm text-muted-foreground">
                  {verificationResult.confidence > 50
                    ? verificationResult.message ||
                      "Great job! Your cleanup has been successfully verified."
                    : verificationResult.message ||
                      "The AI could not confirm that the area has been cleaned. Please try again."}
                </p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter>
          {step === "capture" && (
            <Button
              onClick={handleSubmitImages}
              disabled={imageFiles.length < 1 || isUploading || isVerifying}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600"
            >
              {isUploading || isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting for Verification...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Submit Photo for Verification
                </>
              )}
            </Button>
          )}

          {step === "result" &&
            verificationResult &&
            verificationResult.confidence <= 50 && (
              <Button
                onClick={handleTryAgain}
                className="w-full bg-gradient-to-r from-orange-600 to-yellow-500 hover:from-orange-700 hover:to-yellow-600"
              >
                <Camera className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}

          {step === "result" &&
            verificationResult &&
            verificationResult.confidence > 50 && (
              <Button
                onClick={() => router.push("/dashboard")}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
              >
                Go to Dashboard
              </Button>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}
