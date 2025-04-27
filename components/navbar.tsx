"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

const Navbar = () => {
  const [user, setUser] = useState<string>("temp");
  const [userName, setUserName] = useState<string>("Guest"); // For displaying user name
  const [isMenuOpen, setIsMenuOpen] = useState(false); // For dropdown menu

  // Fetch user data from localStorage
  useEffect(() => {
    const updateUser = () => {
      const userData = localStorage.getItem("user_data");
      if (userData) {
        const parsedData = JSON.parse(userData);
        setUser(parsedData.role || "temp");
        setUserName(parsedData.name || "Guest");
      } else {
        setUser("temp");
        setUserName("Guest");
      }
    };

    // Initial fetch of user data
    updateUser();

    // Listen for changes in localStorage
    const handleStorageChange = () => {
      updateUser();
    };

    window.addEventListener("storage", handleStorageChange);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("user_data");
    localStorage.removeItem("auth_token");
    setUserName("Guest");
    setUser("temp");
    setIsMenuOpen(false); // Close the menu on logout
    redirect("/"); // Redirect to main page
  };

  return (
    <nav className="flex flex-wrap items-center justify-between p-4 bg-black text-white">
      {/* Logo Section */}
      <div className="flex items-center">
        <Image className="dark:invert" src="/logo.svg" alt="logo" width={40} height={30} />
        <h1 className="text-lg font-bold ml-2">MediQ</h1>
      </div>

      {/* Navigation Links */}
      <div className="hidden md:flex space-x-6 navb p-1.5 px-4">
        <Link href="/" className="hover:text-blue-400 ">Home</Link>
        <Link href="/medicine" className="hover:text-blue-400">Medicine</Link>
        <Link href="/map" className="hover:text-blue-400">Map 🗺️</Link>
        {user === "store-owner" && (
          <>
            <Link href="/inventory" className="hover:text-blue-400">Inventory</Link>
            <Link href="/orders" className="hover:text-blue-400">Orders</Link>
          </>
        )}
      </div>

      {/* Authentication Links */}
      <div className="relative">
        {user === "temp" ? (
          <div className="flex space-x-4">
            <Link href="/login" className="hover:text-blue-400">Login</Link>
            <Link href="/signup" className="hover:text-blue-400">Signup</Link>
          </div>
        ) : (
          <div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="hidden md:flex hover:text-blue-400 focus:outline-none"
            >
              {userName} ▼
            </button>
            {isMenuOpen && (
              <div className="hidden md:flex absolute right-0 mt-2 whitespace-pre-wrap w-auto w:max-60 bg-gray-700 rounded-md shadow-lg">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm hover:bg-gray-600 hover:text-blue-400"
                >
                  Profile
                </Link>
                {user === "admin" && (
                  <>
                  <Link
                    href="/requests"
                    className="block px-4 py-2 text-sm hover:bg-gray-600 hover:text-blue-400"
                  >
                    Requests
                  </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-600 hover:text-blue-400"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="hover:text-blue-400 focus:outline-none"
        >
          ☰
        </button>
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-gray-700 rounded-md shadow-lg">
            <Link href="/" className="block px-4 py-2 text-sm hover:bg-gray-600 hover:text-blue-400">
              Home
            </Link>
            <Link href="/medicine" className="block px-4 py-2 text-sm hover:bg-gray-600 hover:text-blue-400">
              Medicine
            </Link>
            <Link href="/map" className="block px-4 py-2 text-sm hover:bg-gray-600 hover:text-blue-400">
              Map 🗺️
            </Link>
            
            {user === "store-owner" && (
              <>
                <Link
                  href="/inventory"
                  className="block px-4 py-2 text-sm hover:bg-gray-600 hover:text-blue-400"
                >
                  Inventory
                </Link>
                <Link
                  href="/orders"
                  className="block px-4 py-2 text-sm hover:bg-gray-600 hover:text-blue-400"
                >
                  Orders
                </Link>
              </>
            )}
            {user === "admin" && (
              <>
                  <Link
                    href="/requests"
                    className="block px-4 py-2 text-sm hover:bg-gray-600 hover:text-blue-400"
                  >
                    Requests
                  </Link>
              </>
                )}
            {user === "temp" ? (
              <>
                <Link
                  href="/login"
                  className="block px-4 py-2 text-sm hover:bg-gray-600 hover:text-blue-400"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="block px-4 py-2 text-sm hover:bg-gray-600 hover:text-blue-400"
                >
                  Signup
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm hover:bg-gray-600 hover:text-blue-400"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-600 hover:text-blue-400"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;