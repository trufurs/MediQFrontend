/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";
import axios from "axios";

interface Store {
  store: string;
  name: string;
  distance: number;
  quantity: number;
  expiryDate: string;
  storeAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

interface MedicineData {
  name: string;
  [key: string]: any;
}
export default function Page({
  params,
}: {
  params: Promise<{ medicineid: string }>;
}) {
  const { medicineid } = React.use(params);
  const { showToast } = useToast();
  const [stores, setStores] = useState<Store[]>([]);
  const [loadingStores, setLoadingStores] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [medicineData, setMedicineData] = useState<MedicineData | null>(null);
  const [search, setSearch] = useState<boolean>(true);

  if (medicineid.split("-").length > 1) {
    setSearch(false);
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND;

  // Fetch medicine details
  useEffect(() => {
    const fetchMedicineData = async () => {
      try {
        const response = await axios.get(`${backendUrl}/search/${medicineid}`);
        setMedicineData(response.data);
      } catch (err) {
        console.error("Error fetching medicine details:", err);
        setError("Failed to fetch medicine details.");
        showToast("Failed to fetch medicine details.", "error");
      }
    };

    fetchMedicineData();
  }, [medicineid, backendUrl, showToast]);

  // Search for stores with the medicine nearby
  const handleSearchStores = async () => {
    setLoadingStores(true);
    setError(null);

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        showToast("Please log in to search for stores.", "error");
        return;
      }

      if (!navigator.geolocation) {
        showToast("Geolocation is not supported by this browser.", "error");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const response = await axios.get(
              `${backendUrl}/inventory/stores-with-medicine-nearby`,
              {
                params: {
                  medicine: medicineid,
                  lat: latitude,
                  lng: longitude,
                  radius: 20, // Radius in kilometers
                },
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (response.data.length === 0) {
              setStores([]);
              showToast(
                "No stores found with the specified medicine nearby.",
                "error"
              );
            } else {
              setStores(response.data);
              showToast("Stores fetched successfully!", "success");
            }
          } catch (error: any) {
            if (error.response && error.response.status === 404) {
              setStores([]);
              showToast(
                "No stores found with the specified medicine nearby.",
                "error"
              );
            } else {
              console.error("Error fetching stores:", error);
              showToast("Failed to fetch stores. Please try again.", "error");
            }
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          showToast(
            "Failed to get user location. Please enable location services.",
            "error"
          );
        }
      );
    } catch (err) {
      console.error("Unexpected error:", err);
      showToast("An unexpected error occurred. Please try again.", "error");
    } finally {
      setLoadingStores(false);
    }
  };

  // Handle order request
  const handleOrderRequest = async (storeId: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        showToast("Please log in to place an order.", "error");
        return;
      }

      await axios.post(
        `${backendUrl}/orders`,
        { medicineId: medicineid, storeId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      showToast("Order request sent successfully!", "success");
    } catch (err) {
      console.error("Error placing order:", err);
      showToast("Failed to place order. Please try again.", "error");
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-red-500">Error</h1>
        <p className="text-gray-700">{error}</p>
      </div>
    );
  }

  if (!medicineData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-blue-500">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-12 py-8">
      {/* Medicine Name */}
      <h1 className="text-4xl font-bold mb-6 text-blue-600 text-left">
        {medicineData.name}
      </h1>

      {/* Medicine Details */}
      <div className="space-y-6">
        {Object.entries(medicineData).map(([key, value]) => {
          if (key === "name") return null;

          const formattedKey = key
            .replace(/_/g, " ")
            .replace(/^\w/, (c) => c.toUpperCase());

          return (
            <div key={key} className="text-left">
              <h2 className="text-2xl font-semibold mb-2 text-white">
                {formattedKey}
              </h2>
              <p className="text-green-300 text-lg leading-relaxed">
                {typeof value === "string"
                  ? value
                  : JSON.stringify(value, null, 2)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Search Stores Button */}
      {search && (
        <div className="mt-8">
          <button
            onClick={handleSearchStores}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            {loadingStores ? "Searching Stores..." : "Search Stores"}
          </button>
        </div>
      )}

      {/* Display Stores */}
      {stores.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Available Stores
          </h2>
          <div className="space-y-4">
            {stores.map((store) => (
              <div
                key={store.store}
                className="p-4 border border-gray-600 rounded-md bg-gray-800"
              >
                <p>
                  <span className="font-semibold">Store Name:</span>{" "}
                  {store.storeAddress?.street || "Unknown"}
                </p>
                <p>
                  <span className="font-semibold">City:</span>{" "}
                  {store.storeAddress?.city}
                </p>
                <p>
                  <span className="font-semibold">State:</span>{" "}
                  {store.storeAddress?.state}
                </p>
                <p>
                  <span className="font-semibold">Country:</span>{" "}
                  {store.storeAddress?.country}
                </p>
                <p>
                  <span className="font-semibold">Distance:</span>{" "}
                  {(store.distance / 1000).toFixed(2)} km
                </p>
                <p>
                  <span className="font-semibold">Quantity Available:</span>{" "}
                  {store.quantity}
                </p>
                <p>
                  <span className="font-semibold">Expiry Date:</span>{" "}
                  {new Date(store.expiryDate).toLocaleDateString()}
                </p>
                <button
                  onClick={() => handleOrderRequest(store.store)}
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                >
                  Request Order
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}