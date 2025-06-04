"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { env } from "@/data/env/client";

// Set your Mapbox access token here
mapboxgl.accessToken = env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface Pickup {
  id: string;
  location: {
    lat: number;
    lng: number;
  };
  // Add other pickup properties as needed
}

interface MapPageProps {
  pickups?: Pickup[];
  userLocation?: {
    lat: number;
    lng: number;
  };
  radius?: number; // in meters
}

export default function MapPage({
  pickups = [],
  userLocation = { lat: 6.5244, lng: 3.3792 }, // Default to Lagos, Nigeria
  radius = 1000,
}: MapPageProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng, setLng] = useState(userLocation.lng);
  const [lat, setLat] = useState(userLocation.lat);
  const [zoom, setZoom] = useState(11);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const circleLayerId = useRef<string | null>(null);

  const hasActivePickups = pickups && pickups.length > 0;

  // Initialize map
  useEffect(() => {
    if (map.current) return; // Initialize map only once

    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: env.NEXT_PUBLIC_MAPBOX_STYLE || "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: zoom,
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

  // Handle user location and radius circle
  useEffect(() => {
    if (!map.current) return;

    // Wait for map to load before adding sources and layers
    const addUserLocationCircle = () => {
      // Remove existing circle if any
      if (circleLayerId.current) {
        if (map.current!.getLayer(circleLayerId.current)) {
          map.current!.removeLayer(circleLayerId.current);
        }
        if (map.current!.getSource("user-location")) {
          map.current!.removeSource("user-location");
        }
      }

      // Add user location circle
      const sourceId = "user-location";
      const layerId = "user-location-circle";
      circleLayerId.current = layerId;

      map.current!.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Point",
            coordinates: [userLocation.lng, userLocation.lat],
          },
        },
      });

      map.current!.addLayer({
        id: layerId,
        type: "circle",
        source: sourceId,
        paint: {
          "circle-radius": {
            stops: [
              [0, 0],
              [20, radius / 10],
            ],
            base: 2,
          },
          "circle-color": "#3b82f6",
          "circle-opacity": 0.2,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#3b82f6",
          "circle-stroke-opacity": 0.6,
        },
      });

      // Add user location marker
      const userMarkerElement = document.createElement("div");
      userMarkerElement.style.cssText = `
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #3b82f6;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      `;

      new mapboxgl.Marker(userMarkerElement)
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map.current!);
    };

    if (map.current.isStyleLoaded()) {
      addUserLocationCircle();
    } else {
      map.current.on("load", addUserLocationCircle);
    }
  }, [userLocation, radius]);

  // Handle pickup markers
  useEffect(() => {
    if (!map.current) return;

    // Clear existing pickup markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add pickup markers if there are active pickups
    if (hasActivePickups) {
      pickups.forEach((pickup) => {
        if (!map.current) return;

        // Create pickup marker element
        const markerElement = document.createElement("div");
        markerElement.style.cssText = `
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #16a34a;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
        `;
        markerElement.innerHTML = "🗑️";

        // Create marker
        const marker = new mapboxgl.Marker(markerElement)
          .setLngLat([pickup.location.lng, pickup.location.lat])
          .addTo(map.current!);

        // Create popup
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">Trash Pickup</h3>
            <p style="margin: 0; font-size: 12px; color: #666;">Click to view details</p>
          </div>
        `);

        marker.setPopup(popup);
        markersRef.current.push(marker);
      });
    }
  }, [pickups, hasActivePickups]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapContainer}
        className="w-full h-full"
        style={{ minHeight: "400px" }}
      />

      {/* Map info overlay */}
      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm shadow-md">
        <div className="space-y-1">
          <div>
            Lng: {lng} | Lat: {lat}
          </div>
          <div>Zoom: {zoom}</div>
          <div>Radius: {radius}m</div>
        </div>
      </div>

      {/* No trash found overlay */}
      {!hasActivePickups && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white/90 rounded-lg px-6 py-4 text-center shadow-lg">
            <div className="text-4xl mb-2">🔍</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              No trash found
            </h3>
            <p className="text-sm text-gray-600">
              No active pickups in your area at the moment
            </p>
          </div>
        </div>
      )}

      {/* Active pickups count */}
      {hasActivePickups && (
        <div className="absolute bottom-2 left-2 bg-green-500/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm shadow-md text-white">
          <p className="font-medium">
            {pickups.length} active pickup{pickups.length !== 1 ? 's' : ''} found
          </p>
        </div>
      )}
    </div>
  );
}