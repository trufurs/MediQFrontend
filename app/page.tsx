"use client";

import FeatureCard from "@/components/homecard";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AddRequestDialog from "@/components/AddRequestDialogWrapper";
import { checkPendingRequests, fetchRequests, updateRequestStatus } from "@/utils/request";
import { fetchInventory, fetchCustomerOrders } from "@/utils/management";
import { useToast } from "@/context/ToastContext";
import axios from "axios";

export default function HomePage() {
  const [showDialog, setShowDialog] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  // Authentication State
  const [role, setRole] = useState<string>("temp");
  const [userName, setUserName] = useState<string>("Guest");

  // Portal Specific Data States
  const [loadingPortalData, setLoadingPortalData] = useState(false);
  
  // Store Owner stats
  const [storeStats, setStoreStats] = useState({
    totalInventory: 0,
    pendingOrders: 0,
    expiringSoon: 0,
  });

  // Admin Portal data
  const [adminRequests, setAdminRequests] = useState<any[]>([]);

  // Customer Portal data
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const host = `${process.env.NEXT_PUBLIC_BACKEND}`;

  // Read User profile
  useEffect(() => {
    const userData = localStorage.getItem("user_data");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setRole(parsed.role || "temp");
        setUserName(parsed.name || "Guest");
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
  }, []);

  // Fetch Portal Specific Data
  useEffect(() => {
    if (role === "temp") return;

    const fetchPortalData = async () => {
      setLoadingPortalData(true);
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      try {
        if (role === "store-owner") {
          // Fetch inventory stats
          const inventoryItems = await fetchInventory();
          const expiring = inventoryItems.filter((item: any) => item.remainingDays <= 30 && item.remainingDays > 0).length;
          
          // Fetch customer B2C order requests
          const b2cOrders = await fetchCustomerOrders();
          const pending = b2cOrders.filter((o: any) => o.status === "pending").length;

          setStoreStats({
            totalInventory: inventoryItems.length,
            pendingOrders: pending,
            expiringSoon: expiring,
          });
        } else if (role === "admin") {
          // Fetch pending registration requests for admin view
          const requests = await fetchRequests(token);
          setAdminRequests(requests);
        } else if (role === "customer") {
          // Fetch personal B2C requests
          const orders = await fetchCustomerOrders();
          setCustomerOrders(orders);
        }
      } catch (err) {
        console.error("Error fetching portal data:", err);
      } finally {
        setLoadingPortalData(false);
      }
    };

    fetchPortalData();
  }, [role]);

  const handleStoreManagementClick = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      showToast("Please log in to access store management.", "error");
      router.push("/login");
      return;
    }

    if (role === "store-owner") {
      router.push("/inventory");
      return;
    }

    try {
      const pendingRequests = await checkPendingRequests(token);
      if (!pendingRequests || pendingRequests.length === 0) {
        setShowDialog(true);
      } else {
        showToast("You already have pending requests. Admin will review them.", "success");
      }
    } catch (error) {
      console.error("Error checking pending requests:", error);
      showToast("Failed to check pending requests. Please try again.", "error");
    }
  };

  const handleAdminVerifyRequest = async (requestId: string, status: "verified" | "rejected") => {
    try {
      const token = localStorage.getItem("auth_token");
      await updateRequestStatus(token!, requestId, status);
      showToast(`Request has been ${status} successfully!`, "success");
      
      // Update list
      setAdminRequests((prev) =>
        prev.map((r) => (r._id === requestId ? { ...r, status: status === "verified" ? "completed" : "cancelled" } : r))
      );
    } catch (err) {
      console.error("Error updating status:", err);
      showToast("Failed to update status. Please try again.", "error");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 3) {
      router.push(`/medicine?q=${encodeURIComponent(searchQuery)}`);
    } else {
      showToast("Please enter at least 3 characters to search", "error");
    }
  };

  // ==========================================
  // RENDER: GUEST PORTAL
  // ==========================================
  const renderGuestPortal = () => (
    <div className="flex flex-col items-center">
      <section className="hero text-center mb-16 max-w-3xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-blue-400 mb-6 tracking-wide uppercase">
          <span>✨</span>
          <span>Next-Generation Healthcare Portal</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-none">
          Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">MediQ</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mt-6 leading-relaxed max-w-2xl mx-auto font-medium">
          Your intelligent health companion. Look up drug composition details, track medical store stock quantities in real time, and easily place prescription orders.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => router.push("/medicine")}
            className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition duration-250 transform hover:-translate-y-0.5"
          >
            Find Medicines
          </button>
          <button
            onClick={handleStoreManagementClick}
            className="px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition duration-250 transform hover:-translate-y-0.5"
          >
            Partner Store Portal
          </button>
        </div>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-16" />

      <section id="features" className="w-full">
        <div className="text-left mb-10">
          <h2 className="text-2xl font-bold text-white tracking-tight">Core Services</h2>
          <p className="text-gray-400 text-sm mt-1">Explore all capabilities offered by MediQ.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon="💊"
            title="Medicine Library"
            description="Search for local medications or pull clinical records directly from OpenFDA. View indications, warnings, active ingredients, and compare generic composition."
            button="Search Medicine"
            onClick={() => router.push("/medicine")}
            accentClass="from-blue-500/10 to-cyan-500/10"
          />
          <FeatureCard
            icon="🏪"
            title="Store Management"
            description="Register your physical drugstore. Track inventory batches, monitor expiry reminders, purchase stock via supplier restock orders, and complete patient prescriptions."
            button="Access Dashboard"
            onClick={handleStoreManagementClick}
            accentClass="from-indigo-500/10 to-purple-500/10"
          />
          <FeatureCard
            icon="🗺️"
            title="Nearby Pharmacies"
            description="Use real-time geolocation maps to locate nearby pharmacies. Check if the specific medicine you need is in stock before heading out."
            button="Open Map View"
            onClick={() => router.push("/map")}
            accentClass="from-purple-500/10 to-pink-500/10"
          />
        </div>
      </section>
    </div>
  );

  // ==========================================
  // RENDER: CUSTOMER PORTAL
  // ==========================================
  const renderCustomerPortal = () => (
    <div className="w-full text-left space-y-10">
      {/* Welcome & Search */}
      <div className="bg-white/5 border border-white/10 p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-2 self-start">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Hello, {userName}!</h1>
          <p className="text-gray-400 text-sm">Find medicines and local pharmacies stocking them.</p>
        </div>

        <form onSubmit={handleSearchSubmit} className="w-full md:max-w-md flex gap-3">
          <input
            type="text"
            placeholder="Search medicine library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow px-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <button
            type="submit"
            className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Grid: Actions on left, Orders history on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Navigation shortcuts */}
        <div className="lg:col-span-5 space-y-6">
          <h2 className="text-xl font-bold text-white tracking-tight">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/medicine" className="bg-white/5 border border-white/10 hover:border-blue-500/30 p-6 rounded-2xl hover:bg-white/10 transition block">
              <span className="text-3xl">💊</span>
              <h3 className="text-lg font-bold text-white mt-4">Browse Library</h3>
              <p className="text-gray-400 text-xs mt-1">Look up generic formulas & active ingredients.</p>
            </Link>
            <Link href="/map" className="bg-white/5 border border-white/10 hover:border-purple-500/30 p-6 rounded-2xl hover:bg-white/10 transition block">
              <span className="text-3xl">🗺️</span>
              <h3 className="text-lg font-bold text-white mt-4">Map Finder</h3>
              <p className="text-gray-400 text-xs mt-1">Find nearby partner drugstores & clinics.</p>
            </Link>
            <Link href="/profile" className="bg-white/5 border border-white/10 hover:border-emerald-500/30 p-6 rounded-2xl hover:bg-white/10 transition block">
              <span className="text-3xl">👤</span>
              <h3 className="text-lg font-bold text-white mt-4">Edit Profile</h3>
              <p className="text-gray-400 text-xs mt-1">Manage passwords, contact, and preferences.</p>
            </Link>
            <button
              onClick={handleStoreManagementClick}
              className="bg-white/5 border border-white/10 hover:border-amber-500/30 p-6 rounded-2xl hover:bg-white/10 transition block text-left w-full"
            >
              <span className="text-3xl">🏪</span>
              <h3 className="text-lg font-bold text-white mt-4">Partner Store</h3>
              <p className="text-gray-400 text-xs mt-1">Register a new store registration request.</p>
            </button>
          </div>
        </div>

        {/* Requests history overview */}
        <div className="lg:col-span-7 bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col max-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white tracking-tight">Recent Order Requests</h2>
            <Link href="/orders" className="text-xs text-blue-400 hover:underline">View All</Link>
          </div>

          {loadingPortalData ? (
            <div className="flex items-center justify-center flex-grow py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : customerOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-grow py-12 text-center text-gray-500 text-sm">
              <p>You haven&apos;t placed any medicine orders yet.</p>
              <button
                onClick={() => router.push("/medicine")}
                className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-lg transition"
              >
                Find Medicines
              </button>
            </div>
          ) : (
            <div className="overflow-y-auto space-y-3 pr-1 flex-grow">
              {customerOrders.slice(0, 5).map((order: any) => (
                <div key={order._id} className="p-4 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white truncate max-w-xs">
                      {order.medicines?.[0]?.medicine_id?.name || "Medicine Order"}
                    </p>
                    <p className="text-xs text-gray-400">
                      Store: {order.store?.name || "Pharmacy Store"} • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    order.status === "completed"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : order.status === "cancelled"
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  }`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );

  // ==========================================
  // RENDER: STORE OWNER PORTAL
  // ==========================================
  const renderStoreOwnerPortal = () => (
    <div className="w-full text-left space-y-10">
      {/* Banner */}
      <div className="bg-white/5 border border-white/10 p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Pharmacy Portal</h1>
          <p className="text-gray-400 text-sm mt-1">Logged in as Partner Store Owner: <strong className="text-white">{userName}</strong></p>
        </div>
        <div className="flex gap-3">
          <Link href="/inventory">
            <button className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-md transition transform hover:-translate-y-0.5">
              Stock Manager
            </button>
          </Link>
          <Link href="/orders">
            <button className="px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition transform hover:-translate-y-0.5">
              Manage Orders
            </button>
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-450 uppercase tracking-wider">Total Batches</p>
            <p className="text-3xl font-extrabold text-white">
              {loadingPortalData ? "..." : storeStats.totalInventory}
            </p>
          </div>
          <span className="text-3xl p-3 bg-white/5 rounded-xl border border-white/5">📦</span>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-450 uppercase tracking-wider">Patient Orders (Pending)</p>
            <p className="text-3xl font-extrabold text-amber-400">
              {loadingPortalData ? "..." : storeStats.pendingOrders}
            </p>
          </div>
          <span className="text-3xl p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">⌛</span>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-450 uppercase tracking-wider">Nearing Expiry (30 Days)</p>
            <p className={`text-3xl font-extrabold ${storeStats.expiringSoon > 0 ? "text-rose-450" : "text-white"}`}>
              {loadingPortalData ? "..." : storeStats.expiringSoon}
            </p>
          </div>
          <span className="text-3xl p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">⚠️</span>
        </div>
      </div>

      {/* Shortcuts grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Quick Shortcuts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/inventory" className="p-5 bg-white/5 border border-white/10 hover:border-white/20 rounded-xl hover:bg-white/10 transition block">
            <h3 className="font-bold text-white text-sm">Add Stock Batch</h3>
            <p className="text-gray-450 text-xs mt-1">Register local medicine quantities into store.</p>
          </Link>
          <Link href="/orders/add" className="p-5 bg-white/5 border border-white/10 hover:border-white/20 rounded-xl hover:bg-white/10 transition block">
            <h3 className="font-bold text-white text-sm">Supplier Purchase</h3>
            <p className="text-gray-450 text-xs mt-1">Create restock replenishment orders (B2B).</p>
          </Link>
          <Link href="/orders" className="p-5 bg-white/5 border border-white/10 hover:border-white/20 rounded-xl hover:bg-white/10 transition block">
            <h3 className="font-bold text-white text-sm">Customer Requests</h3>
            <p className="text-gray-450 text-xs mt-1">Review pending patient prescriptions.</p>
          </Link>
          <Link href="/profile" className="p-5 bg-white/5 border border-white/10 hover:border-white/20 rounded-xl hover:bg-white/10 transition block">
            <h3 className="font-bold text-white text-sm">Store Settings</h3>
            <p className="text-gray-450 text-xs mt-1">Update license keys & address coordinates.</p>
          </Link>
        </div>
      </div>
    </div>
  );

  // ==========================================
  // RENDER: ADMIN PORTAL
  // ==========================================
  const renderAdminPortal = () => {
    const pendingReqs = adminRequests.filter((r) => r.status === "pending");
    return (
      <div className="w-full text-left space-y-10">
        {/* Banner */}
        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Operations</h1>
            <p className="text-gray-450 text-sm mt-1">Review store registrations and address allocations.</p>
          </div>
          <Link href="/requests">
            <button className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-md transition transform hover:-translate-y-0.5">
              Registration Queue ({pendingReqs.length})
            </button>
          </Link>
        </div>

        {/* Dynamic approval queue embedded on dashboard */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col">
          <h2 className="text-xl font-bold text-white tracking-tight mb-6">Pending Pharmacy Approvals</h2>
          
          {loadingPortalData ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : pendingReqs.length === 0 ? (
            <div className="text-center py-16 text-gray-500 text-sm">
              All registration requests reviewed. Current queue is empty.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingReqs.map((req) => (
                <div key={req._id} className="bg-white/5 border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-white/10 transition">
                  <div className="space-y-2">
                    <h3 className="font-bold text-white text-base">{req.name}</h3>
                    <div className="text-xs text-gray-450 space-y-1 font-medium">
                      <p><span className="text-gray-400">License Number:</span> {req.licenseNumber}</p>
                      <p><span className="text-gray-400">Contact No:</span> {req.contact}</p>
                      <p><span className="text-gray-400">Address:</span> {`${req.address?.street}, ${req.address?.city}, ${req.address?.state}`}</p>
                    </div>
                  </div>

                  <div className="flex gap-2.5 mt-6 border-t border-white/5 pt-4">
                    <button
                      onClick={() => handleAdminVerifyRequest(req._id, "verified")}
                      className="flex-1 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold rounded-xl text-xs transition transform active:scale-95"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAdminVerifyRequest(req._id, "rejected")}
                      className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl text-xs transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-h-[80vh]">
      {role === "temp" && renderGuestPortal()}
      {role === "customer" && renderCustomerPortal()}
      {role === "store-owner" && renderStoreOwnerPortal()}
      {role === "admin" && renderAdminPortal()}

      {showDialog && (
        <AddRequestDialog
          onClose={() => setShowDialog(false)}
          onRequestAdded={(request) => {
            console.log("Request added:", request);
            setShowDialog(false);
            showToast("Store registration request submitted successfully! Pending admin verification.", "success");
          }}
        />
      )}
    </div>
  );
}
