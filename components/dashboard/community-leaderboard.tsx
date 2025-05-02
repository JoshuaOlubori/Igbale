"use client"

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
//import { Badge } from '@/components/ui/badge';
import { Medal, Trophy } from 'lucide-react';
import { motion } from '@/lib/framer-motion';

// Sample data - in a real app, this would come from your backend
const LEADERBOARD_DATA = {
  weekly: [
    { id: 1, name: 'Jane Cooper', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg', points: 450, collections: 8 },
    { id: 2, name: 'Alex Morgan', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg', points: 350, collections: 7 },
    { id: 3, name: 'Taylor Johnson', avatar: 'https://images.pexels.com/photos/1080213/pexels-photo-1080213.jpeg', points: 320, collections: 6 },
    { id: 4, name: 'Jamie Smith', avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg', points: 270, collections: 5 },
    { id: 5, name: 'Casey Williams', avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg', points: 230, collections: 4 },
  ],
  monthly: [
    { id: 2, name: 'Alex Morgan', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg', points: 1250, collections: 24 },
    { id: 1, name: 'Jane Cooper', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg', points: 1100, collections: 22 },
    { id: 3, name: 'Taylor Johnson', avatar: 'https://images.pexels.com/photos/1080213/pexels-photo-1080213.jpeg', points: 980, collections: 19 },
    { id: 5, name: 'Casey Williams', avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg', points: 870, collections: 16 },
    { id: 4, name: 'Jamie Smith', avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg', points: 750, collections: 14 },
  ],
  yearly: [
    { id: 3, name: 'Taylor Johnson', avatar: 'https://images.pexels.com/photos/1080213/pexels-photo-1080213.jpeg', points: 8760, collections: 172 },
    { id: 2, name: 'Alex Morgan', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg', points: 7540, collections: 145 },
    { id: 1, name: 'Jane Cooper', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg', points: 6890, collections: 130 },
    { id: 4, name: 'Jamie Smith', avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg', points: 5230, collections: 102 },
    { id: 5, name: 'Casey Williams', avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg', points: 4780, collections: 95 },
  ],
};

export default function CommunityLeaderboard({ timeframe }: { timeframe: 'weekly' | 'monthly' | 'yearly' }) {
  const leaderboardData = LEADERBOARD_DATA[timeframe];
  
  return (
    <div className="space-y-4">
      {leaderboardData.slice(0, 3).map((user, index) => (
        <motion.div 
          key={user.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className={`flex items-center justify-between p-3 rounded-lg ${
            index === 0 
              ? 'bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/10 border border-amber-200 dark:border-amber-800/20' 
              : index === 1 
              ? 'bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/20 dark:to-slate-700/10 border border-slate-200 dark:border-slate-700/20' 
              : index === 2 
              ? 'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/10 border border-orange-200 dark:border-orange-800/20'
              : 'bg-muted/30'
          }`}
        >
          <div className="flex items-center gap-3">
            {index === 0 ? (
              <div className="w-8 h-8 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-amber-500" />
              </div>
            ) : index === 1 ? (
              <div className="w-8 h-8 flex items-center justify-center">
                <Medal className="h-6 w-6 text-slate-400" />
              </div>
            ) : index === 2 ? (
              <div className="w-8 h-8 flex items-center justify-center">
                <Medal className="h-6 w-6 text-orange-600" />
              </div>
            ) : (
              <div className="w-8 h-8 flex items-center justify-center text-muted-foreground font-medium">
                {index + 1}
              </div>
            )}
            
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.collections} collections</div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="font-bold text-lg">{user.points.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">points</div>
          </div>
        </motion.div>
      ))}
      
      {leaderboardData.slice(3).map((user, index) => (
        <div key={user.id} className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center text-muted-foreground font-medium">
              {index + 4}
            </div>
            
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="font-medium">{user.name}</div>
          </div>
          
          <div className="font-medium">{user.points.toLocaleString()} pts</div>
        </div>
      ))}
    </div>
  );
}