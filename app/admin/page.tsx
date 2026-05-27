"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import { useToast } from "@/context/ToastContext";
import CustomDialog from "@/components/CustomDialog";
// @ts-ignore
const L = typeof window !== "undefined" ? require("leaflet") : null;
import {
  FiBarChart2,
  FiUsers,
  FiDatabase,
  FiRadio,
  FiShield,
  FiTrash2,
  FiEdit3,
  FiCheck,
  FiX,
  FiSearch,
  FiToggleLeft,
  FiToggleRight,
  FiPlus,
  FiAlertTriangle,
  FiInfo,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiUser,
  FiMail,
  FiHash,
} from "react-icons/fi";

// Dynamically import Leaflet components
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

import "leaflet/dist/leaflet.css";

// ─── Custom DivIcon markers for request status ────────────────────────────────
const makePinIcon = (color: string, glow: string, pulse?: boolean) =>
  typeof window !== "undefined"
    ? L.divIcon({
        className: "",
        html: `
          <div style="position:relative;width:32px;height:44px;display:flex;flex-direction:column;align-items:center;">
            ${
              pulse
                ? `<span style="position:absolute;top:0;left:50%;transform:translateX(-50%);width:32px;height:32px;border-radius:50%;background:${color};opacity:0.3;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></span>`
                : ""
            }
            <div style="
              width:28px;height:28px;border-radius:50%;
              background:${color};
              border:2.5px solid rgba(255,255,255,0.8);
              box-shadow:0 0 12px ${glow},0 2px 8px rgba(0,0,0,0.5);
              display:flex;align-items:center;justify-content:center;
              position:relative;z-index:1;
            ">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div style="width:2px;height:12px;background:${color};opacity:0.7;margin-top:1px;"></div>
          </div>
        `,
        iconSize: [32, 44],
        iconAnchor: [16, 44],
        popupAnchor: [0, -46],
      })
    : null;

const pendingMarkerIcon = makePinIcon("#f59e0b", "rgba(245,158,11,0.7)", true);
const completedMarkerIcon = makePinIcon("#10b981", "rgba(16,185,129,0.7)", false);
const cancelledMarkerIcon = makePinIcon("#ef4444", "rgba(239,68,68,0.7)", false);

const host = `${process.env.NEXT_PUBLIC_BACKEND}`;

type TabKey = "analytics" | "users" | "medicines" | "orders" | "broadcasts" | "audit";

interface TabDef {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
}

const tabs: TabDef[] = [
  { key: "analytics", label: "Analytics", icon: <FiBarChart2 size={16} /> },
  { key: "users", label: "Users", icon: <FiUsers size={16} /> },
  { key: "medicines", label: "Medicines", icon: <FiDatabase size={16} /> },
  { key: "orders", label: "Platform Orders", icon: <FiClock size={16} /> },
  { key: "broadcasts", label: "Broadcasts", icon: <FiRadio size={16} /> },
  { key: "audit", label: "Audit Log", icon: <FiShield size={16} /> },
];

// ─── HELPER: Stat Card ───────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left hover:border-white/20 transition duration-300 relative overflow-hidden group">
      <div
        className={`absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition ${accent}`}
      />
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
        {label}
      </p>
      <h3 className="text-2xl font-extrabold text-white tracking-tight">
        {value}
      </h3>
    </div>
  );
}

// ─── MAIN ADMIN PAGE ─────────────────────────────────────────────────────────
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("analytics");
  const { showToast } = useToast();

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TAB 1: ANALYTICS
  // ═══════════════════════════════════════════════════════════════════════════
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const res = await axios.get(`${host}/admin/analytics`, {
        headers: getAuthHeaders(),
      });
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
      showToast("Failed to load analytics", "error");
    } finally {
      setAnalyticsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // TAB 2: USERS
  // ═══════════════════════════════════════════════════════════════════════════
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editRole, setEditRole] = useState("");

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await axios.get(`${host}/admin/users`, {
        headers: getAuthHeaders(),
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      showToast("Failed to load users", "error");
    } finally {
      setUsersLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRoleUpdate = async () => {
    if (!editingUser) return;
    try {
      await axios.put(
        `${host}/admin/users/${editingUser._id}/role`,
        { role: editRole },
        { headers: getAuthHeaders() }
      );
      showToast(`Updated ${editingUser.name}'s role to ${editRole}`, "success");
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      showToast("Failed to update role", "error");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSuspendToggle = async (user: any) => {
    try {
      await axios.put(
        `${host}/admin/users/${user._id}/role`,
        { isSuspended: !user.isSuspended },
        { headers: getAuthHeaders() }
      );
      showToast(
        `${user.name} has been ${user.isSuspended ? "unsuspended" : "suspended"}`,
        "success"
      );
      fetchUsers();
    } catch (err) {
      console.error(err);
      showToast("Failed to toggle suspension", "error");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUserDelete = async (user: any) => {
    if (!confirm(`Are you sure you want to permanently delete user "${user.name}" (${user.email}) and all their associated store/inventory assets? This action is irreversible.`)) return;
    try {
      await axios.delete(
        `${host}/admin/users/${user._id}`,
        { headers: getAuthHeaders() }
      );
      showToast(`User ${user.name} has been deleted successfully.`, "success");
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to delete user account", "error");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone?.toString().includes(userSearch);
    const matchesRole =
      userRoleFilter === "all" ? true : u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TAB 3: MEDICINES
  // ═══════════════════════════════════════════════════════════════════════════
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [medicines, setMedicines] = useState<any[]>([]);
  const [medsLoading, setMedsLoading] = useState(false);
  const [medSearch, setMedSearch] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingMed, setEditingMed] = useState<any>(null);
  const [editMedForm, setEditMedForm] = useState({
    name: "",
    composition: "",
    manufacturer: "",
    usage: "",
    precautions: "",
  });

  const fetchMedicines = useCallback(async () => {
    setMedsLoading(true);
    try {
      const res = await axios.get(`${host}/admin/medicines`, {
        headers: getAuthHeaders(),
      });
      setMedicines(res.data);
    } catch (err) {
      console.error(err);
      showToast("Failed to load medicines", "error");
    } finally {
      setMedsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openEditMed = (med: any) => {
    setEditingMed(med);
    setEditMedForm({
      name: med.name || "",
      composition: med.composition || "",
      manufacturer: med.manufacturer || "",
      usage: med.usage || "",
      precautions: med.precautions || "",
    });
  };

  const handleMedUpdate = async () => {
    if (!editingMed) return;
    try {
      await axios.put(`${host}/admin/medicines/${editingMed._id}`, editMedForm, {
        headers: getAuthHeaders(),
      });
      showToast(`Updated ${editMedForm.name}`, "success");
      setEditingMed(null);
      fetchMedicines();
    } catch (err) {
      console.error(err);
      showToast("Failed to update medicine", "error");
    }
  };

  const handleMedDelete = async (id: string, name: string) => {
    if (!confirm(`Delete medicine "${name}" from the master database?`)) return;
    try {
      await axios.delete(`${host}/admin/medicines/${id}`, {
        headers: getAuthHeaders(),
      });
      showToast(`Deleted ${name}`, "success");
      fetchMedicines();
    } catch (err) {
      console.error(err);
      showToast("Failed to delete medicine", "error");
    }
  };

  const filteredMeds = medicines.filter(
    (m) =>
      m.name?.toLowerCase().includes(medSearch.toLowerCase()) ||
      m.composition?.toLowerCase().includes(medSearch.toLowerCase()) ||
      m.manufacturer?.toLowerCase().includes(medSearch.toLowerCase())
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // TAB 4: BROADCASTS / ANNOUNCEMENTS
  // ═══════════════════════════════════════════════════════════════════════════
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    message: "",
    type: "info",
    targetRole: "all",
  });

  const fetchAnnouncements = useCallback(async () => {
    setAnnouncementsLoading(true);
    try {
      const res = await axios.get(`${host}/admin/announcements`, {
        headers: getAuthHeaders(),
      });
      setAnnouncements(res.data);
    } catch (err) {
      console.error(err);
      showToast("Failed to load announcements", "error");
    } finally {
      setAnnouncementsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.message.trim()) {
      showToast("Title and message are required", "error");
      return;
    }
    try {
      await axios.post(`${host}/admin/announcements`, newAnnouncement, {
        headers: getAuthHeaders(),
      });
      showToast("Announcement published!", "success");
      setNewAnnouncement({ title: "", message: "", type: "info", targetRole: "all" });
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      showToast("Failed to create announcement", "error");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleToggleAnnouncement = async (a: any) => {
    try {
      await axios.put(
        `${host}/admin/announcements/${a._id}/toggle`,
        { isActive: !a.isActive },
        { headers: getAuthHeaders() }
      );
      showToast(
        `Announcement ${a.isActive ? "deactivated" : "activated"}`,
        "success"
      );
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      showToast("Failed to toggle announcement", "error");
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Delete this announcement permanently?")) return;
    try {
      await axios.delete(`${host}/admin/announcements/${id}`, {
        headers: getAuthHeaders(),
      });
      showToast("Announcement deleted", "success");
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      showToast("Failed to delete announcement", "error");
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // PLATFORM ORDERS TAB STATE
  // ═══════════════════════════════════════════════════════════════════════════
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [platformOrders, setPlatformOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderTypeFilter, setOrderTypeFilter] = useState("all");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);

  const fetchPlatformOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await axios.get(`${host}/order/dev`, {
        headers: getAuthHeaders(),
      });
      setPlatformOrders(res.data);
    } catch (err) {
      console.error(err);
      showToast("Failed to load platform orders", "error");
    } finally {
      setOrdersLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // TAB 5: AUDIT LOGS
  // ═══════════════════════════════════════════════════════════════════════════
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  const fetchAuditLogs = useCallback(async () => {
    setAuditLoading(true);
    try {
      const res = await axios.get(`${host}/admin/audit-logs`, {
        headers: getAuthHeaders(),
      });
      setAuditLogs(res.data);
    } catch (err) {
      console.error(err);
      showToast("Failed to load audit logs", "error");
    } finally {
      setAuditLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // FETCH DATA ON TAB CHANGE
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    switch (activeTab) {
      case "analytics":
        fetchAnalytics();
        break;
      case "users":
        fetchUsers();
        break;
      case "medicines":
        fetchMedicines();
        break;
      case "orders":
        fetchPlatformOrders();
        break;
      case "broadcasts":
        fetchAnnouncements();
        break;
      case "audit":
        fetchAuditLogs();
        break;
    }
  }, [
    activeTab,
    fetchAnalytics,
    fetchUsers,
    fetchMedicines,
    fetchPlatformOrders,
    fetchAnnouncements,
    fetchAuditLogs,
  ]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="text-left mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Admin Hub
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Centralized control panel for platform operations, user management, and
          system analytics.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto md:flex-wrap gap-2 mb-8 pb-2 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition duration-200 cursor-pointer shrink-0 ${
              activeTab === tab.key
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20"
                : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ─── TAB 1: ANALYTICS ──────────────────────────────────────────────── */}
      {activeTab === "analytics" && (
        <div className="space-y-8 text-left">
          {analyticsLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
            </div>
          ) : analytics ? (
            <>
              {/* User KPIs */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-4 flex items-center gap-2">
                  <FiUsers size={14} /> User Distribution
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <StatCard label="Total Users" value={analytics.users.totalUsers} accent="bg-blue-500" />
                  <StatCard label="Admins" value={analytics.users.admins} accent="bg-purple-500" />
                  <StatCard label="Store Owners" value={analytics.users.storeOwners} accent="bg-cyan-500" />
                  <StatCard label="Customers" value={analytics.users.customers} accent="bg-emerald-500" />
                  <StatCard label="Suspended" value={analytics.users.suspendedUsers} accent="bg-rose-500" />
                </div>
              </div>

              {/* Order Metrics */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4 flex items-center gap-2">
                  <FiBarChart2 size={14} /> Order Metrics
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <StatCard label="Total Orders" value={analytics.orders.totalOrders} accent="bg-blue-500" />
                  <StatCard label="Pending" value={analytics.orders.pendingOrders} accent="bg-amber-500" />
                  <StatCard label="Processed" value={analytics.orders.processedOrders} accent="bg-cyan-500" />
                  <StatCard label="Completed" value={analytics.orders.completedOrders} accent="bg-emerald-500" />
                  <StatCard label="Cancelled" value={analytics.orders.cancelledOrders} accent="bg-rose-500" />
                </div>
              </div>

              {/* Request Metrics + Store Count */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-4 flex items-center gap-2">
                  <FiDatabase size={14} /> Store Registrations
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard label="Active Stores" value={analytics.stores.totalStores} accent="bg-cyan-500" />
                  <StatCard label="Total Requests" value={analytics.requests.totalRequests} accent="bg-blue-500" />
                  <StatCard label="Pending" value={analytics.requests.pendingRequests} accent="bg-amber-500" />
                  <StatCard label="Verified" value={analytics.requests.completedRequests} accent="bg-emerald-500" />
                </div>
              </div>

              {/* Request Coordinates Map */}
              {analytics.requestPoints?.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-4 flex items-center gap-2">
                    Store Registration Density Map
                  </h2>
                  {/* Map Legend */}
                  <div className="flex flex-wrap gap-4 mb-3">
                    {[
                      { color: "#f59e0b", label: "Pending Review", pulse: true },
                      { color: "#10b981", label: "Verified / Active", pulse: false },
                      { color: "#ef4444", label: "Cancelled / Rejected", pulse: false },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2 text-[11px] text-gray-300">
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-md flex-shrink-0"
                          style={{
                            background: item.color,
                            boxShadow: `0 0 6px ${item.color}`,
                          }}
                        />
                        {item.label}
                      </div>
                    ))}
                  </div>
                  <div className="w-full h-[300px] md:h-[420px] rounded-2xl overflow-hidden border border-white/10 shadow-xl relative z-10">
                    <MapContainer
                      center={[
                        analytics.requestPoints[0]?.address?.latitude || 26.9,
                        analytics.requestPoints[0]?.address?.longitude || 75.7,
                      ]}
                      zoom={5}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {analytics.requestPoints.map((rp: any, idx: number) => {
                        const lat = rp.address?.latitude;
                        const lng = rp.address?.longitude;
                        if (!lat || !lng) return null;
                        const icon =
                          rp.status === "completed"
                            ? completedMarkerIcon
                            : rp.status === "pending"
                            ? pendingMarkerIcon
                            : cancelledMarkerIcon;
                        return (
                          <Marker
                            key={idx}
                            position={[lat, lng]}
                            icon={icon || undefined}
                          >
                            <Popup>
                              <div className="text-xs text-gray-900 font-sans p-1">
                                <strong className="text-sm block mb-1">{rp.name}</strong>
                                <span
                                  className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                                  style={{
                                    background:
                                      rp.status === "completed"
                                        ? "#d1fae5"
                                        : rp.status === "pending"
                                        ? "#fef3c7"
                                        : "#fee2e2",
                                    color:
                                      rp.status === "completed"
                                        ? "#065f46"
                                        : rp.status === "pending"
                                        ? "#92400e"
                                        : "#991b1b",
                                  }}
                                >
                                  {rp.status?.toUpperCase()}
                                </span>
                                <p className="text-[10px] text-gray-500 mt-1.5 font-mono">
                                  {lat.toFixed(4)}, {lng.toFixed(4)}
                                </p>
                              </div>
                            </Popup>
                          </Marker>
                        );
                      })}
                    </MapContainer>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-sm">No analytics data available.</p>
          )}
        </div>
      )}

      {/* ─── TAB 2: USERS ──────────────────────────────────────────────────── */}
      {activeTab === "users" && (
        <div className="space-y-6 text-left">
          {/* Search & Filter */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Search Users
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition text-xs"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Filter by Role
              </label>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50 transition text-xs"
              >
                <option className="text-black" value="all">All Roles</option>
                <option className="text-black" value="admin">Admin</option>
                <option className="text-black" value="store-owner">Store Owner</option>
                <option className="text-black" value="customer">Customer</option>
              </select>
            </div>
          </div>

          {/* Users Grid */}
          {usersLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16 bg-white/5 border border-white/5 rounded-2xl">
              <p className="text-gray-400">No users match the search criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredUsers.map((user) => {
                const roleBadge: Record<string, string> = {
                  admin: "bg-purple-500/10 border-purple-500/30 text-purple-400",
                  "store-owner": "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
                  customer: "bg-blue-500/10 border-blue-500/30 text-blue-400",
                };
                return (
                  <div
                    key={user._id}
                    className={`bg-white/5 border rounded-2xl p-5 hover:border-white/20 transition duration-300 ${
                      user.isSuspended
                        ? "border-rose-500/20 opacity-60"
                        : "border-white/10"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white truncate max-w-[150px]">
                            {user.name}
                          </h3>
                          <p className="text-[10px] text-gray-400 flex items-center gap-1">
                            <FiMail size={10} /> {user.email}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          roleBadge[user.role] || "bg-gray-500/10 border-gray-500/30 text-gray-400"
                        }`}
                      >
                        {user.role?.toUpperCase()}
                      </span>
                    </div>

                    <div className="bg-white/5 rounded-xl p-3 space-y-1.5 text-xs text-gray-300 mb-3 border border-white/5">
                      <p className="flex items-center gap-2">
                        <FiUser size={11} className="text-gray-500" />
                        Gender: <strong className="text-white">{user.gender || "N/A"}</strong>
                      </p>
                      <p className="flex items-center gap-2">
                        <FiHash size={11} className="text-gray-500" />
                        Phone: <strong className="text-white">{user.phone || "N/A"}</strong>
                      </p>
                      {user.isSuspended && (
                        <p className="text-rose-400 font-bold flex items-center gap-1">
                          <FiAlertTriangle size={11} /> Account Suspended
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setEditRole(user.role);
                        }}
                        className="flex-grow py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <FiEdit3 size={12} /> Edit Role
                      </button>
                      <button
                        onClick={() => handleSuspendToggle(user)}
                        className={`px-3 py-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center cursor-pointer ${
                          user.isSuspended
                            ? "bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400"
                            : "bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400"
                        }`}
                        title={user.isSuspended ? "Unsuspend" : "Suspend"}
                      >
                        {user.isSuspended ? (
                          <FiToggleRight size={14} />
                        ) : (
                          <FiToggleLeft size={14} />
                        )}
                      </button>
                      {user.role !== "customer" && user.role !== "store-owner" && (
                        <button
                          onClick={() => handleUserDelete(user)}
                          className="px-3 py-2 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-600/20 text-rose-400 rounded-xl text-[11px] font-bold transition flex items-center justify-center cursor-pointer"
                          title="Delete Account"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Edit Role Dialog */}
          {editingUser && (
            <CustomDialog
              open={!!editingUser}
              onClose={() => setEditingUser(null)}
              title="Update User Role"
            >
              <div className="space-y-5 text-left">
                <div>
                  <p className="text-xs text-gray-400 mb-1">User</p>
                  <h3 className="text-lg font-bold text-white">{editingUser.name}</h3>
                  <p className="text-xs text-gray-500">{editingUser.email}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Assign New Role
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50 transition text-sm"
                  >
                    <option className="text-black" value="customer">Customer</option>
                    <option className="text-black" value="store-owner">Store Owner</option>
                    <option className="text-black" value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setEditingUser(null)}
                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRoleUpdate}
                    className="flex-grow flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg transition"
                  >
                    <FiCheck size={14} /> Save Role
                  </button>
                </div>
              </div>
            </CustomDialog>
          )}
        </div>
      )}

      {/* ─── TAB 3: MEDICINES ──────────────────────────────────────────────── */}
      {activeTab === "medicines" && (
        <div className="space-y-6 text-left">
          {/* Search */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Search Medicine Database
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
              <input
                type="text"
                placeholder="Search by name, composition, or manufacturer..."
                value={medSearch}
                onChange={(e) => setMedSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition text-xs"
              />
            </div>
          </div>

          {medsLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
            </div>
          ) : filteredMeds.length === 0 ? (
            <div className="text-center py-16 bg-white/5 border border-white/5 rounded-2xl">
              <p className="text-gray-400">No medicines match the search criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-gray-400 border-b border-white/10">
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Composition</th>
                    <th className="py-3 px-4">Manufacturer</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMeds.map((med) => (
                    <tr
                      key={med._id}
                      className="border-b border-white/5 hover:bg-white/5 transition"
                    >
                      <td className="py-3 px-4 font-bold text-white">{med.name}</td>
                      <td className="py-3 px-4 text-gray-300 truncate max-w-[200px]">
                        {med.composition}
                      </td>
                      <td className="py-3 px-4 text-gray-400">{med.manufacturer}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => openEditMed(med)}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg text-[10px] font-bold transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <FiEdit3 size={11} /> Edit
                        </button>
                        <button
                          onClick={() => handleMedDelete(med._id, med.name)}
                          className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-lg text-[10px] font-bold transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <FiTrash2 size={11} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Edit Medicine Dialog */}
          {editingMed && (
            <CustomDialog
              open={!!editingMed}
              onClose={() => setEditingMed(null)}
              title="Edit Medicine Record"
            >
              <div className="space-y-4 text-left">
                {[
                  { key: "name", label: "Medicine Name", placeholder: "e.g. Amoxicillin" },
                  { key: "composition", label: "Composition", placeholder: "e.g. Amoxicillin Trihydrate" },
                  { key: "manufacturer", label: "Manufacturer", placeholder: "e.g. GSK Labs" },
                  { key: "usage", label: "Usage / Indications", placeholder: "Used for infections..." },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={editMedForm[field.key as keyof typeof editMedForm]}
                      onChange={(e) =>
                        setEditMedForm({ ...editMedForm, [field.key]: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition text-xs"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Precautions
                  </label>
                  <textarea
                    placeholder="Safety warnings..."
                    value={editMedForm.precautions}
                    onChange={(e) =>
                      setEditMedForm({ ...editMedForm, precautions: e.target.value })
                    }
                    className="w-full h-20 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition text-xs resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setEditingMed(null)}
                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleMedUpdate}
                    className="flex-grow flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg transition"
                  >
                    <FiCheck size={14} /> Save Changes
                  </button>
                </div>
              </div>
            </CustomDialog>
          )}
        </div>
      )}

      {/* ─── TAB 4: BROADCASTS ─────────────────────────────────────────────── */}
      {activeTab === "broadcasts" && (
        <div className="space-y-8 text-left">
          {/* Create new announcement */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-40 h-40 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
            <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FiPlus size={14} /> Publish New Broadcast
            </h2>
            <div className="space-y-4 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Title <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Emergency Pharmacy Hours Update"
                    value={newAnnouncement.title}
                    onChange={(e) =>
                      setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Alert Type
                  </label>
                  <select
                    value={newAnnouncement.type}
                    onChange={(e) =>
                      setNewAnnouncement({ ...newAnnouncement, type: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50 transition text-xs"
                  >
                    <option className="text-black" value="info">ℹ️ Info</option>
                    <option className="text-black" value="success">✅ Success</option>
                    <option className="text-black" value="warning">⚠️ Warning</option>
                    <option className="text-black" value="danger">🚨 Danger</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Target Audience
                  </label>
                  <select
                    value={newAnnouncement.targetRole}
                    onChange={(e) =>
                      setNewAnnouncement({ ...newAnnouncement, targetRole: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50 transition text-xs"
                  >
                    <option className="text-black" value="all">👥 All Users</option>
                    <option className="text-black" value="customer">👤 Customers</option>
                    <option className="text-black" value="store-owner">🏪 Store Owners</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Message <span className="text-cyan-400">*</span>
                </label>
                <textarea
                  placeholder="Type your system-wide message here..."
                  value={newAnnouncement.message}
                  onChange={(e) =>
                    setNewAnnouncement({ ...newAnnouncement, message: e.target.value })
                  }
                  className="w-full h-24 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition text-xs resize-none"
                />
              </div>
              <button
                onClick={handleCreateAnnouncement}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg transition transform active:scale-95 cursor-pointer"
              >
                Publish Broadcast
              </button>
            </div>
          </div>

          {/* Announcements List */}
          <div>
            <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-4">
              Active & Archived Broadcasts
            </h2>
            {announcementsLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
              </div>
            ) : announcements.length === 0 ? (
              <div className="text-center py-16 bg-white/5 border border-white/5 rounded-2xl">
                <p className="text-gray-400">No broadcasts published yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((a) => {
                  const typeIcons: Record<string, React.ReactNode> = {
                    info: <FiInfo className="text-blue-400" size={16} />,
                    warning: <FiAlertTriangle className="text-amber-400" size={16} />,
                    success: <FiCheckCircle className="text-emerald-400" size={16} />,
                    danger: <FiAlertCircle className="text-rose-400" size={16} />,
                  };
                  return (
                    <div
                      key={a._id}
                      className={`bg-white/5 border rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${
                        a.isActive ? "border-white/10" : "border-white/5 opacity-50"
                      }`}
                    >
                      <div className="flex gap-3 items-start">
                        <div className="mt-0.5">{typeIcons[a.type] || typeIcons.info}</div>
                        <div>
                          <h3 className="text-sm font-bold text-white">{a.title}</h3>
                          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                            {a.message}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-1.5 flex items-center flex-wrap gap-1.5">
                            <FiClock size={10} />
                            {new Date(a.createdAt).toLocaleString()} • By{" "}
                            {a.createdBy?.name || "System"} •{" "}
                            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-extrabold uppercase text-cyan-400">
                              Audience: {a.targetRole || "all"}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleToggleAnnouncement(a)}
                          className={`px-3.5 py-2 rounded-xl text-[10px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            a.isActive
                              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                              : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"
                          }`}
                        >
                          {a.isActive ? (
                            <>
                              <FiToggleRight size={14} /> Live
                            </>
                          ) : (
                            <>
                              <FiToggleLeft size={14} /> Off
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteAnnouncement(a._id)}
                          className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-xl text-[10px] font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 6: PLATFORM ORDERS ────────────────────────────────────────── */}
      {activeTab === "orders" && (
        <div className="space-y-6 text-left">
          {/* Search & Filter */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Search Orders
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                <input
                  type="text"
                  placeholder="Search by Order ID, Store Name, Supplier, or Customer..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition text-xs"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Order Type
              </label>
              <select
                value={orderTypeFilter}
                onChange={(e) => setOrderTypeFilter(e.target.value)}
                className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50 transition text-xs"
              >
                <option className="text-black" value="all">All Types</option>
                <option className="text-black" value="b2b">Wholesale (B2B)</option>
                <option className="text-black" value="b2c">Patient (B2C)</option>
              </select>
            </div>
          </div>

          {/* Orders Grid */}
          {ordersLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
            </div>
          ) : platformOrders.length === 0 ? (
            <div className="text-center py-16 bg-white/5 border border-white/5 rounded-2xl">
              <p className="text-gray-400">No platform orders found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {platformOrders
                .filter((o) => {
                  const query = orderSearch.toLowerCase();
                  const matchesSearch =
                    o._id?.toLowerCase().includes(query) ||
                    o.store?.name?.toLowerCase().includes(query) ||
                    o.seller?.toLowerCase().includes(query) ||
                    o.customer?.name?.toLowerCase().includes(query) ||
                    o.customer?.email?.toLowerCase().includes(query);
                  const matchesType =
                    orderTypeFilter === "all" ? true : o.orderType === orderTypeFilter;
                  return matchesSearch && matchesType;
                })
                .map((order) => {
                  const statusColors: Record<string, string> = {
                    pending: "bg-amber-500/10 border-amber-500/30 text-amber-400",
                    processed: "bg-blue-500/10 border-blue-500/30 text-blue-400",
                    completed: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
                    cancelled: "bg-rose-500/10 border-rose-500/30 text-rose-400",
                  };
                  return (
                    <div
                      key={order._id}
                      className="bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-5 transition duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="text-[10px] text-gray-500 font-mono">ID: {order._id}</span>
                            <h4 className="text-xs text-gray-400 font-semibold mt-0.5">
                              {new Date(order.orderDate || order.createdAt).toLocaleDateString()}
                            </h4>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                              statusColors[order.status] || "bg-gray-500/10 border-gray-500/30 text-gray-400"
                            }`}
                          >
                            {order.status?.toUpperCase()}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs text-gray-300 bg-white/5 p-3 rounded-xl border border-white/5 mb-3">
                          <p>
                            <span className="text-gray-400">Store:</span>{" "}
                            <strong className="text-white">{order.store?.name || "Unknown Store"}</strong>
                          </p>
                          {order.orderType === "b2c" ? (
                            <p>
                              <span className="text-blue-400">Patient:</span>{" "}
                              <strong className="text-white">{order.customer?.name || "Guest"}</strong>
                            </p>
                          ) : (
                            <p>
                              <span className="text-indigo-400">Supplier:</span>{" "}
                              <strong className="text-white">{order.seller || "Supplier"}</strong>
                            </p>
                          )}
                          <p>
                            <span className="text-gray-400">Items Count:</span>{" "}
                            <strong className="text-white">{order.totalItems} lines</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderDialog(true);
                          }}
                          className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <FiInfo size={12} /> View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Platform Order Details Dialog */}
      {selectedOrder && (
        <CustomDialog
          open={showOrderDialog}
          onClose={() => setShowOrderDialog(false)}
          title={selectedOrder.orderType === "b2b" ? "Platform B2B Wholesale Invoice" : "Platform B2C Patient Order"}
        >
          <div className="space-y-5 text-left text-xs">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Order Identifier</p>
              <p className="text-sm font-mono text-white select-all">{selectedOrder._id}</p>
              <p className="text-[10px] text-gray-400 mt-1">
                Placed on {new Date(selectedOrder.orderDate || selectedOrder.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 space-y-1.5">
              <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-1">Store Details</p>
              <p className="text-white"><span className="text-gray-400">Name:</span> {selectedOrder.store?.name || "Unknown Store"}</p>
              <p className="text-white"><span className="text-gray-400">Contact:</span> {selectedOrder.store?.contact || "N/A"}</p>
            </div>

            {selectedOrder.orderType === "b2c" && selectedOrder.customer ? (
              <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 space-y-1.5">
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-1">Patient Details</p>
                <p className="text-white"><span className="text-gray-400">Name:</span> {selectedOrder.customer.name}</p>
                <p className="text-white"><span className="text-gray-400">Email:</span> {selectedOrder.customer.email}</p>
              </div>
            ) : (
              <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 space-y-1.5">
                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-1">Wholesale Supplier</p>
                <p className="text-white font-bold">{selectedOrder.seller || "Supplier"}</p>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-white/10 pb-1">
                Items Invoiced ({selectedOrder.totalItems})
              </p>
              {selectedOrder.medicines?.map((item: any, idx: number) => (
                <div key={idx} className="bg-white/5 p-2.5 rounded-xl border border-white/5 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-semibold text-white">{item.medicine_id?.name || "Unknown Medicine"}</p>
                    <p className="text-[9px] text-gray-400 font-mono">Expiry: {item.expiry ? new Date(item.expiry).toLocaleDateString() : "N/A"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white">{item.quantity} units</p>
                    <p className="text-[10px] text-cyan-400 font-mono font-bold">₹{item.price?.toFixed(2) || "0.00"}</p>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Remarks</p>
              <p className="text-xs text-gray-300 bg-white/5 border border-white/5 p-2.5 rounded-xl italic">
                {selectedOrder.remarks || "No remarks provided."}
              </p>
            </div>

            <div className="flex justify-between items-center border-t border-white/10 pt-3">
              <div>
                <p className="text-[10px] text-gray-400 uppercase">Status</p>
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/5 border text-white">
                  {selectedOrder.status?.toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => setShowOrderDialog(false)}
                className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </CustomDialog>
      )}

      {/* ─── TAB 5: AUDIT LOG ──────────────────────────────────────────────── */}
      {activeTab === "audit" && (
        <div className="space-y-6 text-left">
          <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
            <FiShield size={14} /> System Activity Ledger
          </h2>
          {auditLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center py-16 bg-white/5 border border-white/5 rounded-2xl">
              <p className="text-gray-400">
                No system events recorded yet. Actions like role changes and
                announcement updates will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-gray-400 border-b border-white/10">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Details</th>
                    <th className="py-3 px-4">Performed By</th>
                    <th className="py-3 px-4">IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => {
                    const actionBadge: Record<string, string> = {
                      USER_ROLE_UPDATE: "bg-purple-500/10 text-purple-400 border-purple-500/20",
                      ANNOUNCEMENT_CREATE: "bg-blue-500/10 text-blue-400 border-blue-500/20",
                      ANNOUNCEMENT_TOGGLE: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                      ANNOUNCEMENT_DELETE: "bg-rose-500/10 text-rose-400 border-rose-500/20",
                      MEDICINE_UPDATE: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
                      MEDICINE_DELETE: "bg-rose-500/10 text-rose-400 border-rose-500/20",
                    };
                    return (
                      <tr
                        key={log._id}
                        className="border-b border-white/5 hover:bg-white/5 transition"
                      >
                        <td className="py-3 px-4 text-gray-400 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
                              actionBadge[log.action] || "bg-gray-500/10 text-gray-400 border-gray-500/20"
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-300 max-w-[300px] truncate">
                          {log.details}
                        </td>
                        <td className="py-3 px-4 text-white font-semibold">
                          {log.performedBy?.name || "System"}
                          {log.performedBy?.email && (
                            <span className="text-gray-500 text-[10px] block">
                              {log.performedBy.email}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-500 font-mono text-[10px]">
                          {log.ipAddress || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
