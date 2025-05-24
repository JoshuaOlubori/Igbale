import '@/app/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import Navigation from '@/components/common/navigation';
import { Link } from 'lucide-react';

import {
  ClerkProvider,

} from '@clerk/nextjs'

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EcoCollect | Gamifying Trash Collection',
  description: 'Join your community in cleaning up the environment through gamified trash collection',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>  
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <div className="flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-1">{children}</main>
            <footer className="py-6 border-t">
              <div className="container px-4 md:px-6">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    © 2025 EcoCollect. All rights reserved.
                  </p>
                  <div className="flex items-center space-x-4 mt-4 md:mt-0">
                    <Link href='#' className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Privacy
                    </Link>
                    <Link href='#' className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Terms
                    </Link>
                    <Link href='#' className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Contact
                    </Link>       

                    {/* <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Privacy
                    </a>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Terms
                    </a>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Contact
                    </a> */}
                  </div>
                </div>
              </div>
            </footer>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}