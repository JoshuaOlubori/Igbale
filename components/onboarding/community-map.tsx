"use client"

import { useEffect, useRef, useState } from 'react';
// import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface CommunityMapProps {
  joinMode: boolean;
  drawingMode?: boolean;
  onFinishDrawing?: () => void;
  onSelectCommunity?: (id: string) => void;
  selectedCommunity?: string | null;
}

export default function CommunityMap({ 
  joinMode, 
  drawingMode = false,
  // onFinishDrawing,
  onSelectCommunity,
  selectedCommunity 
}: CommunityMapProps) {
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Simulating map loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // In a real implementation, this would use a mapping library like Mapbox or Leaflet
  // and would handle geolocation, community boundaries, etc.
  
  const handleMapClick = (e: React.MouseEvent) => {
    if (joinMode && onSelectCommunity) {
      // Simulate selecting a community when clicking on the map
      const communityId = `community-${Math.floor(Math.random() * 1000)}`;
      onSelectCommunity(communityId);
    }
  };
  
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">
        {joinMode 
          ? "Find Communities Near You" 
          : drawingMode 
            ? "Click on the map to draw your community boundary" 
            : "Preview your community area"}
      </div>
      
      {loading ? (
        <Skeleton className="w-full h-[300px] rounded-lg" />
      ) : (
        <div 
          ref={mapRef}
          className="relative w-full h-[300px] bg-muted rounded-lg overflow-hidden border"
          onClick={handleMapClick}
        >
          {/* This would be replaced with an actual map component */}
          <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/0,0,2/600x300?access_token=NOT_A_REAL_TOKEN')] bg-cover bg-center opacity-80"></div>
          
          {/* Sample communities on the map (in a real app these would be dynamically rendered) */}
          {joinMode && (
            <>
              <div 
                className={`absolute top-1/4 left-1/3 w-16 h-16 rounded-full border-2 border-green-500 bg-green-500/20 cursor-pointer transition-all ${selectedCommunity === 'community-123' ? 'scale-110 border-4' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCommunity?.('community-123');
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-bold">Greenville</div>
              </div>
              <div 
                className={`absolute bottom-1/4 right-1/4 w-20 h-20 rounded-full border-2 border-blue-500 bg-blue-500/20 cursor-pointer transition-all ${selectedCommunity === 'community-456' ? 'scale-110 border-4' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCommunity?.('community-456');
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-bold">River Park</div>
              </div>
            </>
          )}
          
          {drawingMode && (
            <div className="absolute inset-0 border-2 border-dashed border-green-500 pointer-events-none bg-green-500/10"></div>
          )}
        </div>
      )}
      
      <div className="text-xs text-muted-foreground italic">
        {joinMode 
          ? "Click on a community to select it" 
          : drawingMode 
            ? "Define the area where your community will be active" 
            : "You can adjust the boundary after creation"}
      </div>
    </div>
  );
}