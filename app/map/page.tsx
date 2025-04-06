"use client";
import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';


import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import axios from 'axios';

// Dynamically import MapContainer and related components
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
import { useMap } from 'react-leaflet';

// Custom component to update the map's center
function MapUpdater({ location }: { location: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(location);
  }, [location, map]);
  return null;
}

const host = `${process.env.NEXT_PUBLIC_BACKEND}`;

function MapPage() {
  const [location, setLocation] = useState<[number, number]>([26.907524, 75.739639]); // Default location
  const [city, setCity] = useState('');
  const [places, setPlaces] = useState<{ name: string; lat: number; lng: number }[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchPlacesByCity = useCallback(async () => {
    if (!city) {
      setError('Please enter a city name.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const query = `${host}/address/${city}`;
      const response = await axios.get(query);
      if (!response || !response.data) {
        setError('Failed to fetch places for the city.');
        return;
      }
      const data = response.data;
      if(!data || data.message === 'No places found') {
        setError('No places found for the specified city.');
        return;
      }

      // Map the data to extract relevant fields for markers
      setPlaces(
        data.map((place: {latitude:number , longitude:number ,store : { name : string}}) => ({
          name: place.store.name,
          lat: place.latitude,
          lng: place.longitude,
        })).concat({
          name: 'Your Location',
          lat: location[0],
          lng: location[1],
        })
      );
      
    } catch (err) {
      console.error('Error fetching places by city:', err);
      setError('Failed to fetch places. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [city]);

  const fetchPlacesByCurrentLocation = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const query = `${host}/address/${location[0]}/${location[1]}`;
      const response = await axios.get(query);

      console.log('Response from API:', response.data);
      // Check if the response contains valid data
      if (!response.data || response.data.message === 'No places found') {
        setError('No places found.');
        return;
      }

      const data = response.data;
      console.log('Places fetched by current location:', data);

      // Map the data to extract relevant fields for markers
      setPlaces(
        [
          ...data.map((place: { latitude: number; longitude: number; store: { name: string } }) => ({
            name: place.store.name,
            lat: place.latitude,
            lng: place.longitude,
          })),
          {
            name: 'Your Location',
            lat: location[0],
            lng: location[1],
          },
        ]
      );
    } catch (err) {
      console.error('Error fetching places by current location:', err);
      setError('Failed to fetch places. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [location]);

  useEffect(() => {
    // Ensure this runs only on the client side
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLatLng: [number, number] = [position.coords.latitude, position.coords.longitude];
          setLocation(userLatLng);

          // Add user's location to the places list
          setPlaces((prevPlaces) => [
            ...prevPlaces,
            { name: 'Your Location', lat: userLatLng[0], lng: userLatLng[1] },
          ]);
        },
        (error) => {
          console.error('Error fetching location:', error);
          setError('Unable to fetch your location. Please enter a city manually.');
          setLocation([51.505, -0.09]); // Default fallback location
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Nearby Hospitals and Pharmacies</h1>
      
      <div className="mb-4">
        <label className="block text text-start font-medium text-white-700 mb-2">
          Enter City:
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </label>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {loading && <p className="text-blue-500 mb-4">Loading places...</p>}
        <div className="flex gap-4">
          <button
            onClick={fetchPlacesByCity}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Search by City
          </button>
          <button
            onClick={fetchPlacesByCurrentLocation}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Search by Current Location
          </button>
        </div>
      </div>
      <div className="h-[400px] w-full">
        <MapContainer
          center={location}
          zoom={15}
          className="h-full w-full"
          style={{ height: '100%', width: '100%' }}
        >
          <MapUpdater location={location} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {places.map((place, index) => (
            <Marker key={index} position={[place.lat, place.lng]}>
              <Popup>{place.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default MapPage;