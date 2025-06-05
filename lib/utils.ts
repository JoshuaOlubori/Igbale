import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { env } from "@/data/env/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



  export async function getReverseGeocode(lat: number, lng: number) {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${env.NEXT_PUBLIC_MAPBOX_TOKEN}`
      );
      const data = await response.json();
      return data.features[0]?.place_name || "";
    } catch (error) {
      console.error("Error getting address:", error);
      return "";
    }
  };


  export const calculatePixelRadius = (currentRadius: number, currentZoom: number, currentLat: number) => {
  const EARTH_CIRCUMFERENCE = 40075016.686; // Circumference of Earth in meters at the equator
  const TILE_PIXELS = 256; // Pixels at zoom 0 for a 256x256 tile

  // Meters per pixel at the equator at current zoom level
  const metersPerPixelAtEquator = EARTH_CIRCUMFERENCE / (TILE_PIXELS * Math.pow(2, currentZoom));

  // Meters per pixel at the given latitude
  const metersPerPixel = metersPerPixelAtEquator * Math.cos(currentLat * Math.PI / 180);

  // Convert the desired radius (in meters) to pixels
  return currentRadius / metersPerPixel;
};