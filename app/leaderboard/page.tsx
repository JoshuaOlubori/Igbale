"use client"

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Badge } from '@/components/ui/badge';
import { 
   // MapPin,
     Medal, Trophy, Users } from 'lucide-react';
import { motion } from '@/lib/framer-motion';

// Sample data
const COMMUNITIES = [
  { id: 'all', name: 'All Communities' },
  { id: 'community-123', name: 'Greenville' },
  { id: 'community-456', name: 'River Park' },
  { id: 'community-789', name: 'Oakwood' },
];

const LEADERBOARD_DATA = {
  weekly: [
    { id: 1, name: 'Jane Cooper', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg', points: 450, collections: 8, community: 'Greenville' },
    { id: 2, name: 'Alex Morgan', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg', points: 350, collections: 7, community: 'River Park' },
    { id: 3, name: 'Taylor Johnson', avatar: 'https://images.pexels.com/photos/1080213/pexels-photo-1080213.jpeg', points: 320, collections: 6, community: 'Greenville' },
    { id: 4, name: 'Jamie Smith', avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg', points: 270, collections: 5, community: 'Oakwood' },
    { id: 5, name: 'Casey Williams', avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg', points: 230, collections: 4, community: 'River Park' },
    { id: 6, name: 'Robin Black', avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg', points: 210, collections: 4, community: 'Oakwood' },
    { id: 7, name: 'Jordan Lee', avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg', points: 190, collections: 3, community: 'Greenville' },
    { id: 8, name: 'Sam Wilson', avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg', points: 170, collections: 3, community: 'River Park' },
    { id: 9, name: 'Pat Miller', avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg', points: 150, collections: 3, community: 'Oakwood' },
    { id: 10, name: 'Morgan Davis', avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg', points: 130, collections: 2, community: 'Greenville' },
  ],
  monthly: [
    { id: 2, name: 'Alex Morgan', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg', points: 1250, collections: 24, community: 'River Park' },
    { id: 1, name: 'Jane Cooper', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg', points: 1100, collections: 22, community: 'Greenville' },
    { id: 3, name: 'Taylor Johnson', avatar: 'https://images.pexels.com/photos/1080213/pexels-photo-1080213.jpeg', points: 980, collections: 19, community: 'Greenville' },
    { id: 5, name: 'Casey Williams', avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg', points: 870, collections: 16, community: 'River Park' },
    { id: 4, name: 'Jamie Smith', avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg', points: 750, collections: 14, community: 'Oakwood' },
    { id: 6, name: 'Robin Black', avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg', points: 720, collections: 13, community: 'Oakwood' },
    { id: 7, name: 'Jordan Lee', avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg', points: 680, collections: 12, community: 'Greenville' },
    { id: 8, name: 'Sam Wilson', avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg', points: 650, collections: 12, community: 'River Park' },
    { id: 9, name: 'Pat Miller', avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg', points: 620, collections: 11, community: 'Oakwood' },
    { id: 10, name: 'Morgan Davis', avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg', points: 580, collections: 10, community: 'Greenville' },
  ],
  yearly: [
    { id: 3, name: 'Taylor Johnson', avatar: 'https://images.pexels.com/photos/1080213/pexels-photo-1080213.jpeg', points: 8760, collections: 172, community: 'Greenville' },
    { id: 2, name: 'Alex Morgan', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg', points: 7540, collections: 145, community: 'River Park' },
    { id: 1, name: 'Jane Cooper', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg', points: 6890, collections: 130, community: 'Greenville' },
    { id: 4, name: 'Jamie Smith', avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg', points: 5230, collections: 102, community: 'Oakwood' },
    { id: 5, name: 'Casey Williams', avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg', points: 4780, collections: 95, community: 'River Park' },
    { id: 6, name: 'Robin Black', avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg', points: 4550, collections: 89, community: 'Oakwood' },
    { id: 7, name: 'Jordan Lee', avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg', points: 4320, collections: 84, community: 'Greenville' },
    { id: 8, name: 'Sam Wilson', avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg', points: 4100, collections: 80, community: 'River Park' },
    { id: 9, name: 'Pat Miller', avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg', points: 3870, collections: 75, community: 'Oakwood' },
    { id: 10, name: 'Morgan Davis', avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg', points: 3650, collections: 71, community: 'Greenville' },
  ],
};

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [selectedCommunity, setSelectedCommunity] = useState<string>('all');
  
  const filteredLeaderboard = LEADERBOARD_DATA[timeframe].filter(user => 
    selectedCommunity === 'all' || 
    user.community.toLowerCase() === COMMUNITIES.find(c => c.id === selectedCommunity)?.name.toLowerCase()
  );
  
  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground">
          See who's making the biggest impact in trash collection
        </p>
      </div>
      
      <Card>
        <CardHeader className="pb-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Top Contributors</CardTitle>
              <CardDescription>
                Ranked by points earned from trash collection
              </CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select Community" />
                </SelectTrigger>
                <SelectContent>
                  {COMMUNITIES.map(community => (
                    <SelectItem key={community.id} value={community.id}>
                      {community.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as 'weekly' | 'monthly' | 'yearly')} className="mt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
            
            <div className="mt-6">
              {['weekly', 'monthly', 'yearly'].map((period) => (
                <TabsContent key={period} value={period} className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    {filteredLeaderboard.slice(0, 3).map((user, index) => (
                      <motion.div 
                        key={user.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className={`flex items-center gap-4 p-4 rounded-lg ${
                          index === 0 
                            ? 'bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/10 border border-amber-200 dark:border-amber-800/20' 
                            : index === 1 
                            ? 'bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/20 dark:to-slate-700/10 border border-slate-200 dark:border-slate-700/20' 
                            : index === 2 
                            ? 'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/10 border border-orange-200 dark:border-orange-800/20'
                            : 'bg-muted/30'
                        }`}
                      >
                        {index === 0 ? (
                          <div className="w-12 h-12 flex items-center justify-center">
                            <Trophy className="h-8 w-8 text-amber-500" />
                          </div>
                        ) : index === 1 ? (
                          <div className="w-12 h-12 flex items-center justify-center">
                            <Medal className="h-8 w-8 text-slate-400" />
                          </div>
                        ) : index === 2 ? (
                          <div className="w-12 h-12 flex items-center justify-center">
                            <Medal className="h-8 w-8 text-orange-600" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 flex items-center justify-center text-muted-foreground font-bold text-xl">
                            {index + 1}
                          </div>
                        )}
                        
                        <Avatar className="h-12 w-12 border-2 border-background">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="font-medium text-lg">{user.name}</div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Users className="h-3 w-3" />
                            {user.community}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-bold text-xl">{user.points.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">{user.collections} collections</div>
                        </div>
                      </motion.div>
                    ))}
                    
                    <div className="bg-muted/30 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <tbody>
                          {filteredLeaderboard.slice(3).map((user, index) => (
                            <tr key={user.id} className="border-b last:border-b-0 border-border">
                              <td className="py-3 px-4 whitespace-nowrap text-center">
                                <div className="w-6 text-muted-foreground font-medium">
                                  {index + 4}
                                </div>
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{user.name}</div>
                                    <div className="text-xs text-muted-foreground">{user.community}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap text-center">
                                <div className="text-sm">{user.collections} collections</div>
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap text-right">
                                <div className="font-medium">{user.points.toLocaleString()}</div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}