"use client";
import dynamic from 'next/dynamic';
import React, { useState, useEffect } from "react";
import { useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { FiX, FiCheck, FiMapPin, FiMap, FiBriefcase, FiHash, FiPhone, FiAlertCircle } from "react-icons/fi";
import { useToast } from "@/context/ToastContext";

import "leaflet/dist/leaflet.css";
import { addRequest } from "@/utils/request";

// Dynamically import react-leaflet components to prevent SSR errors
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });

// Custom HTML/CSS DivIcon for selected store location
const selectionLocationIcon = typeof window !== 'undefined' ? L.divIcon({
  className: 'custom-selection-marker',
  html: `
    <div class="relative flex flex-col items-center justify-center w-10 h-10">
      <div class="absolute -top-6 animate-bounce">
        <div class="relative w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 border border-white/20 shadow-[0_0_15px_rgba(6,182,212,0.8)] flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-white">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      </div>
      <div class="absolute bottom-1 w-2.5 h-2.5 bg-cyan-400 rounded-full opacity-75 blur-[2px] animate-ping"></div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
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

interface Address {
  latitude: number;
  longitude: number;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface NewRequest {
  owner: string;
  name: string;
  licenseNumber: string;
  contact: string;
  address: Address;
}

interface AddRequestDialogProps {
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onRequestAdded: (request: any) => void;
}

const AddRequestDialog: React.FC<AddRequestDialogProps> = ({
  onClose,
  onRequestAdded,
}) => {
  const { showToast } = useToast();
  const [newRequest, setNewRequest] = useState<NewRequest>({
    owner: "",
    name: "",
    licenseNumber: "",
    contact: "",
    address: {
      latitude: 0,
      longitude: 0,
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
  });
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Auto-fill Registrant Owner ID from localStorage user session
  useEffect(() => {
    const stored = localStorage.getItem("user_data");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setNewRequest((prev) => ({
          ...prev,
          owner: parsed._id || parsed.id || "",
        }));
      } catch (err) {
        console.error("Error parsing user profile data:", err);
      }
    }
  }, []);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.address) {
          const addr = data.address;
          const street = [
            addr.house_number || addr.building,
            addr.road || addr.pedestrian,
            addr.suburb || addr.neighbourhood
          ].filter(Boolean).join(", ") || data.display_name || "";

          setNewRequest((prev) => ({
            ...prev,
            address: {
              ...prev.address,
              latitude: lat,
              longitude: lng,
              street: street,
              city: addr.city || addr.town || addr.village || addr.municipality || "",
              state: addr.state || "",
              postalCode: addr.postcode || "",
              country: addr.country || "",
            },
          }));
        }
      }
    } catch (err) {
      console.error("Error during reverse geocoding:", err);
    }
  };

  const detectLocationManually = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        reverseGeocode(latitude, longitude);
      }, (error) => {
        console.error("Error getting location:", error);
        showToast("Could not access your location. Check browser permissions.", "warning");
      });
    } else {
      showToast("Geolocation is not supported by your browser.", "error");
    }
  };

  const handleAddRequest = async () => {
    const errors: Record<string, string> = {};

    if (!newRequest.name.trim()) errors.name = "Pharmacy name is required.";
    if (!newRequest.licenseNumber.trim()) errors.licenseNumber = "License number is required.";
    if (!newRequest.contact.trim()) {
      errors.contact = "Contact number is required.";
    } else if (!/^[\d\s\-\+]{10,15}$/.test(newRequest.contact.replace(/\s/g, ''))) {
      errors.contact = "Contact must be 10-15 digits.";
    }
    if (!newRequest.address.street.trim()) errors.street = "Street address is required.";
    if (!newRequest.address.city.trim()) errors.city = "City is required.";
    if (newRequest.address.latitude === 0 && newRequest.address.longitude === 0) {
      errors.coords = "Please select store coordinates on the map.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      showToast(Object.values(errors)[0], "warning");
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    try {
      const token = localStorage.getItem("auth_token");
      const data = await addRequest(token!, newRequest);
      onRequestAdded(data);
      showToast("Store registration request submitted!", "success");
      onClose();
    } catch (err) {
      console.error("Error adding request:", err);
      showToast("Failed to submit registration request. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const getuserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setNewRequest((prev) => ({
            ...prev,
            address: { ...prev.address, latitude, longitude },
          }));
          reverseGeocode(latitude, longitude);
        }, (error) => {
          console.error("Error getting location:", error);
          setUserLocation([26.907524, 75.739639]); // Fallback center
        });
      } else {
        setUserLocation([26.907524, 75.739639]);
      }
    };
    getuserLocation();
  }, []);

  const LocationSelector = () => {
    const map = useMap();

    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setNewRequest((prev) => ({
          ...prev,
          address: { ...prev.address, latitude: lat, longitude: lng },
        }));
        reverseGeocode(lat, lng);
      },
    });

    useEffect(() => {
      if (userLocation) {
        map.flyTo(userLocation, 13);
      }
    }, [userLocation, map]);

    return newRequest.address.latitude && newRequest.address.longitude && selectionLocationIcon ? (
      <Marker
        position={[newRequest.address.latitude, newRequest.address.longitude]}
        icon={selectionLocationIcon}
      />
    ) : null;
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 sm:p-4 p-0">
      {/* Modal Container */}
      <div className="bg-zinc-950 border border-white/10 sm:rounded-3xl rounded-none shadow-2xl w-full h-full sm:h-auto max-w-lg sm:max-h-[90vh] overflow-hidden flex flex-col relative animate-scale-up">
        {/* Glow corner */}
        <div className="absolute -right-20 -top-20 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        
        {/* Header */}
        <div className="bg-white/5 border-b border-white/5 px-6 py-5 flex justify-between items-center relative z-10 text-left">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Register Partner Store</h2>
            <p className="text-xs text-gray-400 mt-0.5">Submit drugstore credentials for admin verification.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition cursor-pointer"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-grow relative z-10 text-left">
          
          {/* Pharmacy Credentials */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
              <FiBriefcase /> Pharmacy Credentials
            </h3>
            
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Registrant Owner ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={newRequest.owner}
                    disabled
                    className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/5 rounded-xl text-gray-400 text-xs font-mono select-all cursor-not-allowed opacity-75"
                  />
                  <FiHash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Pharmacy Name <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. CareMax Drugstore"
                  value={newRequest.name}
                  onChange={(e) => {
                    setNewRequest({ ...newRequest, name: e.target.value });
                    if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  className={`w-full px-4 py-2.5 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition text-xs ${
                    fieldErrors.name ? "border-rose-500/60 bg-rose-500/5" : "border-white/10"
                  }`}
                  required
                />
                {fieldErrors.name && (
                  <p className="text-rose-400 text-[10px] mt-1 flex items-center gap-1">
                    <FiAlertCircle size={9} /> {fieldErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  License Number <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. DL-293849"
                  value={newRequest.licenseNumber}
                  onChange={(e) => {
                    setNewRequest({ ...newRequest, licenseNumber: e.target.value });
                    if (fieldErrors.licenseNumber) setFieldErrors((prev) => ({ ...prev, licenseNumber: "" }));
                  }}
                  className={`w-full px-4 py-2.5 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition text-xs font-mono ${
                    fieldErrors.licenseNumber ? "border-rose-500/60 bg-rose-500/5" : "border-white/10"
                  }`}
                  required
                />
                {fieldErrors.licenseNumber && (
                  <p className="text-rose-400 text-[10px] mt-1 flex items-center gap-1">
                    <FiAlertCircle size={9} /> {fieldErrors.licenseNumber}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Contact Number <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. +91 98765 43210"
                    value={newRequest.contact}
                    onChange={(e) => {
                      setNewRequest({ ...newRequest, contact: e.target.value });
                      if (fieldErrors.contact) setFieldErrors((prev) => ({ ...prev, contact: "" }));
                    }}
                    className={`w-full pl-9 pr-4 py-2.5 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition text-xs ${
                      fieldErrors.contact ? "border-rose-500/60 bg-rose-500/5" : "border-white/10"
                    }`}
                    required
                  />
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                </div>
                {fieldErrors.contact && (
                  <p className="text-rose-400 text-[10px] mt-1 flex items-center gap-1">
                    <FiAlertCircle size={9} /> {fieldErrors.contact}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Store Address */}
          <div className="space-y-4 pt-2 border-t border-white/5">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
              <FiMapPin /> Store Address
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Street Address <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 102 medical road, sector-5"
                  value={newRequest.address.street}
                  onChange={(e) => {
                    setNewRequest({
                      ...newRequest,
                      address: { ...newRequest.address, street: e.target.value },
                    });
                    if (fieldErrors.street) setFieldErrors((prev) => ({ ...prev, street: "" }));
                  }}
                  className={`w-full px-4 py-2.5 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition text-xs ${
                    fieldErrors.street ? "border-rose-500/60 bg-rose-500/5" : "border-white/10"
                  }`}
                  required
                />
                {fieldErrors.street && (
                  <p className="text-rose-400 text-[10px] mt-1 flex items-center gap-1">
                    <FiAlertCircle size={9} /> {fieldErrors.street}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  City <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jaipur"
                  value={newRequest.address.city}
                  onChange={(e) => {
                    setNewRequest({
                      ...newRequest,
                      address: { ...newRequest.address, city: e.target.value },
                    });
                    if (fieldErrors.city) setFieldErrors((prev) => ({ ...prev, city: "" }));
                  }}
                  className={`w-full px-4 py-2.5 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition text-xs ${
                    fieldErrors.city ? "border-rose-500/60 bg-rose-500/5" : "border-white/10"
                  }`}
                  required
                />
                {fieldErrors.city && (
                  <p className="text-rose-400 text-[10px] mt-1 flex items-center gap-1">
                    <FiAlertCircle size={9} /> {fieldErrors.city}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  State / Region
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rajasthan"
                  value={newRequest.address.state}
                  onChange={(e) => setNewRequest({
                    ...newRequest,
                    address: { ...newRequest.address, state: e.target.value },
                  })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Postal Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. 302001"
                  value={newRequest.address.postalCode}
                  onChange={(e) => setNewRequest({
                    ...newRequest,
                    address: { ...newRequest.address, postalCode: e.target.value },
                  })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Country
                </label>
                <input
                  type="text"
                  placeholder="e.g. India"
                  value={newRequest.address.country}
                  onChange={(e) => setNewRequest({
                    ...newRequest,
                    address: { ...newRequest.address, country: e.target.value },
                  })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition text-xs"
                />
              </div>
            </div>
          </div>

          {/* Interactive Map Selector */}
          <div className="space-y-3 pt-2 border-t border-white/5">
            <div className="flex justify-between items-center text-xs">
              <h3 className="font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                <FiMap /> Locate Pharmacy on Map
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={detectLocationManually}
                  className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  Detect Location 📍
                </button>
                {newRequest.address.latitude > 0 && (
                  <span className="text-[10px] font-mono text-gray-450 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                    [{newRequest.address.latitude.toFixed(4)}, {newRequest.address.longitude.toFixed(4)}]
                  </span>
                )}
              </div>
            </div>
            {fieldErrors.coords && (
              <p className="text-rose-400 text-[10px] flex items-center gap-1">
                <FiAlertCircle size={9} /> {fieldErrors.coords}
              </p>
            )}

            <div className="w-full h-60 rounded-2xl overflow-hidden border border-white/10 relative z-20">
              {userLocation ? (
                <MapContainer
                  center={userLocation}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                  className="h-full w-full"
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  />
                  <LocationSelector />
                </MapContainer>
              ) : (
                <div className="h-full w-full bg-zinc-950 flex flex-col items-center justify-center text-xs text-gray-400">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-cyan-500 mb-2"></div>
                  Loading map coordinates...
                </div>
              )}
            </div>
            
            <p className="text-[10px] text-gray-500 leading-relaxed">
              📍 Click directly on the map to pinpoint your drugstore physical building location.
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-white/5 border-t border-white/5 px-6 py-4 flex gap-3 z-10">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAddRequest}
            disabled={submitting}
            className="flex-grow flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg transition duration-200 transform active:scale-95 disabled:opacity-50"
          >
            <FiCheck size={14} /> {submitting ? "Submitting Request..." : "Submit Registry"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRequestDialog;