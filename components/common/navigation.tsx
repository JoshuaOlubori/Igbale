"use client"

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { Leaf } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import {
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'

export default function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const mainNavItems = [
    { title: "Map", href: "/map" },
    { title: "Leaderboard", href: "/leaderboard" },
    { title: "Dashboard", href: "/dashboard" },
    { title: "Communities", href: "/communities" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <Leaf className="h-6 w-6 text-green-600" />
            <span className="font-bold text-xl hidden md:inline-block">EcoCollect</span>
          </Link>
          <NavigationMenu className="hidden md:block">
            <NavigationMenuList>
              {mainNavItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <Link href={item.href} legacyBehavior passHref>
                    <NavigationMenuLink 
                      className={cn(
                        "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50",
                        pathname === item.href && "bg-accent/50 text-accent-foreground"
                      )}
                    >
                      {item.title}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            <ModeToggle />
            <SignedOut>
              <Button asChild variant="outline" size="sm">
                <Link href="/sign-in">Login</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600" size="sm">
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-6 pt-6">
                <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
                  <Leaf className="h-6 w-6 text-green-600" />
                  <span className="font-bold text-xl">EcoCollect</span>
                </Link>
                <nav className="flex flex-col gap-4">
                  {mainNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "px-2 py-1 text-lg transition-colors hover:text-foreground/80",
                        pathname === item.href ? "text-foreground font-medium" : "text-foreground/60"
                      )}
                    >
                      {item.title}
                    </Link>
                  ))}
                </nav>
                <div className="flex flex-col gap-4 mt-4">
                  <ModeToggle />
                  <SignedOut>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/sign-in">Login</Link>
                    </Button>
                    <Button asChild className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600" size="sm">
                      <Link href="/sign-up">Sign Up</Link>
                    </Button>
                  </SignedOut>
                  <SignedIn>
                    <UserButton />
                  </SignedIn>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}