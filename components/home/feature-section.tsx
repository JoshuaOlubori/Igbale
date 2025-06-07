"use client"

import { Camera, Map, Trophy, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function FeatureSection() {
  const features = [
    {
      icon: <Camera className="h-6 w-6 text-green-600" />,
      title: "AI-Powered Trash Detection",
      description: "Take photos of trash from different angles and our AI will analyze the type and estimate weight automatically."
    },
    {
      icon: <Map className="h-6 w-6 text-green-600" />,
      title: "Community Mapping",
      description: "Create or join a community on the interactive map and see nearby trash collection opportunities."
    },
    {
      icon: <Trophy className="h-6 w-6 text-green-600" />,
      title: "Points & Rewards",
      description: "Earn points for collecting trash and compete on local and global leaderboards."
    },
    {
      icon: <Users className="h-6 w-6 text-green-600" />,
      title: "Community Impact",
      description: "Track your community's collective impact and see the difference you're making together."
    }
  ];

  // Duplicate features to create a continuous loop effect
  const duplicatedFeatures = [...features, ...features, ...features];

  // State to store the calculated width for animation
  const [contentWidthToAnimate, setContentWidthToAnimate] = useState(0);

  // Calculate the total width of one set of original features
  useEffect(() => {
    // Each feature item width + gap
    const ITEM_WIDTH = 400; // Width of each feature item
    const GAP_WIDTH = 48; // Gap between items (gap-12 = 48px)

    const calculatedWidth = (features.length * ITEM_WIDTH) + ((features.length - 1) * GAP_WIDTH);
    setContentWidthToAnimate(calculatedWidth);
  }, [features.length]);

  return (
    <div className="space-y-12 py-16">
      {/* Section Title and Description */}
      <div className="space-y-4 text-center px-4">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
          Our platform makes trash collection fun, rewarding, and impactful.
        </p>
      </div>

      {/* Scrolling Container Viewport */}
      <div
        className="relative w-full overflow-hidden py-8"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
        }}
      >
        {/* The motion.div that contains the scrolling strip */}
        {contentWidthToAnimate > 0 && (
          <motion.div
            className="flex flex-nowrap gap-12 w-max"
            animate={{ x: `-${contentWidthToAnimate}px` }}
            transition={{
              x: {
                duration: 30,
                ease: "linear",
                repeat: Infinity,
              },
            }}
          >
            {/* Map over the duplicated features array to render each feature item */}
            {duplicatedFeatures.map((feature, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-[400px] rounded-lg border p-6 bg-gradient-to-br from-background to-muted/50 shadow-sm hover:shadow-md dark:hover:shadow-lg transition-all duration-300"
              >
                {/* Feature content in a horizontal layout */}
                <div className="flex items-start gap-4">
                  {/* Icon container */}
                  <div className="flex-shrink-0 p-3 rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800/50">
                    {feature.icon}
                  </div>
                  
                  {/* Text content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground mb-2 leading-tight">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}