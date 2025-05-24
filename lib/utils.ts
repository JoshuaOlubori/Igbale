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