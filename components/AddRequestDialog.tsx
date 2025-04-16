"use client";
import dynamic from 'next/dynamic';
import React, { useState } from "react";

const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
import { useMapEvents } from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import { addRequest } from "@/utils/request";


// Fix for Leaflet marker icon
const defaultIcon = L.icon({
    iconUrl: 'marker-icon.ded0b320.png', // Path to your image in the public folder
    shadowUrl: 'marker-shadow.071016c8.png', // Path to your shadow image in the public folder
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

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
  onRequestAdded: (request: unknown) => void;
}

const AddRequestDialog: React.FC<AddRequestDialogProps> = ({
  onClose,
  onRequestAdded,
}) => {
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

  const handleAddRequest = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!newRequest.owner || !newRequest.name || !newRequest.licenseNumber) {
        alert("Please fill in all required fields.");
        return;
      }
      const data = await addRequest(token!, newRequest);
      onRequestAdded(data);
      onClose();
    } catch (err) {
      console.error("Error adding request:", err);
      alert("Failed to add request. Please try again.");
    }
  };

  const LocationSelector = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setNewRequest((prev) => ({
          ...prev,
          address: { ...prev.address, latitude: lat, longitude: lng },
        }));
      },
    });

    return newRequest.address.latitude && newRequest.address.longitude ? (
      <Marker
        position={[newRequest.address.latitude, newRequest.address.longitude]}
        icon={defaultIcon}
      />
    ) : null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
      <div className="bg-gray-900 rounded-lg shadow-lg w-96 max-h-[90vh] overflow-y-auto">
        <div className="bg-gray-800 text-white p-4 rounded-t-lg">
          <h2 className="text-lg font-bold">Add New Request</h2>
        </div>
        <div className="p-6">
          <input
            type="text"
            placeholder="Owner ID"
            value={newRequest.owner}
            onChange={(e) =>
              setNewRequest({ ...newRequest, owner: e.target.value })
            }
            className="w-full mb-4 p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-gray-400"
          />
          <input
            type="text"
            placeholder="Pharmacy Name"
            value={newRequest.name}
            onChange={(e) =>
              setNewRequest({ ...newRequest, name: e.target.value })
            }
            className="w-full mb-4 p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-gray-400"
          />
          <input
            type="text"
            placeholder="License Number"
            value={newRequest.licenseNumber}
            onChange={(e) =>
              setNewRequest({
                ...newRequest,
                licenseNumber: e.target.value,
              })
            }
            className="w-full mb-4 p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-gray-400"
          />
          <input
            type="text"
            placeholder="Contact"
            value={newRequest.contact}
            onChange={(e) =>
              setNewRequest({ ...newRequest, contact: e.target.value })
            }
            className="w-full mb-4 p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-gray-400"
          />
          <h3 className="text-md font-semibold mb-2">Address</h3>
          <input
            type="text"
            placeholder="Street"
            value={newRequest.address.street}
            onChange={(e) =>
              setNewRequest({
                ...newRequest,
                address: { ...newRequest.address, street: e.target.value },
              })
            }
            className="w-full mb-2 p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-gray-400"
          />
          <input
            type="text"
            placeholder="City"
            value={newRequest.address.city}
            onChange={(e) =>
              setNewRequest({
                ...newRequest,
                address: { ...newRequest.address, city: e.target.value },
              })
            }
            className="w-full mb-2 p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-gray-400"
          />
          <input
            type="text"
            placeholder="State"
            value={newRequest.address.state}
            onChange={(e) =>
              setNewRequest({
                ...newRequest,
                address: { ...newRequest.address, state: e.target.value },
              })
            }
            className="w-full mb-2 p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-gray-400"
          />
          <input
            type="text"
            placeholder="Postal Code"
            value={newRequest.address.postalCode}
            onChange={(e) =>
              setNewRequest({
                ...newRequest,
                address: {
                  ...newRequest.address,
                  postalCode: e.target.value,
                },
              })
            }
            className="w-full mb-2 p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-gray-400"
          />
          <input
            type="text"
            placeholder="Country"
            value={newRequest.address.country}
            onChange={(e) =>
              setNewRequest({
                ...newRequest,
                address: { ...newRequest.address, country: e.target.value },
              })
            }
            className="w-full mb-2 p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-gray-400"
          />
          <h3 className="text-md font-semibold mb-2">Select Location</h3>
          <div className="w-full h-64 mb-4">
            <MapContainer
              center={[20, 78]}
              zoom={5}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationSelector />
            </MapContainer>
          </div>
          <p className="text-sm text-gray-400">
            Click on the map to select latitude and longitude.
          </p>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAddRequest}
              className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRequestDialog;
