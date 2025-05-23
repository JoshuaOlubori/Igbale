"use client"

import { useEffect, useRef, 
    //useState 
    } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Replace with your Mapbox access token
mapboxgl.accessToken = 'your_mapbox_token_here';

interface CommunityMapProps {
  joinMode: boolean;
  onSelectCommunity?: (id: string) => void;
  selectedCommunity?: string | null;
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  radius?: number;
  onRadiusChange?: (radius: number) => void;
}

export default function CommunityMap({
  joinMode,
  onSelectCommunity,
  selectedCommunity,
  onLocationSelect,
  radius,
  onRadiusChange
}: CommunityMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  // const circle = useRef<mapboxgl.GeoJSONSource | null>(null);

  // Sample communities with coordinates
  const communities = [
    { id: 'community-123', name: 'Greenville', members: 127, area: 'Downtown', coordinates: [-73.935242, 40.730610] },
    { id: 'community-456', name: 'River Park', members: 89, area: 'Riverside', coordinates: [-73.940242, 40.735610] },
    { id: 'community-789', name: 'Oakwood', members: 215, area: 'North Hills', coordinates: [-73.945242, 40.740610] },
    { id: 'community-101', name: 'Pine Ridge', members: 64, area: 'West Side', coordinates: [-73.950242, 40.745610] },
  ];

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-73.935242, 40.730610],
      zoom: 12
    });

    const mapInstance = map.current;

    mapInstance.on('load', () => {
      if (joinMode) {
        // Add community markers
        communities.forEach(community => {
          const el = document.createElement('div');
          el.className = 'community-marker';
          el.style.width = '20px';
          el.style.height = '20px';
          el.style.borderRadius = '50%';
          el.style.backgroundColor = selectedCommunity === community.id ? '#22c55e' : '#94a3b8';
          el.style.cursor = 'pointer';

          new mapboxgl.Marker(el)
            .setLngLat(community.coordinates as [number, number])
            .setPopup(new mapboxgl.Popup().setHTML(`
              <h3 class="font-medium">${community.name}</h3>
              <p class="text-sm">${community.area} • ${community.members} members</p>
            `))
            .addTo(mapInstance);

          el.addEventListener('click', () => {
            onSelectCommunity?.(community.id);
          });
        });
      } else {
        // Add circle layer for radius visualization
        mapInstance.addSource('circle', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [-73.935242, 40.730610]
            },
            properties: {}
          }
        });

        mapInstance.addLayer({
          id: 'circle-fill',
          type: 'fill',
          source: 'circle',
          paint: {
            'fill-color': '#22c55e',
            'fill-opacity': 0.1
          },
          filter: ['==', '$type', 'Polygon']
        });

        // Allow clicking to place marker
        mapInstance.on('click', (e) => {
          if (marker.current) {
            marker.current.remove();
          }

          marker.current = new mapboxgl.Marker({
            color: '#22c55e'
          })
            .setLngLat(e.lngLat)
            .addTo(mapInstance);

          onLocationSelect?.({ lat: e.lngLat.lat, lng: e.lngLat.lng });
          updateCircle(e.lngLat, radius || 1);
        });
      }
    });

    return () => {
      mapInstance.remove();
    };
  }, [joinMode]);

  const updateCircle = (center: mapboxgl.LngLat, radiusKm: number) => {
    if (!map.current) return;

    const points = 64;
    const features = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [] as number[][][]
      },
      properties: {}
    };
    features.geometry.coordinates[0] = [];

    for (let i = 0; i < points; i++) {
      const angle = (i * 2 * Math.PI) / points;
      const lat = center.lat + (radiusKm / 111.32) * Math.cos(angle);
      const lng = center.lng + (radiusKm / (111.32 * Math.cos(center.lat * Math.PI / 180))) * Math.sin(angle);
      features.geometry.coordinates[0].push([lng, lat]);
    }
    features.geometry.coordinates[0].push(features.geometry.coordinates[0][0]);

    const source = map.current.getSource('circle') as mapboxgl.GeoJSONSource;
    source.setData(features as GeoJSON.Feature<GeoJSON.Polygon>);
  };

  return (
    <div className="relative">
      <div ref={mapContainer} className="map-container" />
      {!joinMode && (
        <div className="absolute bottom-4 left-4 bg-card p-4 rounded-lg shadow-lg">
          <label className="text-sm font-medium">
            Community Radius (km)
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.5"
              value={radius}
              onChange={(e) => {
                const newRadius = parseFloat(e.target.value);
                onRadiusChange?.(newRadius);
                if (marker.current) {
                  updateCircle(marker.current.getLngLat(), newRadius);
                }
              }}
              className="w-full mt-2"
            />
            <span className="text-sm text-muted-foreground ml-2">{radius}km</span>
          </label>
        </div>
      )}
    </div>
  );
}