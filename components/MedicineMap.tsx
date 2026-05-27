"use client";

import React, { useEffect, useState } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

// User Location Icon (Pulsing Blue Dot)
const userLocationIcon = typeof window !== "undefined" ? L.divIcon({
  className: "custom-user-marker",
  html: `
    <div class="relative flex items-center justify-center w-8 h-8">
      <span class="absolute inline-flex h-full w-full rounded-full bg-blue-500/30 opacity-75 animate-ping"></span>
      <div class="relative rounded-full h-3.5 w-3.5 bg-blue-500 border-2 border-white shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
}) : null;

// Pharmacy Icon (Cyan Cross Badge)
const storeLocationIcon = typeof window !== "undefined" ? L.divIcon({
  className: "custom-store-marker",
  html: `
    <div class="relative flex items-center justify-center w-10 h-10">
      <div class="absolute inset-0 bg-cyan-500/20 rounded-full blur-sm animate-pulse"></div>
      <div class="relative w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-500 border border-white/20 shadow-[0_0_12px_rgba(6,182,212,0.6)] flex items-center justify-center text-white">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4.5 h-4.5 text-white">
          <path d="M19 10.5h-5.5V5h-3v5.5H5v3h5.5V19h3v-5.5H19v-3z"/>
        </svg>
      </div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
}) : null;

// Highlighted Icon for Selected Pharmacy
const activeStoreLocationIcon = typeof window !== "undefined" ? L.divIcon({
  className: "custom-active-store-marker",
  html: `
    <div style="position:relative;width:48px;height:56px;display:flex;flex-direction:column;align-items:center;">
      <span style="position:absolute;top:0;left:50%;transform:translateX(-50%);width:48px;height:48px;border-radius:50%;background:rgba(16,185,129,0.25);animation:ping 1s cubic-bezier(0,0,0.2,1) infinite;"></span>
      <div style="
        position:relative;z-index:1;
        width:40px;height:40px;border-radius:50%;
        background:linear-gradient(135deg,#10b981,#059669);
        border:3px solid white;
        box-shadow:0 0 18px rgba(16,185,129,0.9),0 0 6px rgba(16,185,129,0.5);
        display:flex;align-items:center;justify-content:center;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="18" height="18">
          <path d="M19 10.5h-5.5V5h-3v5.5H5v3h5.5V19h3v-5.5H19v-3z"/>
        </svg>
      </div>
      <div style="width:2px;height:12px;background:#10b981;opacity:0.8;margin-top:1px;"></div>
    </div>
  `,
  iconSize: [48, 56],
  iconAnchor: [24, 56],
  popupAnchor: [0, -58],
}) : null;

interface MedicineMapProps {
  userLocation: [number, number];
  stores: any[];
  selectedStore: any | null;
  onSelectStore: (store: any) => void;
  onRouteUpdate?: (routeInfo: { distance: string; duration: string }) => void;
}

// Controller to update map view bounds when selected store or coordinates change
function MapController({
  userLocation,
  selectedStoreLocation,
  isNavigating,
}: {
  userLocation: [number, number];
  selectedStoreLocation: [number, number] | null;
  isNavigating: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (isNavigating) {
      // Follow the user close-up during active navigation
      map.setView(userLocation, 17);
    } else if (selectedStoreLocation) {
      // Fit both coordinates with padding
      const bounds = L.latLngBounds([userLocation, selectedStoreLocation]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    } else {
      map.setView(userLocation, 14);
    }
  }, [userLocation, selectedStoreLocation, isNavigating, map]);

  return null;
}

const MedicineMap: React.FC<MedicineMapProps> = ({
  userLocation,
  stores,
  selectedStore,
  onSelectStore,
  onRouteUpdate,
}) => {
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [routeDistance, setRouteDistance] = useState<string>("");
  const [routeDuration, setRouteDuration] = useState<string>("");

  // Navigation states
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [liveLocation, setLiveLocation] = useState<[number, number] | null>(null);

  const getStoreCoordinates = (store: any): [number, number] | null => {
    const lat = store.storeDetails?.latitude || store.storeAddress?.latitude || store.storeAddress?.location?.coordinates?.[1];
    const lng = store.storeDetails?.longitude || store.storeAddress?.longitude || store.storeAddress?.location?.coordinates?.[0];
    if (typeof lat === "number" && typeof lng === "number") {
      return [lat, lng];
    }
    return null;
  };

  const selectedLoc = selectedStore ? getStoreCoordinates(selectedStore) : null;
  const currentStartLoc = liveLocation || userLocation;

  // Watch user coordinates in real-time when Navigation mode is active
  useEffect(() => {
    let watchId: number | null = null;
    if (isNavigating) {
      if (typeof window !== "undefined" && navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLiveLocation([latitude, longitude]);
          },
          (error) => {
            console.error("Error watching navigation position:", error);
          },
          { enableHighAccuracy: true, maximumAge: 0, timeout: 8000 }
        );
      }
    } else {
      setLiveLocation(null);
    }

    return () => {
      if (watchId !== null && typeof window !== "undefined" && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isNavigating]);

  // Fetch routing path geometry using OSRM open routing service
  useEffect(() => {
    if (!selectedLoc || !currentStartLoc) {
      setRouteCoordinates([]);
      setRouteDistance("");
      setRouteDuration("");
      if (onRouteUpdate) onRouteUpdate({ distance: "", duration: "" });
      return;
    }

    const fetchRoute = async () => {
      try {
        const [startLat, startLng] = currentStartLoc;
        const [storeLat, storeLng] = selectedLoc;

        const response = await axios.get(
          `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${storeLng},${storeLat}?overview=full&geometries=geojson`
        );

        if (response.data?.routes?.[0]) {
          const route = response.data.routes[0];
          const geometry = route.geometry;
          
          // Map coordinates from [lng, lat] to [lat, lng]
          const coords = geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]] as [number, number]);
          setRouteCoordinates(coords);

          // Calculate distance in km and duration in minutes
          const distKm = (route.distance / 1000).toFixed(2);
          const durMin = Math.round(route.duration / 60).toString();

          setRouteDistance(distKm);
          setRouteDuration(durMin);

          if (onRouteUpdate) {
            onRouteUpdate({ distance: distKm, duration: durMin });
          }
        }
      } catch (err) {
        console.error("Error fetching OSRM routing:", err);
      }
    };

    fetchRoute();
  }, [currentStartLoc, selectedLoc, onRouteUpdate]);

  return (
    <div className="relative w-full h-full">
      {/* Top Banner Navigation Mode HUD */}
      {isNavigating && (
        <div className="absolute top-3 left-3 right-3 z-20 bg-emerald-600/90 backdrop-blur-md border border-emerald-500/20 px-4 py-2.5 rounded-2xl flex items-center justify-between shadow-2xl animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
            <p className="text-[10px] font-bold text-white uppercase tracking-wider">
              Live Navigation Active • OSRM
            </p>
          </div>
          <button
            onClick={() => setIsNavigating(false)}
            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[9px] font-bold uppercase transition"
          >
            End Trip
          </button>
        </div>
      )}

      <MapContainer
        center={currentStartLoc}
        zoom={14}
        className="w-full h-full z-10"
        zoomControl={false}
      >
        <MapController userLocation={currentStartLoc} selectedStoreLocation={selectedLoc} isNavigating={isNavigating} />
        
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* User Location Marker (Live or Static) */}
        {currentStartLoc && (
          <Marker position={currentStartLoc} icon={userLocationIcon || undefined}>
            <Popup>
              <div className="text-black font-sans text-xs font-semibold">
                {isNavigating ? "Your Live Position" : "Your Location"}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Pharmacy Markers */}
        {stores.map((store, index) => {
          const loc = getStoreCoordinates(store);
          if (!loc) return null;

          const isActive = selectedStore?.store === store.store;
          const markerIcon = isActive ? activeStoreLocationIcon : storeLocationIcon;

          return (
            <Marker
              key={store.store || index}
              position={loc}
              icon={markerIcon || undefined}
              eventHandlers={{
                click: () => onSelectStore(store),
              }}
            >
              <Popup>
                <div className="text-black font-sans text-xs text-left p-0.5">
                  <h4 className="font-bold text-gray-900">{store.storeDetails?.name || "Partner Pharmacy"}</h4>
                  <p className="text-[10px] text-gray-600 mt-0.5">
                    {store.storeAddress?.street}, {store.storeAddress?.city}
                  </p>
                  <p className="text-[10px] text-emerald-600 font-bold mt-1">
                    Stock: {store.quantity} units
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Shortest Path Polyline */}
        {routeCoordinates.length > 0 && (
          <Polyline
            positions={routeCoordinates}
            pathOptions={{
              color: "#10b981", // Emerald green routing line
              weight: 5,
              opacity: 0.8,
              lineJoin: "round",
            }}
          />
        )}
      </MapContainer>

      {/* Floating Routing Info Badge */}
      {routeDistance && routeDuration && (
        <div className="absolute bottom-3 left-3 right-3 z-20 bg-black/90 backdrop-blur-md border border-emerald-500/20 px-4 py-2.5 rounded-2xl flex items-center justify-between shadow-2xl animate-fade-in gap-3">
          <div className="flex-1">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              {isNavigating ? "Live Trip Details" : "Shortest Path Route"}
            </p>
            <p className="text-xs font-bold text-white mt-0.5">
              Distance: <span className="text-emerald-400">{routeDistance} km</span>
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Est. Time: <span className="text-white">{routeDuration} mins</span>
            </p>
          </div>
          
          {!isNavigating && (
            <button
              onClick={() => setIsNavigating(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg transition duration-200 transform active:scale-95 flex items-center gap-1"
            >
              Start Travel 🚗
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MedicineMap;
