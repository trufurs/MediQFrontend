"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import ReminderBell from "./reminderbell";
import { fetchCustomerOrders } from "@/utils/management";

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

  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  // Poll pending B2C order counts
  useEffect(() => {
    if (user === "temp" || user === "admin") {
      setPendingOrdersCount(0);
      return;
    }

    const loadPendingCount = async () => {
      try {
        const data = await fetchCustomerOrders();
        const pending = data.filter((o: any) => o.status === "pending").length;
        setPendingOrdersCount(pending);
      } catch (err) {
        console.error("Error fetching navbar pending order counts:", err);
      }
    };

    loadPendingCount();
    const interval = setInterval(loadPendingCount, 40000);
    return () => clearInterval(interval);
  }, [user]);

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
      <div className=" flex items-center">
        <Image
          className=" dark:invert not-dark:invert"
          src="/logo.svg"
          alt="logo"
          width={40}
          height={30}
        />
        <h1 className="text-lg font-bold ml-2 text-white">MediQ</h1>
      </div>

      {/* Navigation Links */}
      <div className="hidden md:flex space-x-6 navb p-1.5 px-4">
        <Link href="/" className="hover:text-blue-400 ">Home</Link>
        <Link href="/medicine" className="hover:text-blue-400">Medicine</Link>
        <Link href="/map" className="hover:text-blue-400">Map 🗺️</Link>
        {user === "store-owner" && (
          <Link href="/inventory" className="hover:text-blue-400">Inventory</Link>
        )}
        {(user === "store-owner" || user === "customer") && (
          <Link href="/orders" className="hover:text-blue-400 flex items-center gap-1.5">
            <span>Orders</span>
            {pendingOrdersCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white animate-pulse">
                {pendingOrdersCount}
              </span>
            )}
          </Link>
        )}
        {user === "admin" && (
          <Link href="/admin" className="hover:text-blue-400">Admin Hub ⚙️</Link>
        )}
      </div>

      {/* Authentication Links */}
      <div className="relative">
        {user === "temp" ? (
          <div className="hidden md:flex space-x-4">
            <Link href="/login" className="hover:text-blue-400">Login</Link>
            <Link href="/signup" className="hover:text-blue-400">Signup</Link>
          </div>
        ) : (
          <div>
            <div className="hidden md:flex">
            {user === "store-owner" && <ReminderBell/>}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className=" hover:text-blue-400 focus:outline-none"
            >
              {userName} ▼
            </button>
            </div>
            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="hidden md:flex flex-col absolute right-0 mt-2 whitespace-pre-wrap w-auto w:max-60 bg-gray-700 rounded-md shadow-lg">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm hover:bg-gray-600 hover:text-blue-400"
                >
                  Profile
                </Link>
                {user === "admin" && (
                  <>
                  <Link
                    href="/admin"
                    className="block px-4 py-2 text-sm hover:bg-gray-600 hover:text-blue-400"
                  >
                    Admin Hub ⚙️
                  </Link>
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
        {user === "store-owner" && <ReminderBell/>}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="hover:text-blue-400 focus:outline-none"
        >
          ☰
        </button>
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-gray-700 rounded-md shadow-lg z-10">
            <Link href="/" className="block px-4 py-2 text-sm hover:bg-gray-600 hover:text-blue-400" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
            <Link href="/medicine" className="block px-4 py-2 text-sm hover:bg-gray-600 hover:text-blue-400" onClick={() => setIsMenuOpen(false)}>
              Medicine
            </Link>
            <Link href="/map" className="block px-4 py-2 text-sm hover:bg-gray-600 hover:text-blue-400" onClick={() => setIsMenuOpen(false)}>
              Map 🗺️
            </Link>
            
            {user === "store-owner" && (
              <Link
                href="/inventory"
                className="block px-4 py-2 text-sm hover:bg-gray-600 hover:text-blue-400"
                onClick={() => setIsMenuOpen(false)}
              >
                Inventory
              </Link>
            )}
            {(user === "store-owner" || user === "customer") && (
              <Link
                href="/orders"
                className="block px-4 py-2 text-sm hover:bg-gray-600 hover:text-blue-400"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex justify-between items-center w-full">
                  <span>Orders</span>
                  {pendingOrdersCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-650 text-[10px] font-bold text-white">
                      {pendingOrdersCount}
                    </span>
                  )}
                </div>
              </Link>
            )}
            {user === "admin" && (
              <>
                  <Link
                    href="/admin"
                    className="block px-4 py-2 text-sm hover:bg-gray-600 hover:text-blue-400"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Hub ⚙️
                  </Link>
                  <Link
                    href="/requests"
                    className="block px-4 py-2 text-sm hover:bg-gray-600 hover:text-blue-400"
                    onClick={() => setIsMenuOpen(false)}
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
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="block px-4 py-2 text-sm hover:bg-gray-600 hover:text-blue-400"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Signup
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm hover:bg-gray-600 hover:text-blue-400"
                  onClick={() => setIsMenuOpen(false)}
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