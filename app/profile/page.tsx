/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";
import { FiUser, FiPhone, FiInfo, FiMapPin, FiCalendar, FiEdit2, FiShield, FiSliders, FiBriefcase } from "react-icons/fi";

export default function ProfilePage() {
  const API_URL = `${process.env.NEXT_PUBLIC_BACKEND}`;
  const [profileData, setProfileData] = useState<any>(null);
  const [storeData, setStoreData] = useState<any>(null);
  const [addressData, setAddressData] = useState<any>(null);
  const [storeError, setStoreError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    phone: "",
    avatar: "",
    bio: "",
    dateOfBirth: "",
    address: "",
  });

  const avatarPresets = [
    { name: "Clinical Doctor", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=MediQDoctor" },
    { name: "Pharmacist", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=MediQPharmacist" },
    { name: "Patient Male", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=MediQPatientMale" },
    { name: "Patient Female", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=MediQPatientFemale" },
    { name: "Health Bot", url: "https://api.dicebear.com/7.x/bottts/svg?seed=MediQCustomer" },
    { name: "Identicon Admin", url: "https://api.dicebear.com/7.x/identicon/svg?seed=MediQAdmin" }
  ];

  useEffect(() => {
    try {
      const storedData = localStorage.getItem("user_data");
      if (!storedData) {
        throw new Error("No user data found in localStorage");
      }
      const parsedData = JSON.parse(storedData);
      setProfileData(parsedData);
      setFormData({
        name: parsedData.name || "",
        gender: parsedData.gender || "male",
        phone: parsedData.phone || "",
        avatar: parsedData.avatar || "",
        bio: parsedData.bio || "",
        dateOfBirth: parsedData.dateOfBirth || "",
        address: parsedData.address || "",
      });

      if (parsedData.role === "store-owner") {
        fetchStoreDetails();
      }
    } catch (err) {
      console.error("Error fetching profile data:", err);
      setError("Failed to fetch profile information.");
      showToast("Failed to fetch profile information.", "error");
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectPresetAvatar = (url: string) => {
    setFormData((prev) => ({ ...prev, avatar: url }));
    showToast("Avatar selected!", "success");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("auth_token");
      const response = await axios.put(
        `${API_URL}/user`, 
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProfileData(response.data);
      localStorage.setItem("user_data", JSON.stringify(response.data));
      setIsEditing(false);
      showToast("Profile updated successfully.", "success");
    } catch (err) {
      console.error("Error updating profile:", err);
      showToast("Failed to update profile.", "error");
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-red-500">Error</h1>
        <p className="text-gray-300">{error}</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
        <p className="text-gray-400">Loading profile information...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl text-left">
      
      {/* Profile Header Banner */}
      <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 mb-10 bg-white/5 border border-white/10 p-8 rounded-3xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        
        {/* Avatar Display */}
        <div className="relative group">
          {profileData.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profileData.avatar}
              alt="Avatar"
              className="w-24 h-24 rounded-2xl border-2 border-cyan-500/30 shadow-2xl object-cover bg-zinc-900"
            />
          ) : (
            <div className="w-24 h-24 bg-cyan-500/10 border-2 border-cyan-500/30 text-cyan-400 rounded-2xl flex items-center justify-center text-4xl font-extrabold shadow-inner">
              {profileData.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-grow text-center md:text-left space-y-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border border-cyan-500/30 text-cyan-400 uppercase tracking-widest">
            {profileData.role} Profile
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">{profileData.name}</h1>
          <p className="text-gray-450 text-sm">{profileData.email}</p>
          {profileData.bio && (
            <p className="text-gray-300 text-xs italic mt-3 bg-white/5 p-3 rounded-xl border border-white/5 max-w-xl">
              &ldquo;{profileData.bio}&rdquo;
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form or Details */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-xl">
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
              <h2 className="text-xl font-bold text-white tracking-tight">Personal Details</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-4.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-md transition"
                >
                  <FiEdit2 size={12} /> Edit Details
                </button>
              )}
            </div>

            {!isEditing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                    <FiPhone /> Contact Phone
                  </span>
                  <p className="text-base font-bold text-white">{profileData.phone || "Not Specified"}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                    <FiInfo /> Gender
                  </span>
                  <p className="text-base font-bold text-white capitalize">{profileData.gender || "Not Specified"}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                    <FiCalendar /> Date of Birth
                  </span>
                  <p className="text-base font-bold text-white">
                    {profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : "Not Specified"}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                    <FiMapPin /> Personal Address
                  </span>
                  <p className="text-base font-bold text-white">{profileData.address || "Not Specified"}</p>
                </div>

              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-5">
                
                {/* Avatar presets grid */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Select Avatar Preset
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {avatarPresets.map((av) => (
                      <button
                        key={av.name}
                        type="button"
                        onClick={() => handleSelectPresetAvatar(av.url)}
                        className={`p-1.5 rounded-xl border transition flex flex-col items-center gap-1 cursor-pointer bg-white/5 ${
                          formData.avatar === av.url ? "border-cyan-500 bg-cyan-500/10 shadow-lg" : "border-white/5 hover:border-white/20"
                        }`}
                        title={av.name}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={av.url} alt={av.name} className="w-10 h-10 rounded-lg bg-zinc-950" />
                        <span className="text-[8px] text-gray-400 font-semibold truncate max-w-full">{av.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Custom Avatar Image URL
                  </label>
                  <input
                    type="url"
                    name="avatar"
                    placeholder="https://example.com/my-photo.jpg"
                    value={formData.avatar}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 transition text-xs cursor-pointer"
                      required
                    >
                      <option className="text-black" value="male">Male</option>
                      <option className="text-black" value="female">Female</option>
                      <option className="text-black" value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 transition text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Profile Bio / Description
                  </label>
                  <textarea
                    name="bio"
                    placeholder="Tell us a little bit about yourself or medical conditions store-owners should keep in mind..."
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="w-full h-20 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition text-xs resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Address Location
                  </label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Enter street, city, state, country..."
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition text-xs"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: profileData.name || "",
                        gender: profileData.gender || "male",
                        phone: profileData.phone || "",
                        avatar: profileData.avatar || "",
                        bio: profileData.bio || "",
                        dateOfBirth: profileData.dateOfBirth || "",
                        address: profileData.address || "",
                      });
                      showToast("Update discarded.", "success");
                    }}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl text-xs transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold rounded-xl shadow-lg transition duration-200"
                  >
                    Save Settings
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Store owner special details rendering */}
          {profileData.role === "store-owner" && (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-6 border-b border-white/5 pb-4">Store Allocation Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-5">
                  {storeData ? (
                    <>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Store Name</span>
                        <p className="text-base font-bold text-white">{storeData.name}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">License Verification Number</span>
                        <p className="text-sm font-bold text-white font-mono">{storeData.licenseNumber}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Contact Number</span>
                        <p className="text-sm font-bold text-cyan-400">{storeData.contact}</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-rose-450">{storeError || "Loading store registry..."}</p>
                  )}
                </div>

                <div className="space-y-4 border-t md:border-t-0 md:border-l border-white/5 pt-5 md:pt-0 md:pl-8">
                  {addressData ? (
                    <div className="space-y-1 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 block">Store Physical Coordinates</span>
                      <p className="font-bold text-white">{addressData.street}</p>
                      <p className="text-gray-305">{addressData.city}, {addressData.state}</p>
                      <p className="text-gray-400">{addressData.postalCode}, {addressData.country}</p>
                      <p className="text-[10px] font-mono text-gray-500 pt-3">GPS Location: [{addressData.latitude}, {addressData.longitude}]</p>
                    </div>
                  ) : (
                    <p className="text-sm text-rose-450">{addressError || "Loading address registry..."}</p>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Role Quick Shortcuts Dashboard */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl space-y-5">
            <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest border-b border-white/5 pb-2">Workspace Shortcuts</h2>
            
            {profileData.role === "admin" && (
              <div className="space-y-3">
                <p className="text-xs text-gray-400">You are logged in with full system Administrator rights.</p>
                <Link href="/requests" className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 text-xs font-bold text-white hover:text-cyan-400 transition">
                  <FiShield size={14} /> Pending Approvals Queue
                </Link>
                <Link href="/" className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 text-xs font-bold text-white hover:text-cyan-400 transition">
                  <FiSliders size={14} /> Global System Dashboard
                </Link>
              </div>
            )}

            {profileData.role === "store-owner" && (
              <div className="space-y-3">
                <p className="text-xs text-gray-400">Manage your pharmacy physical store inventory batches.</p>
                <Link href="/inventory" className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 text-xs font-bold text-white hover:text-cyan-400 transition">
                  <FiBriefcase size={14} /> Stock Management
                </Link>
                <Link href="/orders" className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 text-xs font-bold text-white hover:text-cyan-400 transition">
                  <FiSliders size={14} /> Order Requests Desk
                </Link>
              </div>
            )}

            {profileData.role === "customer" && (
              <div className="space-y-3">
                <p className="text-xs text-gray-400">Order medicines, view request history logs and find local pharmacies.</p>
                <Link href="/orders" className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 text-xs font-bold text-white hover:text-cyan-400 transition">
                  <FiSliders size={14} /> My Requested Orders
                </Link>
                <Link href="/medicine" className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 text-xs font-bold text-white hover:text-cyan-400 transition">
                  <FiUser size={14} /> Lookup Medicine Library
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}