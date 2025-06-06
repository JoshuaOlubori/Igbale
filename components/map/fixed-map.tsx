"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { env } from "@/data/env/client";

// Set your Mapbox access token here
mapboxgl.accessToken = env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Define the detailed Pickup interface, matching ActivePickup from server/db/map.ts
interface Pickup {
  id: string;
  location: { // This structure is created in page.tsx from ActivePickup's lat/lng
    lat: number;
    lng: number;
  };
  trash_type: string;
  estimated_weight: number | null;
  image_urls: string[] | null;
  reported_at: Date | null;
  reported_by_username: string | null;
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
  // Using a Map to store markers for easy lookup and removal
  const pickupMarkersMapRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const circleLayerId = useRef<string | null>(null);

  const hasActivePickups = pickups && pickups.length > 0;

  // Debug logging (optional, can be removed in production)
  useEffect(() => {
    console.log("FixedMap received pickups:", pickups);
    console.log("FixedMap received userLocation:", userLocation);
    console.log("FixedMap received radius:", radius);
  }, [pickups, userLocation, radius]);

  // Initialize map
  useEffect(() => {
    if (map.current) return; // Initialize map only once

    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style:
        env.NEXT_PUBLIC_MAPBOX_STYLE || "mapbox://styles/mapbox/streets-v12",
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
        // Remove all current popups when map unmounts
        pickupMarkersMapRef.current.forEach(marker => {
          const popup = marker.getPopup();
          if (popup) {
            popup.remove();
          }
        });
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Handle user location and radius circle
  useEffect(() => {
    if (!map.current) return;

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
      circleLayerId.current = layerId; // Store layer ID for cleanup

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
              [20, radius / 10], // Scale radius with zoom level
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

    // Ensure map style is loaded before adding layers/sources
    if (map.current.isStyleLoaded()) {
      addUserLocationCircle();
    } else {
      map.current.on("load", addUserLocationCircle);
    }
  }, [userLocation, radius]); // Depend on userLocation and radius for updates


  // Handle pickup markers and popups
  useEffect(() => {
    if (!map.current) return;

    // Clear existing pickup markers and their popups
    pickupMarkersMapRef.current.forEach((marker) => {
      marker.getPopup()?.remove(); // Remove associated popup if it exists
      marker.remove(); // Remove marker itself
    });
    pickupMarkersMapRef.current.clear();

    if (hasActivePickups) {
      pickups.forEach((pickup) => {
        if (!map.current || !pickup.location) {
          console.warn("Skipping invalid pickup (missing map or location):", pickup);
          return;
        }

        const coordinates: [number, number] = [pickup.location.lng, pickup.location.lat];

        // Create custom marker element
        const markerElement = document.createElement("div");
        markerElement.className = "trash-marker"; // Add a class for potential styling
        markerElement.style.cssText = `
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #ef4444; /* Red color for trash */
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          transition: transform 0.1s ease;
          font-size: 18px; /* Larger emoji */
        `;
        markerElement.innerHTML = "🗑️"; // Trash emoji

        const pickupMarker = new mapboxgl.Marker(markerElement)
          .setLngLat(coordinates)
          .addTo(map.current);

        // Create the popup content
        const popupContent = `
          <div class="p-3 max-w-[300px] font-sans">
            <h3 class="font-bold text-base mb-2 text-gray-900">Trash Report: ${pickup.trash_type || 'Unknown'}</h3>
            ${
              pickup.image_urls && pickup.image_urls.length > 0
                ? `
              <div class="carousel relative mb-3 rounded-lg overflow-hidden w-full">
                <div class="flex snap-x snap-mandatory overflow-x-auto" style="scroll-snap-type: x mandatory;">
                  ${pickup.image_urls
                    .map(
                      (url, i) => `
                    <img src="${url}" onerror="this.onerror=null;this.src='https://placehold.co/150x100/A0A0A0/FFFFFF?text=No+Image';" alt="Trash ${
                        i + 1
                      }" class="w-full h-[150px] object-cover flex-shrink-0" style="scroll-snap-align: center;">
                  `
                    )
                    .join("")}
                </div>
                ${pickup.image_urls.length > 1 ? `
                <div class="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                    ${pickup.image_urls.map(() => `<span class="inline-block w-2 h-2 bg-white/70 rounded-full" style="opacity: 0.8;"></span>`).join('')}
                </div>` : ''}
              </div>
              `
                : '<p class="text-sm text-gray-500 mb-2">No images available</p>'
            }
            <div class="space-y-1 mb-3">
              <p class="text-sm text-gray-700"><strong>Type:</strong> ${
                pickup.trash_type || 'N/A'
              }</p>
              <p class="text-sm text-gray-700"><strong>Weight:</strong> ${
                pickup.estimated_weight ? `${pickup.estimated_weight.toFixed(1)} kg` : "N/A"
              }</p>
              <p class="text-sm text-gray-700"><strong>Reported by:</strong> ${
                pickup.reported_by_username || 'Anonymous'
              }</p>
              <p class="text-sm text-gray-700"><strong>Reported at:</strong> ${
                pickup.reported_at ? new Date(pickup.reported_at).toLocaleString() : "N/A"
              }</p>
            </div>
            <a href="/collect/${
              pickup.id
            }" class="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-2 px-4 rounded-md text-sm transition-colors duration-200 ease-in-out">
              Collect This Trash
            </a>
          </div>
        `;

        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: true, // Allow closing popup
          closeOnClick: false, // Don't close when map is clicked
          maxWidth: "300px",
        })
          .setLngLat(coordinates)
          .setHTML(popupContent);

        // Attach popup to marker
        pickupMarker.setPopup(popup);

        // Optional: Show popup on hover instead of click for discoverability
        // For click, you'd add an event listener to the markerElement directly
        markerElement.addEventListener('click', () => {
            // Close any other open popups first (optional, but good UX)
            // This requires keeping track of currently open popups
            // For simplicity, Mapbox usually handles closing previous popups if a new one is opened.
            popup.addTo(map.current!);
        });

        pickupMarkersMapRef.current.set(pickup.id, pickupMarker);
      });
    }
  }, [pickups, hasActivePickups]); // Re-run if pickups data changes

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapContainer}
        className="w-full h-full z-10" // Added z-index for the map
        style={{ minHeight: "400px" }}
      />

      {/* Map info overlay */}
      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm shadow-md z-20">
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
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-30 pointer-events-none">
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
        <div className="absolute bottom-2 left-2 bg-green-500/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm shadow-md text-white z-20">
          <p className="font-medium">
            {pickups.length} active pickup{pickups.length !== 1 ? "s" : ""}{" "}
            found
          </p>
        </div>
      )}
    </div>
  );
}
