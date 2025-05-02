"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Award, Trash2, 
 // Users
 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { motion } from '@/lib/framer-motion';

export default function UserStats() {
  // This would come from your user data in a real app
  const userData = {
    name: "Jane Cooper",
    avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg",
    community: "Greenville",
    rank: 12,
    points: 1450,
    nextLevel: 2000,
    trashCollected: 72,
    badges: [
      { id: 1, name: "Quick Starter", icon: "🔰" },
      { id: 2, name: "Plastic Hunter", icon: "🥤" },
      { id: 3, name: "Community Leader", icon: "🏆" },
    ],
    recentCollections: 8,
  };
  
  const progressPercentage = (userData.points / userData.nextLevel) * 100;
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12 border-2 border-primary">
            <AvatarImage src={userData.avatar} alt={userData.name} />
            <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{userData.name}</CardTitle>
            <CardDescription>
              {userData.community} Community • Rank #{userData.rank}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-end text-sm">
            <span className="font-medium">{userData.points} Points</span>
            <span className="text-muted-foreground">{userData.nextLevel} Next Level</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
              <Trash2 className="h-4 w-4" />
            </div>
            <div>
              <div className="text-lg font-bold">{userData.trashCollected} kg</div>
              <div className="text-xs text-muted-foreground">Collected</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <div className="text-lg font-bold">{userData.badges.length}</div>
              <div className="text-xs text-muted-foreground">Badges</div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-3">Recent Badges</h3>
          <div className="flex flex-wrap gap-2">
            {userData.badges.map((badge) => (
              <motion.div
                key={badge.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Badge variant="outline" className="px-2 py-1 flex items-center gap-1 text-sm bg-background">
                  <span className="text-base">{badge.icon}</span>
                  {badge.name}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}