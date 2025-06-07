"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Camera,
  MapPin,
  Trophy,
  Users,
  ArrowRight,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { motion } from "@/lib/framer-motion";

export default function AboutPage() {
  const { theme } = useTheme();
  const steps = [
    {
      icon: <Users className="h-8 w-8 text-green-600" />,
      title: "Join or Create a Community",
      description:
        "Connect with local eco-warriors or start your own community. Define your area and invite others to join your cause.",
      action: "Get Started",
      link: "/register",
    },
    {
      icon: <Camera className="h-8 w-8 text-green-600" />,
      title: "Record Trash Pickups",
      description:
        "Take photos of collected trash. Our AI analyzes the type and weight, automatically awarding points for your effort.",
      action: "Learn More",
      link: "/pickup",
    },
    {
      icon: <MapPin className="h-8 w-8 text-green-600" />,
      title: "Discover Collection Points",
      description:
        "Use the interactive map to find reported trash locations and coordinate cleanups with your community.",
      action: "View Map",
      link: "/map",
    },
    {
      icon: <Trophy className="h-8 w-8 text-green-600" />,
      title: "Compete and Earn",
      description:
        "Track your impact on leaderboards, earn badges, and compete with other communities for recognition.",
      action: "View Leaderboard",
      link: "/leaderboard",
    },
  ];

  const features = [
    {
      title: "AI-Powered Analysis",
      description:
        "Our advanced AI technology analyzes photos to identify trash types and estimate weights, ensuring accurate point allocation.",
    },
    {
      title: "Community Engagement",
      description:
        "Connect with like-minded individuals in your area and organize group cleanup events.",
    },
    {
      title: "Progress Tracking",
      description:
        "Monitor your personal and community impact with detailed statistics and achievement badges.",
    },
    {
      title: "Gamified Experience",
      description:
        "Turn environmental cleanup into an engaging activity with points, rankings, and friendly competition.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-muted/30 to-background py-20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <Image
              src={
                theme === "dark"
                  ? "/ayang_logo-removebg-dark-upscaled.png"
                  : "/ayang_logo-removebg-light-upscaled.png"
              }
              alt="Ayang Logo"
              width={0}
              height={0}
              sizes="(max-width: 640px) 200px, (max-width: 768px) 250px, 300px"
              className="w-[200px] md:w-[250px] lg:w-[300px] h-auto object-contain"
              priority
            />
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Join our community of environmental champions making a real
              difference through gamified trash collection.
            </p>
          </div>
        </div>
      </div>

      {/* Steps Section */}
      <div className="py-20 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="p-2 w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                      {step.icon}
                    </div>
                    <CardTitle className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 text-sm font-medium">
                        {index + 1}
                      </span>
                      {step.title}
                    </CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="outline" className="w-full group">
                      <Link href={step.link}>
                        {step.action}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Key Features
            </h2>
            <p className="mt-4 text-muted-foreground md:text-lg">
              Everything you need to make a positive environmental impact
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
              <Trash2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Ready to Make a Difference?
            </h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-lg">
              Join thousands of eco-warriors who are already making their
              communities cleaner and greener.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Button
                asChild
                className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
              >
                <Link href="/register">Get Started Now</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/communities">Browse Communities</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
