"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function HeroSection() {
  const [currentImage, setCurrentImage] = useState(0);
  const images = ["/happy-volunteer.jpg", "/happy-volunteers.jpg"];
  
  // Customizable timing settings
  const SWITCH_INTERVAL = 6000; // Time between switches (milliseconds)
  const FADE_DURATION = "duration-[3000ms]"; // Fade speed class (duration-300, duration-500, duration-700, duration-1000, duration-[2000ms] (custom) etc.)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev === 0 ? 1 : 0));
    }, SWITCH_INTERVAL);

    return () => clearInterval(timer);
  }, [SWITCH_INTERVAL]);

  return (
    // Updated background to a light emerald shade, similar to the image's clean background
    // min-h-screen ensures it takes full viewport height for centering
    <div className="relative min-h-screen flex flex-col justify-between bg-emerald-50 dark:bg-emerald-950 text-gray-900 dark:text-gray-50 overflow-hidden font-inter">
      {/* Header/Navigation Area - Mimicking 'KEYNOTE' and 'Buy Tickets' placement */}

      {/* Main content area - Center aligned for the large text and image */}
      {/* flex-grow ensures this section takes up available space, flex items-center justify-center centers its content */}
      <div className="flex-grow flex items-center justify-center relative z-0">
        {/* Image container with both images */}
        <div className="absolute inset-0">
          {images.map((src, index) => (
            <Image
              key={src}
              src={src}
              alt={`Volunteers ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover object-center filter grayscale contrast-125 transition-opacity ${FADE_DURATION} ${
                currentImage === index ? "opacity-70" : "opacity-0"
              }`}
              fill
              priority
            />
          ))}
        </div>
        {/* Main Heading - Large, bold, and overlaying the image */}
        <div className="relative text-center px-4">
          <h1
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter leading-none
                       bg-clip-text text-transparent bg-gradient-to-r from-green-800 to-emerald-600 dark:from-green-400 dark:to-emerald-300
                       mix-blend-multiply dark:mix-blend-screen" // mix-blend-mode for the masking effect
          >
            Clean Communities. <br className="md:hidden" /> Together
          </h1>
          {/* Sub-text mimicking the date/year/location from the reference image */}
          {/* Using existing description content, but styled differently with larger font and spacing */}
          <div className="mt-8 text-xl sm:text-2xl lg:text-3xl font-medium tracking-wide flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-emerald-700 dark:text-emerald-300">
            <span>Community</span>
            <span>Gamified</span>
            <span>Impact</span>
          </div>
        </div>
      </div>
    </div>
  );
}