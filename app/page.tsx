import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';
import { SignUpButton } from "@clerk/nextjs"
import HeroSection from '@/components/home/hero-section';
import FeatureSection from '@/components/home/feature-section';
import StatsSection from '@/components/home/stats-section';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      
      <div className="py-12 md:py-24 bg-background">
        <div className="container px-4 md:px-6">
          <StatsSection />
        </div>
      </div>
      
      <div className="py-12 md:py-24 bg-muted/50">
        <div className="container px-4 md:px-6">
          <FeatureSection />
        </div>
      </div>
      
      <div className="py-12 md:py-24 bg-background">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
            Join Your Community Today
          </h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mb-8">
            Make a difference in your local environment while having fun and earning rewards.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <SignUpButton >
            <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white">
             
                Get Started
             
            </Button>
              </SignUpButton>

            <Button asChild variant="outline" size="lg">
              <Link href="/about">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}