"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet's default icon issue
delete L.Icon.Default.prototype.options.className;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom component to update the map's center
function MapUpdater({ location }: { location: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(location);
  }, [location, map]);
  return null;
}

function MapPage() {
  const [location, setLocation] = useState<[number, number]>([26.907524, 75.739639]); // Default location
  const [city, setCity] = useState('');
  const [places, setPlaces] = useState<{ name: string; lat: number; lng: number }[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [placeType, setPlaceType] = useState<'all' | 'hospital' | 'pharmacy'>('all');

  useEffect(() => {
    // Request user's location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        console.error('Error fetching location:', error);
        setError('Unable to fetch your location. Please enter a city manually.');
        setLocation([51.505, -0.09]); // Default fallback location
      }
    );
  }, []);

  const fetchPlaces = useCallback(async () => {
    setLoading(true);
    try {
      const query = city
        ? `/api/places?city=${city}&type=${placeType !== 'all' ? placeType : ''}`
        : `/api/places?lat=${location[0]}&lng=${location[1]}&type=${placeType !== 'all' ? placeType : ''}`;
      const response = await fetch(query);
      if (!response.ok) {
        setError('Failed to fetch places');
      }
      const data = await response.json();
      setPlaces(
        data.results.map((place: { name: string; geometry: { location: { lat: number; lng: number } } }) => ({
          name: place.name,
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
        }))
      );
    } catch (err) {
      console.error('Error fetching places:', err);
      setError('Failed to fetch places. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [location, city, placeType]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

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
        <button
          onClick={fetchPlaces}
          className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Search
        </button>
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