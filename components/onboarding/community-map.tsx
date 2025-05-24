"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { env } from '@/data/env/client';
// Set your Mapbox access token here
mapboxgl.accessToken = env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface Community {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  radius: number; // in meters
  memberCount: number;
}

interface CommunityMapProps {
  joinMode: boolean;
  onSelectCommunity?: (communityId: string) => void;
  selectedCommunity?: string | null;
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  radius?: number;
  onRadiusChange?: (radius: number) => void;
}

// Dummy data for existing communities in Lagos, Nigeria
const dummyCommunities: Community[] = [
  {
    id: "1",
    name: "Victoria Island Green Initiative",
    location: { lat: 6.4281, lng: 3.4219 },
    radius: 1000,
    memberCount: 45
  },
  {
    id: "2",
    name: "Ikoyi Sustainability Hub",
    location: { lat: 6.4498, lng: 3.4343 },
    radius: 1500,
    memberCount: 32
  },
  {
    id: "3",
    name: "Lekki Eco Warriors",
    location: { lat: 6.4698, lng: 3.5852 },
    radius: 800,
    memberCount: 28
  },
  {
    id: "4",
    name: "Mainland Climate Action",
    location: { lat: 6.5244, lng: 3.3792 },
    radius: 1200,
    memberCount: 51
  }
];

export default function CommunityMap({
  joinMode,
  onSelectCommunity,
  selectedCommunity,
  onLocationSelect,
  radius = 1000,
  onRadiusChange
}: CommunityMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng, setLng] = useState(3.3792); // Lagos, Nigeria longitude
  const [lat, setLat] = useState(6.5244); // Lagos, Nigeria latitude
  const [zoom, setZoom] = useState(11);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const circleLayerId = useRef<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (map.current) return; // Initialize map only once
    
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: env.NEXT_PUBLIC_MAPBOX_STYLE,
      center: [lng, lat],
      zoom: zoom
    });

    map.current.on("move", () => {
      if (map.current) {
        setLng(parseFloat(map.current.getCenter().lng.toFixed(4)));
        setLat(parseFloat(map.current.getCenter().lat.toFixed(4)));
        setZoom(parseFloat(map.current.getZoom().toFixed(2)));
      }
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Handle existing communities in join mode
  useEffect(() => {
    if (!map.current || !joinMode) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add community markers and circles
    dummyCommunities.forEach(community => {
      if (!map.current) return;

      // Create marker element
      const markerElement = document.createElement("div");
      markerElement.className = `community-marker ${selectedCommunity === community.id ? "selected" : ""}`;
      markerElement.style.cssText = `
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: ${selectedCommunity === community.id ? "#10562a" : "#16a34a"};
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
        transition: all 0.2s ease;
      `;
      markerElement.textContent = community.memberCount.toString();

      // Add hover effect
    markerElement.addEventListener("mouseenter", () => {
        markerElement.style.boxShadow = "0 4px 12px rgba(0,0,0,0.4)";
        markerElement.style.zIndex = "1000";
      });
      markerElement.addEventListener("mouseleave", () => {
        markerElement.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
        markerElement.style.zIndex = "auto";
      });

      // Create marker
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([community.location.lng, community.location.lat])
        .addTo(map.current!);

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 8px;">
          <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">${community.name}</h3>
          <p style="margin: 0; font-size: 12px; color: #666;">${community.memberCount} members</p>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">Radius: ${community.radius}m</p>
        </div>
      `);

      marker.setPopup(popup);

      // Add click handler
      markerElement.addEventListener("click", () => {
        onSelectCommunity?.(community.id);
      });

      markersRef.current.push(marker);

      // Add community radius circle
      const sourceId = `community-${community.id}`;
      const layerId = `community-circle-${community.id}`;

      map.current.on("load", () => {
        if (!map.current!.getSource(sourceId)) {
          map.current!.addSource(sourceId, {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: {
                type: "Point",
                coordinates: [community.location.lng, community.location.lat]
              }
            }
          });

          map.current!.addLayer({
            id: layerId,
            type: "circle",
            source: sourceId,
            paint: {
              "circle-radius": {
                stops: [
                  [0, 0],
                  [20, community.radius / 10]
                ],
                base: 2
              },
              "circle-color": selectedCommunity === community.id ? "#16a34a" : "#22c55e",
              "circle-opacity": selectedCommunity === community.id ? 0.3 : 0.2,
              "circle-stroke-width": 2,
              "circle-stroke-color": selectedCommunity === community.id ? "#16a34a" : "#22c55e",
              "circle-stroke-opacity": 0.8
            }
          });
        }
      });
    });
  }, [joinMode, selectedCommunity, onSelectCommunity]);

  // Handle location selection in create mode
  useEffect(() => {
    if (!map.current || joinMode) return;

    const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
      const { lng, lat } = e.lngLat;
      setSelectedLocation({ lat, lng });
      onLocationSelect?.({ lat, lng });
    };

    map.current.on("click", handleMapClick);

    return () => {
      if (map.current) {
        map.current.off("click", handleMapClick);
      }
    };
  }, [joinMode, onLocationSelect]);

  // Handle radius circle in create mode
  useEffect(() => {
    if (!map.current || joinMode || !selectedLocation) return;

    // Remove existing circle
    if (circleLayerId.current) {
      if (map.current.getLayer(circleLayerId.current)) {
        map.current.removeLayer(circleLayerId.current);
      }
      if (map.current.getSource("selected-location")) {
        map.current.removeSource("selected-location");
      }
    }

    // Add new circle
    const sourceId = "selected-location";
    const layerId = "selected-location-circle";
    circleLayerId.current = layerId;

    if (!map.current.getSource(sourceId)) {
      map.current.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Point",
            coordinates: [selectedLocation.lng, selectedLocation.lat]
          }
        }
      });
    } else {
      const source = map.current.getSource(sourceId) as mapboxgl.GeoJSONSource;
      source.setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "Point",
          coordinates: [selectedLocation.lng, selectedLocation.lat]
        }
      });
    }

    map.current.addLayer({
      id: layerId,
      type: "circle",
      source: sourceId,
      paint: {
        "circle-radius": {
          stops: [
            [0, 0],
            [20, radius / 10]
          ],
          base: 2
        },
        "circle-color": "#3b82f6",
        "circle-opacity": 0.3,
        "circle-stroke-width": 2,
        "circle-stroke-color": "#3b82f6",
        "circle-stroke-opacity": 0.8
      }
    });

    // Add center marker
    const markerElement = document.createElement("div");
    markerElement.style.cssText = `
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #3b82f6;
      border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    `;

    new mapboxgl.Marker(markerElement)
      .setLngLat([selectedLocation.lng, selectedLocation.lat])
      .addTo(map.current);

  }, [selectedLocation, radius, joinMode]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <div 
          ref={mapContainer} 
          className="h-96 w-full rounded-lg border"
          style={{ minHeight: "400px" }}
        />
        
        {/* Map info overlay */}
        <div className="absolute top-2 right-10 bg-white/120 backdrop-blur-sm rounded-lg px-3 py-2 text-sm shadow-md">
          <div className="space-y-1">
            <div>Lng: {lng} | Lat: {lat}</div>
            <div>Zoom: {zoom}</div>
          </div>
        </div>

        {/* Instructions overlay */}
        <div className="absolute bottom-2 left-2 bg-white/120 backdrop-blur-sm  rounded-lg px-3 py-2 text-sm shadow-md max-w-xs">
          {joinMode ? (
            <p>Click on a community marker to select it. Hover for details.</p>
          ) : (
            <p>Click anywhere on the map to set your community location.</p>
          )}
        </div>
      </div>

      {/* Radius control for create mode */}
      {!joinMode && (
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Community Radius: {radius}m
          </label>
          <input
            type="range"
            min="100"
            max="5000"
            step="100"
            value={radius}
            onChange={(e) => onRadiusChange?.(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>100m</span>
            <span>5000m</span>
          </div>
        </div>
      )}

      {/* Selected location info */}
      {!joinMode && selectedLocation && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Selected Location
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
            Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-300">
            Radius: {radius}m
          </p>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 0 2px 0 #555;
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 2px 0 #555;
        }
      `}</style>
    </div>
  );
}