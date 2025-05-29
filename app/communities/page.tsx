// app/communities/page.tsx
// This file is a Server Component by default, no "use client" needed here.

// import { Card, CardContent, CardFooter } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import { Search, MapPin, Users, Trash2, Plus } from 'lucide-react';
// import Link from 'next/link';
// Assuming motion is a client component, you might need to wrap it
// Or make your Card components client components that receive data
// For now, let's assume `motion` is okay or replace it
// import { motion } from '@/lib/framer-motion'; // Keep this import if motion is handled correctly
// import Image from 'next/image';
import { getCommunitiesWithDetails } from "@/server/db/communities"; // Server-side function
// import { CommunityWithDetails } from '@/lib/types'; // Type import
import ClientCommunityPage from '@/components/community/client-community-page'; // We'll create this client component

// This is a Server Component, so you can directly await data.
export default async function CommunitiesPage() {
  const communities = await getCommunitiesWithDetails(); // Fetch data directly on the server

  // Pass the fetched data to a Client Component if you need client-side interactivity
  return (
    <ClientCommunityPage initialCommunities={communities} />
  );
}