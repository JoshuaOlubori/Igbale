"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Filter, Layers, MapPin, Trash2, Navigation as NavigationIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export default function MapPage() {
  const [loading, setLoading] = useState(true);
  const [selectedTrash, setSelectedTrash] = useState<{
    id: string;
    type: string;
    weight: number;
    location: string;
    reportedBy: string;
    timestamp: string;
  } | null>(null);
  
  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="min-h-[calc(100vh-64px)] relative flex flex-col">
      <div className="relative z-10 px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-lg">Community Map</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Layers className="h-4 w-4 mr-1" />
              Layers
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="space-y-4">
              <Skeleton className="h-8 w-40 mx-auto" />
              <Skeleton className="h-4 w-60 mx-auto" />
              <div className="flex justify-center mt-4">
                <div className="h-12 w-12 rounded-full border-4 border-t-primary border-muted animate-spin" />
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Map container - in a real implementation, this would use a mapping library */}
            <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/0,0,3/1200x800?access_token=NOT_A_REAL_TOKEN')] bg-cover bg-center">
              {/* Simulated trash locations */}
              <div 
                className="absolute top-1/4 left-1/3 w-8 h-8 rounded-full bg-red-500/70 border-2 border-white cursor-pointer flex items-center justify-center transform-gpu -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
                onClick={() => setSelectedTrash({
                  id: 'trash-123',
                  type: 'Mixed Plastic',
                  weight: 2.3,
                  location: 'Riverside Park, near the bridge',
                  reportedBy: 'Jane Cooper',
                  timestamp: '2 hours ago'
                })}
              >
                <Trash2 className="h-4 w-4 text-white" />
              </div>
              
              <div 
                className="absolute bottom-1/3 right-1/4 w-8 h-8 rounded-full bg-red-500/70 border-2 border-white cursor-pointer flex items-center justify-center transform-gpu -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
                onClick={() => setSelectedTrash({
                  id: 'trash-456',
                  type: 'Glass and Paper',
                  weight: 3.5,
                  location: 'Main Street, behind the store',
                  reportedBy: 'Alex Morgan',
                  timestamp: '5 hours ago'
                })}
              >
                <Trash2 className="h-4 w-4 text-white" />
              </div>
              
              {/* Drop-off location */}
              <div className="absolute top-1/2 left-1/2 w-10 h-10 rounded-full bg-green-500/70 border-2 border-white cursor-pointer flex items-center justify-center transform-gpu -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform">
                <MapPin className="h-5 w-5 text-white" />
              </div>
            </div>
            
            {/* Current location button */}
            <div className="absolute bottom-24 right-4">
              <Button size="icon" className="h-10 w-10 rounded-full shadow-lg">
                <NavigationIcon className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Selected trash info panel */}
            {selectedTrash && (
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <Card className="w-full max-w-md mx-auto shadow-lg">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Reported Trash</CardTitle>
                        <CardDescription>{selectedTrash.location}</CardDescription>
                      </div>
                      <Badge variant="outline">{selectedTrash.timestamp}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Type</div>
                            <div className="font-medium">{selectedTrash.type}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Weight</div>
                          <div className="font-medium">{selectedTrash.weight} kg</div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Reported by</div>
                        <div className="font-medium">{selectedTrash.reportedBy}</div>
                      </div>
                    </div>
                    
                    <Button className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600">
                      Collect This Trash
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}