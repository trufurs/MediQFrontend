"use client";
import { useEffect, useState } from "react";
import React from "react";
import { fetchRequests, updateRequestStatus } from "@/utils/request";
import CustomDialog from "@/components/CustomDialog"; // Import CustomDialog
import dynamic from "next/dynamic";
const AddRequestDialog = dynamic(() => import("@/components/AddRequestDialog"), {   
    ssr: false,
    });
import { useToast } from "@/context/ToastContext"; // Import Toast Context


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
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null); // State for selected request
  const [statusFilter, setStatusFilter] = useState<string>("all"); // State for status filter
  const { showToast } = useToast(); // Toast context for notifications
  // Fetch Requests
  const fetchRequestsHandler = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("auth_token");
      const data = await fetchRequests(token!);
      setRequests(data);
      showToast("Requests fetched successfully!", "success"); // Success toast
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError("Failed to fetch requests. Please try again later.");
      showToast("Failed to fetch requests. Please try again.", "error"); // Error toast
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestsHandler();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Admin Action (Verify/Reject)
  const handleAdminAction = async (requestId: string, status: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      await updateRequestStatus(token!, requestId, status);
      setRequests((prevRequests) =>
        prevRequests.map((req) =>
          req._id === requestId ? { ...req, status } : req
        )
      );
      showToast(
        `Request has been ${status === "verified" ? "verified" : "rejected"} successfully!`,
        "success"
      ); // Success toast
    } catch (err) {
      console.error("Error updating request status:", err);
      showToast("Failed to update request status. Please try again.", "error"); // Error toast
    }
  };

  // Function to handle viewing full details
  const handleViewDetails = (request: Request) => {
    setSelectedRequest(request);
  };

  // Filtered requests based on status
  const filteredRequests = requests.filter((request) =>
    statusFilter === "all"
      ? true
      : normalizeStatusForFilter(request.status) === statusFilter
  );

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Requests</h1>

      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setShowAddDialog(true)}
          className="bg-gray-700 text-white px-4 py-2 rounded-md shadow-md hover:bg-gray-800 transition"
        >
          Add Request
        </button>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            showToast(`Filter applied: ${e.target.value}`, "success"); // Info toast
          }}
          className="bg-gray-700 text-white py-2 rounded-md shadow-md hover:bg-gray-800 transition"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        {showAddDialog && (
          <AddRequestDialog
            onClose={() => setShowAddDialog(false)}
            onRequestAdded={(newRequest) => {
              setRequests((prevRequests) => [...prevRequests, newRequest]);
              showToast("New request added successfully!", "success"); // Success toast
            }}
          />
        )}
        </div>
        

        {loading && <p className="text-gray-400">Loading requests...</p>}

      {/* Error State */}
      {error && <p className="text-red-400">{error}</p>}

      {/* Requests List */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRequests.map((request) => (
            <div
              key={request._id}
              className="p-4 border border-gray-600 rounded-md bg-gray-800"
            >
              <p>
                <span className="font-semibold">Name:</span> {request.name}
              </p>
              <p>
                <span className="font-semibold">License:</span>{" "}
                {request.licenseNumber}
              </p>
              <p>
                <span className="font-semibold">Contact:</span>{" "}
                {request.contact}
              </p>
              <p>
                <span className="font-semibold">Status:</span> {request.status}
              </p>
              <button
                onClick={() => handleViewDetails(request)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition mt-2"
              >
                View Details
              </button>
              {request.status === "pending" && (
              <div className="mt-2 flex space-x-2">
                <button
                  onClick={() => handleAdminAction(request._id, "verified")}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                >
                  Verify
                </button>
                <button
                  onClick={() => handleAdminAction(request._id, "rejected")}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
                >
                  Reject
                </button>
              </div>
                )}
            </div>
          ))}
        </div>
      )}

      {/* Full Details Modal */}
      {selectedRequest && (
        <CustomDialog
          open={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          title="Request Details"
        >
          <div>
            <p>
              <span className="font-semibold">Name:</span> {selectedRequest.name}
            </p>
            <p>
              <span className="font-semibold">License:</span>{" "}
              {selectedRequest.licenseNumber}
            </p>
            <p>
              <span className="font-semibold">Contact:</span>{" "}
              {selectedRequest.contact}
            </p>
            <p>
              <span className="font-semibold">Status:</span>{" "}
              {selectedRequest.status}
            </p>
            <p>
              <span className="font-semibold">Address:</span>{" "}
              {`${selectedRequest.address.street}, ${selectedRequest.address.city}, ${selectedRequest.address.state}, ${selectedRequest.address.country}`}
            </p>
            <p>
              <span className="font-semibold">Created At:</span>{" "}
              {new Date(selectedRequest.createdAt).toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">Updated At:</span>{" "}
              {new Date(selectedRequest.updatedAt).toLocaleString()}
            </p>
          </div>
        </CustomDialog>
      )}
    </div>
  );
}

export default RequestsPage;
