"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { Camera, Loader2, 
    // MapPin,
    Upload, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from '@/lib/framer-motion';
import TrashAnalysisResult from '@/components/pickup/trash-analysis-result';
import {  toast } from 'sonner';

export default function NewPickupPage() {
  const router = useRouter();
  
  const [step, setStep] = useState<'capture' | 'analysis' | 'confirm'>('capture');
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);
  
  const [result, setResult] = useState<{
    weight: number;
    type: string;
    points: number;
    location: string;
  } | null>(null);

  const handleCapture = () => {
    // In a real app, this would trigger the device camera
    // For this demo, we'll simulate image capture with placeholder images
    
    if (images.length >= 3) {
   

      toast.warning('Maximum photos reached', {
  description: 'You can only upload 3 photos per trash pickup.',
})
      return;
    }
    
    // Simulate camera capture with a placeholder image
    const placeholderImages = [
      "https://images.pexels.com/photos/4167579/pexels-photo-4167579.jpeg",
      "https://images.pexels.com/photos/2908819/pexels-photo-2908819.jpeg",
      "https://images.pexels.com/photos/4167544/pexels-photo-4167544.jpeg",
    ];
    
    const newImage = placeholderImages[images.length];
    setImages([...images, newImage]);
  };
  
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };
  
  const handleSubmitImages = async () => {
    if (images.length < 3) {
    

       toast.warning('Not enough photos', {
  description: 'Please take 3 photos of the trash from different angles.',
})
      return;
    }
    
    setIsUploading(true);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsUploading(false);
    
    // Move to analysis step
    setStep('analysis');
    setIsAnalyzing(true);
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Simulate analysis result
    setResult({
      weight: 2.7,
      type: "Mixed plastic and paper",
      points: 135,
      location: "Riverside Park, near the bridge",
    });
    
    setIsAnalyzing(false);
    setAnalysisDone(true);
  };
  
  const handleConfirm = () => {
    setStep('confirm');
    
    // Simulate submission delay
    setTimeout(() => {
      

       toast.warning('Pickup recorded!', {
  description: `You've earned ${result?.points} points for this collection.`,
})
      
      router.push('/dashboard');
    }, 1500);
  };
  
  return (
    <div className="container max-w-md py-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">Record Trash Pickup</h1>
        <p className="text-muted-foreground">
          Take photos of the trash you've collected
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {step === 'capture' && "Capture Photos"}
              {step === 'analysis' && "Analyzing Trash"}
              {step === 'confirm' && "Confirm Pickup"}
            </CardTitle>
            {step === 'capture' && (
              <Badge variant="outline">{images.length}/3 photos</Badge>
            )}
          </div>
          <CardDescription>
            {step === 'capture' && "Take 3 photos of the trash from different angles"}
            {step === 'analysis' && "Our AI is analyzing your trash photos"}
            {step === 'confirm' && "Review and confirm your trash pickup"}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {step === 'capture' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="relative aspect-square rounded-md border border-dashed border-muted-foreground/50 flex items-center justify-center overflow-hidden bg-muted/30">
                    {images[index] ? (
                      <>
                        <img 
                          src={images[index]} 
                          alt={`Trash photo ${index + 1}`} 
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="absolute top-1 right-1 h-6 w-6 rounded-full"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <span className="text-2xl text-muted-foreground font-light">
                        {index + 1}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              
              <Button 
                onClick={handleCapture} 
                variant="outline" 
                className="w-full flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                Take Photo
              </Button>
            </div>
          )}
          
          {step === 'analysis' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-2">
                {images.map((image, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.1 }}
                    className="aspect-square rounded-md overflow-hidden"
                  >
                    <img 
                      src={image} 
                      alt={`Trash photo ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                ))}
              </div>
              
              <div className="space-y-2 text-center py-4">
                {isAnalyzing ? (
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
                    <div className="text-sm text-muted-foreground">This will take a moment</div>
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
          
          {step === 'confirm' && (
            <div className="space-y-6 py-4">
              <div className="text-center">
                <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <Upload className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="mt-4 text-xl font-medium">Processing your pickup</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Uploading your collection details...
                </p>
              </div>
              
              <Progress value={65} className="h-2" />
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          {step === 'capture' && (
            <Button 
              onClick={handleSubmitImages} 
              disabled={images.length < 3 || isUploading} 
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
                  Submit Photos
                </>
              )}
            </Button>
          )}
          
          {step === 'analysis' && (
            <Button 
              onClick={handleConfirm} 
              disabled={isAnalyzing || !analysisDone} 
              className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
            >
              Confirm and Record Pickup
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}