"use client";
/* 
import React, { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { Box, CircularProgress, Typography } from "@mui/material";

const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY"; // Replace with your API Key

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const defaultCenter = {
  lat: 28.6139, // Default to New Delhi (change as needed)
  lng: 77.2090,
};

const MapPage = () => {
  const [currentLocation, setCurrentLocation] = useState(defaultCenter);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Function to get the user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          fetchNearbyPlaces(position.coords.latitude, position.coords.longitude);
        },
        () => setLoading(false)
      );
    } else {
      setLoading(false);
    }
  }, []);

  // ✅ Fetch nearby pharmacies and hospitals
  const fetchNearbyPlaces = (lat: number, lng: number) => {
    const service = new window.google.maps.places.PlacesService(document.createElement("div"));

    const request = {
      location: new window.google.maps.LatLng(lat, lng),
      radius: 5000, // 5km radius
      type: ["pharmacy", "hospital"], // Filter for pharmacies & hospitals
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setPlaces([]);
      }
      setLoading(false);
    });
  };

  return (
    <Box sx={{ width: "100%", height: "100vh" }}>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <CircularProgress />
        </Box>
      ) : (
        <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]}>
          <GoogleMap mapContainerStyle={containerStyle} center={currentLocation} zoom={14}>
            {places.map((place, index) => (
              <Marker key={index} position={place.geometry.location} title={place.name} />
            ))}
          </GoogleMap>
        </LoadScript>
      )}
      {!loading && places.length === 0 && (
        <Typography variant="h6" sx={{ textAlign: "center", marginTop: 2 }}>
          No pharmacies or hospitals found nearby.
        </Typography>
      )}
    </Box>
  );
}; */
/* 
export default MapPage;
 */