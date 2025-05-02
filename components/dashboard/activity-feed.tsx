"use client"

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarDays, MapPin, Trash2 } from 'lucide-react';
import { motion } from '@/lib/framer-motion';

// Sample data - in a real app, this would come from your backend
const ACTIVITIES = [
  {
    id: 1,
    user: {
      name: 'Jane Cooper',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
    },
    type: 'collection',
    location: 'Riverside Park',
    timestamp: '2 hours ago',
    details: {
      weight: 3.2,
      type: 'Mixed Plastic',
      points: 120,
    },
  },
  {
    id: 2,
    user: {
      name: 'Alex Morgan',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    },
    type: 'collection',
    location: 'Main Street',
    timestamp: '5 hours ago',
    details: {
      weight: 1.5,
      type: 'Glass',
      points: 75,
    },
  },
  {
    id: 3,
    user: {
      name: 'Taylor Johnson',
      avatar: 'https://images.pexels.com/photos/1080213/pexels-photo-1080213.jpeg',
    },
    type: 'reporting',
    location: 'Beach Area',
    timestamp: '1 day ago',
    details: {
      weight: 5.8,
      type: 'Mixed Waste',
      points: 40,
    },
  },
  {
    id: 4,
    user: {
      name: 'Jamie Smith',
      avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg',
    },
    type: 'collection',
    location: 'Creek Trail',
    timestamp: '2 days ago',
    details: {
      weight: 2.7,
      type: 'Paper',
      points: 90,
    },
  },
];

export default function ActivityFeed() {
  return (
    <ScrollArea className="h-[320px] pr-4">
      <div className="space-y-4 relative">
        <div className="absolute top-0 bottom-0 left-6 w-px bg-muted-foreground/20 z-0"></div>
        
        {ACTIVITIES.map((activity, index) => (
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
                    <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                    <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
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
                      <div className="text-sm font-medium">{activity.details.weight} kg</div>
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
        ))}
      </div>
    </ScrollArea>
  );
}