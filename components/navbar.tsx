"use client";
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import '@/styles/custom.css';
import Link from 'next/link';

const Navbar = () => {
  const [user, setUser] = useState<string>("temp");

  // Use useEffect to handle localStorage logic
  useEffect(() => {
    const updateUser = () => {
      const userData = localStorage.getItem("user_data");
      if (userData) {
        const parsedData = JSON.parse(userData);
        setUser(parsedData.role || "temp"); // Safely access role
      } else {
        setUser("temp"); // Default to "temp" if no user is logged in
      }
    };

    // Call updateUser on component mount
    updateUser();

    // Add an event listener to detect changes in localStorage
    window.addEventListener("storage", updateUser);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("storage", updateUser);
    };
  }, []);

  return (
    <nav className="flex flex-row mt-4 p-2 px-20 justify-between w-full bg-gray-800 text-white">
      {/* Logo Section */}
      <div className="flex items-center">
        <Image className="dark:invert" src="/logo.svg" alt="logo" width={40} height={30} />
        <h1 className="text-lg font-bold p-2">MediQ</h1>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-row navb space-x-4">
        <Link href="/" className="p-2 px-5 navbLink hover:text-blue-400">Home</Link>
        <Link href="/mediciene" className="p-2 px-5 navbLink hover:text-blue-400">Mediciene</Link>
        <Link href="/map" className="p-2 px-5 navbLink hover:text-blue-400">Map 🗺️</Link>
        {user === "store-owner" && (
          <>
            <Link href="/inventory" className="p-2 px-5 navbLink hover:text-blue-400">Inventory</Link>
            <Link href="/orders" className="p-2 px-5 navbLink hover:text-blue-400">Orders</Link>
          </>
        )}
      </div>

      {/* Authentication Links */}
      <div className="flex space-x-4">
        {user === "temp" && (
          <>
            <Link href="/login" className="p-2 hover:text-blue-400">Login</Link>
            <Link href="/signup" className="p-2 hover:text-blue-400">Signup</Link>
          </>
        )}

        {user !== "temp" && (
          <>
            <Link href="/profile" className="p-2 hover:text-blue-400">Profile</Link>
            <Link href="/logout" className="p-2 hover:text-blue-400">Logout</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;