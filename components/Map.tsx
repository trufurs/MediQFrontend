"use client";

import React, { useState, useEffect, useCallback, useReducer } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { useMap } from 'react-leaflet';

// Custom HTML/CSS DivIcon for User Location
const userLocationIcon = typeof window !== 'undefined' ? L.divIcon({
  className: 'custom-user-marker',
  html: `
    <div class="relative flex items-center justify-center w-8 h-8">
      <span class="absolute inline-flex h-full w-full rounded-full bg-blue-500/30 opacity-75 animate-ping"></span>
      <div class="relative rounded-full h-3.5 w-3.5 bg-blue-500 border-2 border-white shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
}) : null;

// Custom HTML/CSS DivIcon for Pharmacies
const storeLocationIcon = typeof window !== 'undefined' ? L.divIcon({
  className: 'custom-store-marker',
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

// Highlighted DivIcon for the currently selected/active store
const activeStoreLocationIcon = typeof window !== 'undefined' ? L.divIcon({
  className: 'custom-active-store-marker',
  html: `
    <div style="position:relative;width:48px;height:56px;display:flex;flex-direction:column;align-items:center;">
      <span style="position:absolute;top:0;left:50%;transform:translateX(-50%);width:48px;height:48px;border-radius:50%;background:rgba(6,182,212,0.25);animation:ping 1s cubic-bezier(0,0,0.2,1) infinite;"></span>
      <div style="
        position:relative;z-index:1;
        width:40px;height:40px;border-radius:50%;
        background:linear-gradient(135deg,#06b6d4,#10b981);
        border:3px solid white;
        box-shadow:0 0 18px rgba(6,182,212,0.9),0 0 6px rgba(6,182,212,0.5);
        display:flex;align-items:center;justify-content:center;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="18" height="18">
          <path d="M19 10.5h-5.5V5h-3v5.5H5v3h5.5V19h3v-5.5H19v-3z"/>
        </svg>
      </div>
      <div style="width:2px;height:12px;background:#06b6d4;opacity:0.8;margin-top:1px;"></div>
    </div>
  `,
  iconSize: [48, 56],
  iconAnchor: [24, 56],
  popupAnchor: [0, -58],
}) : null;

// Fix for Leaflet marker icon using official Leaflet assets on unpkg CDN (ensures visibility)
const defaultIcon = typeof window !== 'undefined' ? L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
}) : null;

if (typeof window !== 'undefined' && defaultIcon) {
  L.Marker.prototype.options.icon = defaultIcon;
}

// Dynamically import MapContainer and related components to support SSR
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

// Custom component to update the map's center and zoom
function MapUpdater({ location }: { location: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(location, 14);
  }, [location, map]);
  return null;
}

const host = `${process.env.NEXT_PUBLIC_BACKEND}`;

type State = {
  places: Array<{ name: string; lat: number; lng: number; details?: any }>;
  loading: boolean;
  error: string;
};

type Action =
  | { type: 'SET_PLACES'; payload: Array<{ name: string; lat: number; lng: number; details?: any }> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string };

const initialState: State = {
  places: [],
  loading: false,
  error: '',
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_PLACES':
      return { ...state, places: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

function MapPage() {
  const [location, setLocation] = useState<[number, number]>([26.907524, 75.739639]); // Default location (Jaipur/India)
  const [city, setCity] = useState('');
  const [state, dispatch] = useReducer(reducer, initialState);
  const [activePlaceIndex, setActivePlaceIndex] = useState<number | null>(null);
  const [mobileTab, setMobileTab] = useState<"list" | "map">("list");

  const fetchPlacesByCity = useCallback(async () => {
    if (!city.trim()) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: '' });
    try {
      const response = await axios.get(`${host}/address/${city}`);
      const data = response.data;

      if (!response.data || response.data.message === 'No places found' || data.length === 0) {
        dispatch({ type: 'SET_ERROR', payload: 'No medical facilities found in this city.' });
        dispatch({ type: 'SET_PLACES', payload: [] });
        return;
      }

      const parsedPlaces = data.map((place: any) => ({
        name: place.store?.name || 'Pharmacy',
        lat: place.latitude,
        lng: place.longitude,
        details: place,
      }));

      dispatch({
        type: 'SET_PLACES',
        payload: [
          ...parsedPlaces,
          {
            name: 'Your Current Location',
            lat: location[0],
            lng: location[1],
            details: { isUser: true },
          },
        ],
      });

      if (parsedPlaces.length > 0) {
        setLocation([parsedPlaces[0].lat, parsedPlaces[0].lng]);
        setMobileTab("map");
      }
    } catch (err) {
      console.error('Error fetching places by city:', err);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch places. Please check the spelling and try again.' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [city, location]);

  const fetchPlacesByCurrentLocation = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: '' });
    try {
      const response = await axios.get(`${host}/address/${location[0]}/${location[1]}`);

      if (!response.data || response.data.message === 'No places found') {
        dispatch({ type: 'SET_ERROR', payload: 'No pharmacies or hospitals found near your coordinates.' });
        return;
      }

      const data = response.data;
      dispatch({
        type: 'SET_PLACES',
        payload: [
          ...data.map((place: any) => ({
            name: place.store?.name || 'Pharmacy',
            lat: place.latitude,
            lng: place.longitude,
            details: place,
          })),
          {
            name: 'Your Current Location',
            lat: location[0],
            lng: location[1],
            details: { isUser: true },
          },
        ],
      });
      if (data.length > 0) {
        setMobileTab("map");
      }
    } catch (err) {
      console.error('Error fetching places by coordinates:', err);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to find local medical facilities.' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [location]);

  // Request current coordinates on load
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLatLng: [number, number] = [position.coords.latitude, position.coords.longitude];
          setLocation(userLatLng);
          dispatch({
            type: 'SET_PLACES',
            payload: [{ name: 'Your Current Location', lat: userLatLng[0], lng: userLatLng[1], details: { isUser: true } }],
          });
        },
        (error) => {
          console.error('Error fetching location:', error);
          dispatch({ type: 'SET_ERROR', payload: 'Could not fetch your coordinates. Please search manually.' });
          setLocation([26.907524, 75.739639]); // Default fallback
        }
      );
    }
  }, []);

  const handleCardClick = (place: any, index: number) => {
    setLocation([place.lat, place.lng]);
    setActivePlaceIndex(index);
    setMobileTab("map");
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-8">
      {/* Title */}
      <div className="text-left mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Nearby Facilities</h1>
        <p className="text-gray-400 text-sm mt-1">Locate pharmacies, hospitals, and partner drugstores on the map.</p>
      </div>

      {/* Mobile Screen Navigation Tabs */}
      <div className="flex lg:hidden bg-white/5 p-1 rounded-2xl border border-white/10 mb-6 w-full">
        <button
          type="button"
          onClick={() => setMobileTab("list")}
          className={`flex-grow py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer text-center ${
            mobileTab === "list" ? "bg-cyan-600/20 text-cyan-400 border border-cyan-500/30" : "text-gray-400 hover:text-white"
          }`}
        >
          📋 Finder & List
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("map")}
          className={`flex-grow py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer text-center ${
            mobileTab === "map" ? "bg-cyan-600/20 text-cyan-400 border border-cyan-500/30" : "text-gray-400 hover:text-white"
          }`}
        >
          🗺️ Map View
        </button>
      </div>

      {/* Grid container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: controls & list */}
        <div className={`lg:col-span-4 flex flex-col space-y-6 text-left ${mobileTab === "list" ? "flex" : "hidden lg:flex"}`}>
          
          {/* Search Card */}
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl shadow-xl backdrop-blur-lg">
            <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-4">Location Finder</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="city-input" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Enter City Name
                </label>
                <input
                  type="text"
                  id="city-input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. San Francisco, Jaipur"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition duration-200 text-sm"
                />
              </div>

              {state.error && <p className="text-red-400 text-xs font-medium bg-red-950/20 border border-red-500/20 p-2.5 rounded-lg">{state.error}</p>}
              
              <div className="flex flex-col gap-2.5 pt-2">
                <button
                  onClick={fetchPlacesByCity}
                  disabled={state.loading}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm shadow-md transition transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                >
                  {state.loading ? "Searching..." : "Search City"}
                </button>
                <button
                  onClick={fetchPlacesByCurrentLocation}
                  disabled={state.loading}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl text-sm transition transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                >
                  Locate Near Me 📍
                </button>
              </div>
            </div>
          </div>

          {/* List Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl flex-grow overflow-hidden flex flex-col max-h-[400px] lg:max-h-[500px]">
            <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-4">Results List</h2>
            
            {state.loading ? (
              <div className="flex items-center justify-center flex-grow py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : state.places.length === 0 ? (
              <div className="flex items-center justify-center flex-grow py-12 text-center text-gray-500 text-sm">
                Search to display nearby partner stores.
              </div>
            ) : (
              <div className="overflow-y-auto space-y-3 pr-1 flex-grow">
                {state.places.map((place, idx) => {
                  const isUser = place.details?.isUser;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleCardClick(place, idx)}
                      className={`p-4 rounded-xl border transition duration-250 cursor-pointer text-left ${
                        isUser
                          ? "bg-blue-600/5 border-blue-500/20"
                          : activePlaceIndex === idx
                          ? "bg-white/10 border-blue-500/50 shadow-md"
                          : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                      }`}
                    >
                      <h3 className="font-bold text-sm text-white flex items-center justify-between">
                        <span>{place.name}</span>
                        {isUser && <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full font-normal">You</span>}
                      </h3>
                      {place.details?.street && (
                        <p className="text-xs text-gray-400 mt-1 truncate">
                          {place.details.street}, {place.details.city}
                        </p>
                      )}
                      {place.details?.store?.contact && (
                        <p className="text-[11px] text-blue-400 mt-1 font-mono">
                          Call: {place.details.store.contact}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right column: Leaflet Map */}
        <div className={`lg:col-span-8 bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl h-[calc(100vh-240px)] min-h-[350px] sm:h-[450px] lg:h-[650px] relative z-10 ${mobileTab === "map" ? "block" : "hidden lg:block"}`}>
          <MapContainer
            center={location}
            zoom={15}
            className="h-full w-full"
            style={{ height: '100%', width: '100%' }}
          >
            <MapUpdater location={location} />
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            {state.places.map((place, index) => {
              const isUser = place.details?.isUser;
              const isActive = activePlaceIndex === index;
              const markerIcon = isUser
                ? userLocationIcon
                : isActive
                ? activeStoreLocationIcon
                : storeLocationIcon;
              return (
                <Marker
                  key={index}
                  position={[place.lat, place.lng]}
                  icon={markerIcon || undefined}
                >
                  <Popup>
                    <div className="text-left font-sans p-1 text-black">
                      <h4 className="font-bold text-sm text-gray-900">{place.name}</h4>
                      {place.details?.street && (
                        <p className="text-xs text-gray-650 mt-1">
                          {place.details.street}, {place.details.city}
                        </p>
                      )}
                      {place.details?.store?.contact && (
                        <p className="text-xs text-blue-600 font-semibold mt-1">
                          Phone: {place.details.store.contact}
                        </p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

      </div>
    </div>
  );
}

export default MapPage;