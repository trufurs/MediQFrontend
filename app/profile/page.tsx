/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ProfilePage() {
    const API_URL = `${process.env.NEXT_PUBLIC_BACKEND}`;
  const [profileData, setProfileData] = useState<any>(null);
  const [storeData, setStoreData] = useState<any>(null);
  const [addressData, setAddressData] = useState<any>(null);
  const [storeError, setStoreError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false); // State to toggle edit mode
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    phone: "",
  });

  useEffect(() => {
    try {
      // Fetch profile data from localStorage
      const storedData = localStorage.getItem("user_data");
      if (!storedData) {
        throw new Error("No user data found in localStorage");
      }
      const parsedData = JSON.parse(storedData);
      setProfileData(parsedData);
      setFormData({
        name: parsedData.name,
        gender: parsedData.gender,
        phone: parsedData.phone,
      });

      // If the user is a store owner, fetch store details and address
      if (parsedData.role === "store-owner") {
        fetchStoreDetails();
      }
    } catch (err) {
      console.error("Error fetching profile data:", err);
      setError("Failed to fetch profile information.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStoreDetails = async () => {
    const token = localStorage.getItem("auth_token");
    try {
      const response = await axios.get(`${API_URL}/user/store`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStoreData(response.data);

      // Fetch address details for the store
      fetchStoreAddress();
    } catch (err) {
      console.error("Error fetching store details:", err);
      setStoreError("Failed to fetch store details.");
    }
  };

  const fetchStoreAddress = async () => {
    const token = localStorage.getItem("auth_token");
    try {
      const response = await axios.get(`${API_URL}/address/auth`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAddressData(response.data);
    } catch (err) {
      console.error("Error fetching address details:", err);
      setAddressError("Failed to fetch address details.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("auth_token");
      const response = await axios.put(
        "${API_URL}/user", 
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProfileData(response.data); // Update the profile data with the response
      localStorage.setItem("user_data", JSON.stringify(response.data)); // Update localStorage with the new profile data
      setIsEditing(false); // Exit edit mode
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile.");
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

  if (!profileData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-gray-700">Loading profile information...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto  px-8 py-8">
      {/* Profile Header */}
      <div className="flex items-center space-x-6 mb-8">
        <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-500 sm:w-20 sm:h-20 md:w-24 md:h-24">
          {profileData.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-4xl font-bold text-blue-600">{profileData.name}</h1>
          <p className="text-gray-600 text-lg">{profileData.email}</p>
        </div>
      </div>

      {/* Profile Details */}
      {!isEditing ? (
        <div className="space-y-6">
          <div className="text-left">
            <h2 className="text-2xl font-semibold text-gray-800">Phone</h2>
            <p className="text-lg text-gray-700">{profileData.phone}</p>
          </div>

          <div className="text-left">
            <h2 className="text-2xl font-semibold text-gray-800">Gender</h2>
            <p className="text-lg text-gray-700 capitalize">{profileData.gender}</p>
          </div>

          <div className="text-left">
            <h2 className="text-2xl font-semibold text-gray-800">Role</h2>
            <p className="text-lg text-gray-700 capitalize">{profileData.role}</p>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="text-left">
            <label className="block text-gray-800 font-semibold mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              required
            />
          </div>

          <div className="text-left">
            <label className="block text-gray-800 font-semibold mb-2">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              required
            >
              <option className="text-black" value="male">Male</option>
              <option className="text-black" value="female">Female</option>
              <option className="text-black" value="other">Other</option>
            </select>
          </div>

          <div className="text-left">
            <label className="block text-gray-800 font-semibold mb-2">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              required
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Store Details Section */}
      {profileData.role === "store-owner" && (
        <div className="mt-12">
          <h2 className="text-3xl text-left font-bold text-blue-600 mb-6">Store Details</h2>
          <div className="space-y-6">
            {storeData ? (
              <>
                <div className="text-left">
                  <h2 className="text-2xl font-semibold text-gray-800">Store Name</h2>
                  <p className="text-lg text-gray-700">{storeData.name}</p>
                </div>
                <div className="text-left">
                  <h2 className="text-2xl font-semibold text-gray-800">License Number</h2>
                  <p className="text-lg text-gray-700">{storeData.licenseNumber}</p>
                </div>
                <div className="text-left">
                  <h2 className="text-2xl font-semibold text-gray-800">Contact</h2>
                  <p className="text-lg text-gray-700">{storeData.contact}</p>
                </div>
              </>
            ) : (
              <p className="text-lg text-red-500">{storeError}</p>
            )}

            {addressData ? (
              <div className="text-left">
                <h2 className="text-2xl font-semibold text-gray-800">Store Address</h2>
                <p className="text-lg text-gray-700">{addressData.street}</p>
                <p className="text-lg text-gray-700">
                  {addressData.city}, {addressData.state}
                </p>
                <p className="text-lg text-gray-700">
                  {addressData.postalCode}, {addressData.country}
                </p>
              </div>
            ) : (
              <p className="text-lg text-red-500">{addressError}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}