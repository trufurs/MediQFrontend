"use client";

import { useEffect, useState } from "react";
import React from "react";
import { fetchRequests, updateRequestStatus, deleteRequest } from "@/utils/request";
import CustomDialog from "@/components/CustomDialog";
import dynamic from "next/dynamic";
import { useToast } from "@/context/ToastContext";
import { FiTrash2, FiMapPin } from "react-icons/fi";
// @ts-ignore
const L = typeof window !== "undefined" ? require("leaflet") : null;
import "leaflet/dist/leaflet.css";

const AddRequestDialog = dynamic(() => import("@/components/AddRequestDialog"), {
  ssr: false,
});

// Dynamically import map components
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

// Store pin marker icon
const storePinIcon =
  typeof window !== "undefined"
    ? L.divIcon({
        className: "",
        html: `
          <div style="position:relative;width:32px;height:44px;display:flex;flex-direction:column;align-items:center;">
            <div style="
              width:28px;height:28px;border-radius:50%;
              background:linear-gradient(135deg,#06b6d4,#3b82f6);
              border:2.5px solid rgba(255,255,255,0.9);
              box-shadow:0 0 14px rgba(6,182,212,0.8),0 2px 8px rgba(0,0,0,0.5);
              display:flex;align-items:center;justify-content:center;
              position:relative;z-index:1;
            ">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div style="width:2px;height:12px;background:#06b6d4;opacity:0.8;margin-top:1px;"></div>
          </div>
        `,
        iconSize: [32, 44],
        iconAnchor: [16, 44],
        popupAnchor: [0, -46],
      })
    : null;

interface Address {
  latitude: number;
  longitude: number;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface Request {
  _id: string;
  owner: string;
  name: string;
  licenseNumber: string;
  contact: string;
  address: Address;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const normalizeStatusForFilter = (status: string) => {
  if (status === "verified") return "completed";
  if (status === "rejected") return "cancelled";
  return status;
};

function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { showToast } = useToast();

  const fetchRequestsHandler = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("auth_token");
      const data = await fetchRequests(token!);
      setRequests(data);
      showToast("Requests fetched successfully!", "success");
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError("Failed to fetch requests. Please try again later.");
      showToast("Failed to fetch requests. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestsHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdminAction = async (requestId: string, status: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      await updateRequestStatus(token!, requestId, status);
      setRequests((prevRequests) =>
        prevRequests.map((req) =>
          req._id === requestId ? { ...req, status: status === "verified" ? "completed" : "cancelled" } : req
        )
      );
      showToast(
        `Request has been ${status === "verified" ? "verified" : "rejected"} successfully!`,
        "success"
      );
    } catch (err) {
      console.error("Error updating request status:", err);
      showToast("Failed to update request status. Please try again.", "error");
    }
  };

  const handleViewDetails = (request: Request) => {
    setSelectedRequest(request);
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm("Are you sure you want to delete this store registration request?")) {
      return;
    }
    try {
      const token = localStorage.getItem("auth_token");
      await deleteRequest(token!, requestId);
      setRequests((prev) => prev.filter((req) => req._id !== requestId));
      showToast("Store registration request deleted successfully!", "success");
    } catch (err) {
      console.error("Error deleting request:", err);
      showToast("Failed to delete request. Please try again.", "error");
    }
  };

  // Filter & Search logic
  const filteredRequests = requests.filter((request) => {
    const matchesStatus =
      statusFilter === "all"
        ? true
        : normalizeStatusForFilter(request.status) === statusFilter;
    const matchesSearch =
      request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const renderStatusBadge = (status: string) => {
    const stylesMap: Record<string, string> = {
      pending: "bg-amber-500/10 border-amber-500/30 text-amber-400",
      completed: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
      verified: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
      cancelled: "bg-rose-500/10 border-rose-500/30 text-rose-400",
      rejected: "bg-rose-500/10 border-rose-500/30 text-rose-400",
    };

    const statusText = status === "completed" || status === "verified" ? "VERIFIED" : status.toUpperCase();

    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${stylesMap[status] || "bg-gray-500/10 border-gray-550 text-gray-400"}`}>
        {statusText}
      </span>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 text-left">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Registration Requests</h1>
          <p className="text-gray-400 text-sm mt-1">Review and verify medical facility and drugstore registration requests.</p>
        </div>

        <button
          onClick={() => setShowAddDialog(true)}
          className="self-start md:self-auto px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-md transition duration-200"
        >
          Add New Request
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white/5 border border-white/10 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center gap-4 mb-8 text-left">
        {/* Search */}
        <div className="w-full md:flex-grow">
          <label htmlFor="search-requests" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Search requests
          </label>
          <input
            type="text"
            id="search-requests"
            placeholder="Search by store name or license number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition duration-200 text-sm"
          />
        </div>

        {/* Filter Status */}
        <div className="w-full md:w-48">
          <label htmlFor="filter-status" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Filter Status
          </label>
          <select
            id="filter-status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              showToast(`Filter: ${e.target.value === "all" ? "Showing all" : e.target.value}`, "info");
            }}
            className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition duration-200 text-sm"
          >
            <option className="text-black" value="all">All</option>
            <option className="text-black" value="pending">Pending</option>
            <option className="text-black" value="completed">Completed / Verified</option>
            <option className="text-black" value="cancelled">Cancelled / Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-400 text-sm">Loading requests...</p>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
          <p className="text-rose-400 font-medium">{error}</p>
          <button
            onClick={fetchRequestsHandler}
            className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-lg transition"
          >
            Retry Fetch
          </button>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-20 bg-white/5 border border-white/5 rounded-2xl">
          <p className="text-gray-400">No requests match the filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((request) => (
            <div
              key={request._id}
              className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl p-6 shadow-md transition duration-300 flex flex-col justify-between text-left"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-extrabold text-white text-lg tracking-tight truncate max-w-[70%]">
                    {request.name}
                  </h3>
                  {renderStatusBadge(request.status)}
                </div>

                <div className="space-y-2 text-sm text-gray-300 mb-6 bg-white/5 p-4 rounded-xl border border-white/5">
                  <p className="flex justify-between">
                    <span className="text-gray-400 text-xs uppercase tracking-wider">License:</span>
                    <strong className="text-white font-semibold font-mono">{request.licenseNumber}</strong>
                  </p>
                  <p className="flex justify-between border-t border-white/5 pt-1.5">
                    <span className="text-gray-400 text-xs uppercase tracking-wider">Contact:</span>
                    <strong className="text-blue-400 font-semibold">{request.contact}</strong>
                  </p>
                  <p className="text-[10px] text-gray-500 pt-2 block font-mono">
                    ID: {request._id}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetails(request)}
                    className="flex-grow py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition duration-200 text-center"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleDeleteRequest(request._id)}
                    className="px-3.5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 text-rose-400 rounded-xl text-xs font-bold transition duration-200 flex items-center justify-center cursor-pointer"
                    title="Delete Request"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
                {request.status === "pending" && (
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => handleAdminAction(request._id, "verified")}
                      className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-xl text-xs font-bold transition duration-200 transform hover:-translate-y-0.5"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => handleAdminAction(request._id, "rejected")}
                      className="flex-1 py-2.5 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-bold transition duration-200"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog for details */}
      {selectedRequest && (
        <CustomDialog
          open={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          title="Facility Request Details"
        >
          <div className="space-y-6 text-left">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Facility Name</p>
              <h3 className="text-lg font-bold text-white">{selectedRequest.name}</h3>
            </div>

            <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2.5">
              <p className="flex justify-between text-sm">
                <span className="text-gray-400 font-medium">License Number:</span>
                <span className="text-white font-mono font-bold">{selectedRequest.licenseNumber}</span>
              </p>
              <p className="flex justify-between text-sm border-t border-white/5 pt-1.5">
                <span className="text-gray-400 font-medium">Contact:</span>
                <span className="text-blue-400 font-bold">{selectedRequest.contact}</span>
              </p>
              <p className="flex justify-between text-sm border-t border-white/5 pt-1.5">
                <span className="text-gray-400 font-medium">Request Status:</span>
                <span>{renderStatusBadge(selectedRequest.status)}</span>
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Store Address</p>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-sm text-gray-200 space-y-1">
                <p><span className="text-gray-400 font-medium">Street:</span> {selectedRequest.address.street}</p>
                <p><span className="text-gray-400 font-medium">City:</span> {selectedRequest.address.city}</p>
                <p><span className="text-gray-400 font-medium">State / Region:</span> {selectedRequest.address.state}</p>
                <p><span className="text-gray-400 font-medium">Postal Code:</span> {selectedRequest.address.postalCode}</p>
                <p><span className="text-gray-400 font-medium">Country:</span> {selectedRequest.address.country}</p>
                <p className="text-xs text-gray-500 font-mono pt-1">
                  Coords: [{selectedRequest.address.latitude}, {selectedRequest.address.longitude}]
                </p>
              </div>
            </div>

            {/* Mini Map */}
            {selectedRequest.address.latitude && selectedRequest.address.longitude && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                  <FiMapPin size={11} /> Store Location
                </p>
                <div className="w-full h-44 rounded-xl overflow-hidden border border-white/10 shadow-lg relative z-20">
                  <MapContainer
                    center={[selectedRequest.address.latitude, selectedRequest.address.longitude]}
                    zoom={14}
                    style={{ height: "100%", width: "100%" }}
                    zoomControl={false}
                    dragging={false}
                    scrollWheelZoom={false}
                  >
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                    <Marker
                      position={[selectedRequest.address.latitude, selectedRequest.address.longitude]}
                      icon={storePinIcon || undefined}
                    >
                      <Popup>
                        <div className="text-xs font-sans p-0.5">
                          <strong>{selectedRequest.name}</strong>
                          <p className="text-gray-600 mt-0.5">{selectedRequest.address.street}, {selectedRequest.address.city}</p>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            )}

            <div className="text-xs text-gray-500 space-y-1 font-mono">
              <p>Created: {new Date(selectedRequest.createdAt).toLocaleString()}</p>
              <p>Updated: {new Date(selectedRequest.updatedAt).toLocaleString()}</p>
            </div>

            <button
              onClick={() => setSelectedRequest(null)}
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition duration-200"
            >
              Close Details
            </button>
          </div>
        </CustomDialog>
      )}

      {showAddDialog && (
        <AddRequestDialog
          onClose={() => setShowAddDialog(false)}
          onRequestAdded={() => {
            setShowAddDialog(false);
            showToast("New facility registration request added!", "success");
            fetchRequestsHandler();
          }}
        />
      )}
    </div>
  );
}

export default RequestsPage;
