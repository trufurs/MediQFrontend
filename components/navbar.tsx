"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import ReminderBell from "./reminderbell";
import { fetchCustomerOrders } from "@/utils/management";
import { FiMenu, FiX, FiChevronDown, FiUser, FiLogOut } from "react-icons/fi";

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
    <nav className="sticky top-0 z-[1050] bg-black/60 backdrop-blur-xl border-b border-white/10 w-full transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative w-9 h-9 transition-transform duration-300 group-hover:scale-110">
              <Image
                src="/logo.svg"
                alt="logo"
                width={35}
                height={35}
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent group-hover:text-blue-400 transition-colors duration-300">
              MediQ
            </span>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center bg-zinc-900/50 border border-white/10 rounded-full py-1 px-4 backdrop-blur-md shadow-inner gap-6">
            <Link href="/" className="text-zinc-300 hover:text-blue-400 text-sm font-medium transition-colors">Home</Link>
            {(user === "temp" || user === "customer") && (
              <>
                <Link href="/medicine" className="text-zinc-300 hover:text-blue-400 text-sm font-medium transition-colors">Medicine</Link>
                <Link href="/prescription" className="text-zinc-300 hover:text-blue-400 text-sm font-medium transition-colors flex items-center gap-1">Rx Scanner 📷</Link>
              </>
            )}
            <Link href="/map" className="text-zinc-300 hover:text-blue-400 text-sm font-medium transition-colors flex items-center gap-1">Map 🗺️</Link>
            {user === "store-owner" && (
              <Link href="/inventory" className="text-zinc-300 hover:text-blue-400 text-sm font-medium transition-colors">Inventory</Link>
            )}
            {(user === "store-owner" || user === "customer") && (
              <Link href="/orders" className="text-zinc-300 hover:text-blue-400 text-sm font-medium transition-colors flex items-center gap-1.5">
                <span>Orders</span>
                {pendingOrdersCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
                    {pendingOrdersCount}
                  </span>
                )}
              </Link>
            )}
            {user === "admin" && (
              <Link href="/admin" className="text-zinc-300 hover:text-blue-400 text-sm font-medium transition-colors">Admin Hub ⚙️</Link>
            )}
          </div>

          {/* User Section & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {/* Reminder Bell for Store Owner */}
            {user === "store-owner" && <ReminderBell />}

            {/* Desktop Auth Section */}
            <div className="hidden md:flex items-center relative">
              {user === "temp" ? (
                <div className="flex items-center space-x-3">
                  <Link href="/login" className="text-zinc-300 hover:text-blue-400 text-sm font-medium transition-colors px-3 py-1.5 rounded-lg border border-white/5 hover:border-white/10 bg-zinc-900/30">
                    Login
                  </Link>
                  <Link href="/signup" className="text-white hover:bg-blue-700 bg-blue-600 text-sm font-medium transition-all px-4 py-1.5 rounded-lg shadow-lg hover:shadow-blue-500/20">
                    Sign Up
                  </Link>
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 py-1.5 px-3 rounded-full hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all focus:outline-none cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold uppercase shadow-md shadow-blue-500/20">
                      {userName.charAt(0) || "U"}
                    </div>
                    <span className="text-zinc-200 text-sm font-medium max-w-[120px] truncate">{userName}</span>
                    <FiChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${isMenuOpen ? 'rotate-180 text-blue-400' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-white/10 bg-zinc-950/95 backdrop-blur-xl p-1.5 shadow-2xl z-[2000] animate-fade-in">
                      <div className="px-3 py-2 border-b border-white/5 mb-1.5">
                        <p className="text-xs text-zinc-500">Signed in as</p>
                        <p className="text-sm font-medium text-zinc-200 truncate">{userName}</p>
                        <p className="text-[10px] text-blue-400 uppercase tracking-wider font-semibold mt-0.5">{user}</p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 text-sm rounded-lg text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <FiUser className="w-4 h-4 text-zinc-400" />
                        <span>Profile</span>
                      </Link>
                      {user === "admin" && (
                        <>
                          <Link
                            href="/admin"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center space-x-2 px-3 py-2 text-sm rounded-lg text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
                          >
                            <span>Admin Hub ⚙️</span>
                          </Link>
                          <Link
                            href="/requests"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center space-x-2 px-3 py-2 text-sm rounded-lg text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
                          >
                            <span>Requests</span>
                          </Link>
                        </>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-left cursor-pointer"
                      >
                        <FiLogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none cursor-pointer"
              >
                {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay & Content */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bottom-0 z-[2000] bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsMenuOpen(false)}>
          <div 
            className="absolute top-0 right-0 w-72 h-full bg-zinc-950 border-l border-white/10 p-5 flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header info */}
            {user !== "temp" && (
              <div className="flex items-center space-x-3 pb-6 border-b border-white/5 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm font-bold uppercase animate-pulse">
                  {userName.charAt(0) || "U"}
                </div>
                <div>
                  <h3 className="text-zinc-200 font-semibold truncate max-w-[160px]">{userName}</h3>
                  <p className="text-xs text-blue-400 uppercase tracking-wider font-semibold">{user}</p>
                </div>
              </div>
            )}

            {/* Navigation links */}
            <div className="flex flex-col space-y-4 flex-grow">
              <Link href="/" className="text-zinc-300 hover:text-white text-base font-medium py-1 transition-colors" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              {(user === "temp" || user === "customer") && (
                <>
                  <Link href="/medicine" className="text-zinc-300 hover:text-white text-base font-medium py-1 transition-colors" onClick={() => setIsMenuOpen(false)}>
                    Medicine
                  </Link>
                  <Link href="/prescription" className="text-zinc-300 hover:text-white text-base font-medium py-1 transition-colors flex items-center gap-1" onClick={() => setIsMenuOpen(false)}>
                    Rx Scanner 📷
                  </Link>
                </>
              )}
              <Link href="/map" className="text-zinc-300 hover:text-white text-base font-medium py-1 transition-colors flex items-center gap-1" onClick={() => setIsMenuOpen(false)}>
                Map 🗺️
              </Link>
              {user === "store-owner" && (
                <Link href="/inventory" className="text-zinc-300 hover:text-white text-base font-medium py-1 transition-colors" onClick={() => setIsMenuOpen(false)}>
                  Inventory
                </Link>
              )}
              {(user === "store-owner" || user === "customer") && (
                <Link href="/orders" className="text-zinc-300 hover:text-white text-base font-medium py-1 transition-colors flex items-center justify-between" onClick={() => setIsMenuOpen(false)}>
                  <span>Orders</span>
                  {pendingOrdersCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {pendingOrdersCount}
                    </span>
                  )}
                </Link>
              )}
              {user === "admin" && (
                <>
                  <Link href="/admin" className="text-zinc-300 hover:text-white text-base font-medium py-1 transition-colors" onClick={() => setIsMenuOpen(false)}>
                    Admin Hub ⚙️
                  </Link>
                  <Link href="/requests" className="text-zinc-300 hover:text-white text-base font-medium py-1 transition-colors" onClick={() => setIsMenuOpen(false)}>
                    Requests
                  </Link>
                </>
              )}
              {user !== "temp" && (
                <Link href="/profile" className="text-zinc-300 hover:text-white text-base font-medium py-1 transition-colors" onClick={() => setIsMenuOpen(false)}>
                  Profile
                </Link>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-white/5">
              {user === "temp" ? (
                <div className="flex flex-col space-y-3">
                  <Link href="/login" className="text-center w-full text-zinc-300 hover:text-white py-2 rounded-lg border border-white/10 bg-zinc-900/30 transition-all" onClick={() => setIsMenuOpen(false)}>
                    Login
                  </Link>
                  <Link href="/signup" className="text-center w-full text-white bg-blue-600 hover:bg-blue-700 py-2 rounded-lg transition-all" onClick={() => setIsMenuOpen(false)}>
                    Sign Up
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all font-medium cursor-pointer"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;