import "@/app/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import Navigation from "@/components/common/navigation";
// import { Link } from "lucide-react";

import { ClerkProvider } from "@clerk/nextjs";
import GlobalLoader from "./global-loader";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ayang | Gamifying Trash Collection",
  description:
    "Join your community in cleaning up the environment through gamified trash collection",
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
              <main className="flex-1">
                <GlobalLoader />
                {children}
              </main>
              <footer className="py-6 border-t">
                <div className="container px-4 md:px-6">
                  <div className="flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      © 2025 Ayang. All rights reserved.
                    </p>
                   
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
