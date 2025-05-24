import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SignUpButton } from '@clerk/nextjs';

export default function HeroSection() {
  return (
    <div className="relative bg-gradient-to-b from-muted/30 to-background">
      <div 
        className="absolute inset-0 bg-[url('/images/texture.png')] opacity-10" 
        style={{ backgroundSize: '200px', backgroundRepeat: 'repeat' }}
      />
      <div className="container px-4 md:px-6 py-24 md:py-36 lg:py-44 relative">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-green-800 to-emerald-600 dark:from-green-400 dark:to-emerald-300">
                Make Our Planet Cleaner, One Pickup at a Time
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl dark:text-muted-foreground/80">
                Join your community in gamified trash collection. Compete, earn points, and make a real environmental impact together.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <SignUpButton>  
              <Button className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-medium px-8 py-3 rounded-lg">
             
                  Join Now
               
              </Button>
              </SignUpButton>
              <Button asChild variant="outline" className="group">
                <Link href="/about">
                  Learn How It Works
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative hidden md:block">
              <div className="absolute -top-12 -left-12 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
              <div className="absolute -bottom-12 -right-12 w-96 h-96 bg-green-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-[400px] aspect-[4/3] rounded-xl overflow-hidden border-8 border-white dark:border-black shadow-2xl">
                <img 
                  src="https://images.pexels.com/photos/6617801/pexels-photo-6617801.jpeg" 
                  alt="People collecting trash" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}