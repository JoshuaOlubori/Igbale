// "use client";

// import React, { createContext, useContext, useRef } from "react";
// import Map, { MapRef } from "react-map-gl";
// import "mapbox-gl/dist/mapbox-gl.css";

// type MapContextType = {
//   mapRef: React.RefObject<MapRef>;
// };

// const MapContext = createContext<MapContextType | null>(null);

// export function useMap() {
//   const context = useContext(MapContext);
//   if (!context) {
//     throw new Error("useMap must be used within a MapProvider");
//   }
//   return context;
// }

// type MapProviderProps = {
//   children?: React.ReactNode;
//   initialViewState?: {
//     longitude: number;
//     latitude: number;
//     zoom: number;
//   };
// };

// export default function MapProvider({
//   children,
//   initialViewState = {
//     longitude: 3.3792,
//     latitude: 6.5244,
//     zoom: 12,
//   },
// }: MapProviderProps) {
//   const mapRef = useRef<MapRef>(null);

//   return (
//     <MapContext.Provider value={{ mapRef }}>
//       <Map
//         ref={mapRef}
//         mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
//         initialViewState={initialViewState}
//         style={{ width: "100%", height: "100%" }}
//         mapStyle="mapbox://styles/mapbox/streets-v12"
//       >
//         {children}
//       </Map>
//     </MapContext.Provider>
//   );
// }
