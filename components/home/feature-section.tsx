"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Map, Trophy, Users } from 'lucide-react';
import { motion } from '@/lib/framer-motion';

export default function FeatureSection() {
  const features = [
    {
      icon: <Camera className="h-8 w-8 text-green-600" />,
      title: "AI-Powered Trash Detection",
      description: "Take photos of trash from different angles and our AI will analyze the type and estimate weight automatically."
    },
    {
      icon: <Map className="h-8 w-8 text-green-600" />,
      title: "Community Mapping",
      description: "Create or join a community on the interactive map and see nearby trash collection opportunities."
    },
    {
      icon: <Trophy className="h-8 w-8 text-green-600" />,
      title: "Points & Rewards",
      description: "Earn points for collecting trash and compete on local and global leaderboards."
    },
    {
      icon: <Users className="h-8 w-8 text-green-600" />,
      title: "Community Impact",
      description: "Track your community's collective impact and see the difference you're making together."
    }
  ];

  return (
    <div className="space-y-12">
      <div className="space-y-4 text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
          Our platform makes trash collection fun, rewarding, and impactful.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <Card className="h-full transition-all duration-200 hover:shadow-lg">
              <CardHeader>
                <div className="p-2 w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-2">
                  {feature.icon}
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}