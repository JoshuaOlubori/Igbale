// components/dashboard/activity-feed.tsx
"use client"; // This remains a client component

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarDays, MapPin, Trash2 } from 'lucide-react';
import { motion } from '@/lib/framer-motion';
import { ActivityFeedItem } from '@/lib/types'; // Import the type for better type safety

interface ActivityFeedProps {
  activities: ActivityFeedItem[]; // Define the prop type
}

export default function ActivityFeed({ activities }: ActivityFeedProps) { // Accept activities as a prop
  return (
    <ScrollArea className="h-[320px] pr-4">
      <div className="space-y-4 relative">
        <div className="absolute top-0 bottom-0 left-6 w-px bg-muted-foreground/20 z-0"></div>

        {activities.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No recent activities to display.</p>
        ) : (
          activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              className="relative z-10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="flex gap-3">
                <div className="relative mt-1">
                  <div className="w-3 h-3 rounded-full bg-primary border-2 border-background"></div>
                </div>

                <div className="flex-1 bg-muted/30 rounded-lg p-3 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={activity.user.avatar || '/placeholder-avatar.jpg'} alt={activity.user.name} />
                      <AvatarFallback>{activity.user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{activity.user.name}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="h-3 w-3" />
                        {activity.timestamp}
                      </div>
                    </div>
                  </div>

                  <div className="mb-2 pl-10">
                    <Badge variant={activity.type === 'collection' ? 'default' : 'secondary'} className="rounded-sm">
                      {activity.type === 'collection' ? 'Collection' : 'Reporting'}
                    </Badge>
                    <div className="flex items-center gap-1 mt-1 text-xs">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{activity.location}</span>
                    </div>
                  </div>

                  <div className="bg-background rounded-md p-2 mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                        <Trash2 className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{activity.details.weight.toFixed(1)} kg</div>
                        <div className="text-xs text-muted-foreground">{activity.details.type}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold text-green-600 dark:text-green-400">+{activity.details.points}</div>
                      <div className="text-xs text-muted-foreground">points</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </ScrollArea>
  );
}