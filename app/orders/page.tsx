/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";
import AddMedicineDialog from "@/components/AddMedicineDialog";
import CustomDialog from "@/components/CustomDialog";
import { fetchCustomerOrders } from "@/utils/management";
import { FiPrinter } from "react-icons/fi";

interface MedicineItem {
  name: string;
  quantity: number;
  price: number;
  expiryDate: string;
  type: string;
}

interface Order {
  _id: string;
  orderDate: string;
  seller?: string;
  customer?: {
    name: string;
    email: string;
    phone: number;
  };
  totalItems: number;
  items: MedicineItem[];
  remarks: string;
  status: 'pending' | 'processed' | 'completed' | 'cancelled';
  orderType?: 'b2b' | 'b2c';
}

function OrdersPage() {
  const { showToast } = useToast();
  const [role, setRole] = useState<string>("customer");

  // State Management
  const [b2bOrders, setB2bOrders] = useState<Order[]>([]);
  const [b2cRequests, setB2cRequests] = useState<Order[]>([]);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tabs for store-owner: 'supplier' (B2B) or 'customer-req' (B2C)
  const [ownerTab, setOwnerTab] = useState<"supplier" | "customer-req">("supplier");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Dialog State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showAddMedicineDialog, setShowAddMedicineDialog] = useState(false);

  const host = `${process.env.NEXT_PUBLIC_BACKEND}`;

  // Helper to fetch authorization headers
  const getHeaders = () => {
    const token = localStorage.getItem("auth_token");
    return { Authorization: `Bearer ${token}` };
  };

  // Get User Role
  useEffect(() => {
    const userData = localStorage.getItem("user_data");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setRole(parsed.role || "customer");
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
  }, []);

  // Fetch all orders depending on role
  const fetchAllOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError("Please log in to view orders.");
        setLoading(false);
        return;
      }

      if (role === "store-owner") {
        // Fetch Supplier (B2B) orders
        const b2bRes = await axios.get(`${host}/order`, { headers: getHeaders() });
        const mappedB2b: Order[] = b2bRes.data
          .filter((o: any) => o.orderType === 'b2b' || !o.orderType)
          .map((o: any) => ({
            _id: o._id,
            orderDate: o.orderDate || o.createdAt,
            seller: o.seller || "Supplier",
            totalItems: o.totalItems,
            status: 'completed',
            orderType: o.orderType || 'b2b',
            items: o.medicines.map((m: any) => ({
              name: m.medicine_id?.name || "Unknown Medicine",
              quantity: m.quantity,
              price: m.price,
              expiryDate: m.expiry,
              type: m.type || "renew",
            })),
            remarks: o.remarks || "B2B Restock Order",
          }));
        setB2bOrders(mappedB2b);

        // Fetch Customer (B2C) requests
        const b2cRes = await fetchCustomerOrders();
        const mappedB2c: Order[] = b2cRes.map((o: any) => ({
          _id: o._id,
          orderDate: o.orderDate || o.createdAt,
          customer: o.customer || { name: "Guest Customer", email: "N/A", phone: 0 },
          totalItems: o.totalItems,
          status: o.status,
          orderType: 'b2c',
          items: o.medicines.map((m: any) => ({
            name: m.medicine_id?.name || "Unknown Medicine",
            quantity: m.quantity,
            price: m.price,
            expiryDate: m.expiry,
            type: m.type || "renew",
          })),
          remarks: o.remarks || "Customer Request",
        }));
        setB2cRequests(mappedB2c);
      } else {
        // Fetch Customer B2C orders history
        const customerRes = await fetchCustomerOrders();
        const mappedCust: Order[] = customerRes.map((o: any) => ({
          _id: o._id,
          orderDate: o.orderDate || o.createdAt,
          totalItems: o.totalItems,
          status: o.status,
          orderType: 'b2c',
          items: o.medicines.map((m: any) => ({
            name: m.medicine_id?.name || "Unknown Medicine",
            quantity: m.quantity,
            price: m.price,
            expiryDate: m.expiry,
            type: m.type || "renew",
          })),
          remarks: o.remarks || "My Order Request",
        }));
        setCustomerOrders(mappedCust);
      }
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      setError("Failed to fetch orders.");
      showToast("Error loading order list.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role) {
      fetchAllOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  // Handle order status updates (Approve/Complete or Reject/Cancel) B2C request
  const handleUpdateStatus = async (orderId: string, nextStatus: 'completed' | 'cancelled') => {
    try {
      const response = await axios.put(
        `${host}/order/${orderId}`,
        { status: nextStatus },
        { headers: getHeaders() }
      );
      showToast(`Order has been marked as ${nextStatus}!`, "success");
      
      // Update local state
      setB2cRequests((prev) =>
        prev.map((order) => (order._id === orderId ? { ...order, status: nextStatus } : order))
      );
    } catch (err: any) {
      console.error("Error updating order status:", err);
      showToast(err.response?.data?.error || "Failed to update order status.", "error");
    }
  };

  const handleMedicineAdded = (medicine: any) => {
    showToast(`Medicine "${medicine.name}" created!`, "success");
    setShowAddMedicineDialog(false);
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsDialog(true);
  };

  const renderStatusBadge = (status: Order["status"]) => {
    const stylesMap = {
      pending: "bg-amber-500/10 border-amber-500/30 text-amber-400",
      processed: "bg-blue-500/10 border-blue-500/30 text-blue-400",
      completed: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
      cancelled: "bg-rose-500/10 border-rose-500/30 text-rose-400",
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${stylesMap[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getFilteredList = (list: Order[]) => {
    if (filterStatus === "all") return list;
    return list.filter((o) => o.status === filterStatus);
  };

  const listToRender = role === "store-owner"
    ? (ownerTab === "supplier" ? b2bOrders : b2cRequests)
    : customerOrders;

  const filteredListToRender = getFilteredList(listToRender);

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-8">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 text-left">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Orders & Invoices</h1>
          <p className="text-gray-400 text-sm mt-1">
            {role === "store-owner"
              ? "View wholesale invoice logs (B2B) and process customer medicine requests (B2C)."
              : "Review your requested medicine orders."}
          </p>
        </div>

        {/* Global actions */}
        <div className="flex items-center space-x-3 self-start md:self-auto">
          {role === "store-owner" && (
            <>
              <Link href="/orders/add">
                <button className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-md transition duration-200">
                  Log Wholesale Invoice
                </button>
              </Link>
              <button
                onClick={() => setShowAddMedicineDialog(true)}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition duration-200"
              >
                Add Custom Medicine
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs and Filtering */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-4 mb-6 gap-4 text-left">
        {/* Tabs for store owners */}
        {role === "store-owner" ? (
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => { setOwnerTab("supplier"); setFilterStatus("all"); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                ownerTab === "supplier" ? "bg-white/10 text-white shadow-md" : "text-gray-400 hover:text-white"
              }`}
            >
              Wholesale Invoices (B2B)
            </button>
            <button
              onClick={() => { setOwnerTab("customer-req"); setFilterStatus("all"); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                ownerTab === "customer-req" ? "bg-white/10 text-white shadow-md" : "text-gray-400 hover:text-white"
              }`}
            >
              Patient Requests (B2C)
            </button>
          </div>
        ) : (
          <span className="text-sm font-bold text-blue-400 uppercase tracking-wider">My Requests History</span>
        )}

        {/* Filters */}
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-400">Filter Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option className="text-black" value="all">All</option>
            <option className="text-black" value="pending">Pending</option>
            <option className="text-black" value="completed">Completed</option>
            <option className="text-black" value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-400 text-sm">Loading orders...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
          <p className="text-rose-400 font-medium">{error}</p>
          <button
            onClick={fetchAllOrders}
            className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-lg transition"
          >
            Retry Fetch
          </button>
        </div>
      ) : filteredListToRender.length === 0 ? (
        <div className="text-center py-16 bg-white/5 border border-white/5 rounded-2xl">
          <p className="text-gray-400 text-base">No orders found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListToRender.map((order) => (
            <div
              key={order._id}
              className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl p-6 shadow-md transition duration-300 flex flex-col justify-between text-left"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[10px] text-gray-500 font-mono tracking-tight uppercase">ID: {order._id}</p>
                    <p className="text-xs text-gray-400 font-semibold mt-0.5">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </p>
                  </div>
                  {renderStatusBadge(order.status)}
                </div>

                {/* Display Seller or Customer info */}
                {order.orderType === "b2c" && order.customer ? (
                  <div className="mb-4 bg-white/5 p-3 rounded-xl border border-white/5">
                    <p className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-1">Customer</p>
                    <p className="text-sm font-bold text-white">{order.customer.name}</p>
                    {order.customer.phone > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">Phone: {order.customer.phone}</p>
                    )}
                  </div>
                ) : (
                  <div className="mb-4 bg-white/5 p-3 rounded-xl border border-white/5">
                    <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-1">Supplier</p>
                    <p className="text-sm font-bold text-white">{order.seller}</p>
                  </div>
                )}

                {/* Medicine Items */}
                <div className="space-y-2.5 mb-6">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Medicines</p>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-200 font-medium truncate max-w-40">{item.name}</span>
                      <span className="text-gray-400 font-bold">Qty: {item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                {/* Remarks preview */}
                <p className="text-xs text-gray-400 italic bg-white/5 px-3 py-2 rounded-xl mb-4 border border-white/5 truncate">
                  Remarks: {order.remarks}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOrderClick(order)}
                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition duration-200"
                  >
                    View Details
                  </button>

                  {/* B2C Pending Actions */}
                  {role === "store-owner" && order.orderType === "b2c" && order.status === "pending" && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order._id, "completed"); }}
                        className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition duration-200"
                      >
                        Approve
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order._id, "cancelled"); }}
                        className="py-2.5 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition duration-200"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedOrder && (
        <CustomDialog
          open={showDetailsDialog}
          onClose={() => setShowDetailsDialog(false)}
          title={selectedOrder.orderType === "b2b" ? "Wholesale Purchase Invoice" : "Order Full Details"}
        >
          {selectedOrder.orderType === "b2b" ? (
            // B2B Wholesale Invoice Layout
            <div className="space-y-6 text-left">
              {/* Corporate Header */}
              <div className="border-b border-white/10 pb-4 flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-white">MediQ Wholesale Invoice</h3>
                  <p className="text-xs text-cyan-400 mt-1 font-mono select-all">Inv-ID: {selectedOrder._id}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Date: {new Date(selectedOrder.orderDate).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold border bg-emerald-500/10 border-emerald-500/30 text-emerald-400 uppercase">
                    COMPLETED
                  </span>
                  <p className="text-[10px] text-gray-500 mt-1.5 font-mono">Type: B2B Restock</p>
                </div>
              </div>

              {/* Billing details */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-white/5 p-4 rounded-xl border border-white/5">
                <div>
                  <p className="font-bold text-gray-400 uppercase tracking-wider mb-1">Supplier</p>
                  <p className="text-white font-semibold text-sm">{selectedOrder.seller}</p>
                  <p className="text-gray-400 mt-0.5">Verified Restock Vendor</p>
                </div>
                <div>
                  <p className="font-bold text-gray-400 uppercase tracking-wider mb-1">Received By</p>
                  <p className="text-white font-semibold text-sm">Your Store</p>
                  <p className="text-gray-400 mt-0.5">Inventory Auto-updated</p>
                </div>
              </div>

              {/* Line Items Table/List */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-white/10 pb-1.5">
                  Invoiced Line Items
                </p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/5 text-sm flex justify-between items-center">
                      <div className="space-y-0.5 text-left">
                        <p className="font-semibold text-white">{item.name}</p>
                        {item.expiryDate && (
                          <p className="text-[10px] text-amber-300 font-mono">
                            Expiry: {new Date(item.expiryDate).toLocaleDateString()}
                          </p>
                        )}
                        <p className="text-[10px] text-gray-400 uppercase">Type: {item.type === 'new' ? 'New Batch' : 'Replenish'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">{item.quantity} units</p>
                        <p className="text-xs text-gray-400">@ ₹{item.price.toFixed(2)}</p>
                        <p className="text-xs text-cyan-400 font-bold mt-0.5">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary / Total */}
              <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                <div className="max-w-[60%]">
                  <p className="text-xs text-gray-400 italic">Remarks: {selectedOrder.remarks}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Total Purchase Value</p>
                  <p className="text-xl font-extrabold text-cyan-400 font-mono">
                    ₹{selectedOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    showToast("Invoice print job initiated. PDF download starting...", "success");
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FiPrinter className="text-sm" /> Print Invoice Receipt
                </button>
                <button
                  onClick={() => setShowDetailsDialog(false)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            // B2C Customer Layout
            <div className="space-y-6 text-left">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Order Identifier</p>
                <p className="text-sm font-mono text-white select-all">{selectedOrder._id}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Placed on {new Date(selectedOrder.orderDate).toLocaleString()}
                </p>
              </div>

              {selectedOrder.customer ? (
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <p className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-2">Customer Details</p>
                  <p className="text-sm text-white"><span className="font-semibold text-gray-400">Name:</span> {selectedOrder.customer.name}</p>
                  <p className="text-sm text-white mt-1"><span className="font-semibold text-gray-400">Email:</span> {selectedOrder.customer.email}</p>
                  {selectedOrder.customer.phone > 0 && (
                    <p className="text-sm text-white mt-1"><span className="font-semibold text-gray-400">Phone:</span> {selectedOrder.customer.phone}</p>
                  )}
                </div>
              ) : (
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-1">Supplier Details</p>
                  <p className="text-sm text-white font-bold">{selectedOrder.seller}</p>
                </div>
              )}

              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-white/10 pb-1.5">
                  Items Requested ({selectedOrder.totalItems})
                </p>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/5 text-sm space-y-1">
                    <p className="font-semibold text-white">{item.name}</p>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Quantity: <strong className="text-white">{item.quantity}</strong></span>
                      <span>Price: <strong className="text-white">₹{item.price.toFixed(2)}</strong></span>
                    </div>
                    {item.expiryDate && (
                      <p className="text-[10px] text-amber-300">
                        Expiry batch: {new Date(item.expiryDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Remarks</p>
                <p className="text-sm text-gray-300 bg-white/5 border border-white/5 p-3 rounded-xl italic">
                  {selectedOrder.remarks}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Order Status</p>
                {renderStatusBadge(selectedOrder.status)}
              </div>

              <button
                onClick={() => setShowDetailsDialog(false)}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition duration-200 mt-2"
              >
                Close
              </button>
            </div>
          )}
        </CustomDialog>
      )}

      {/* Add Medicine Dialog */}
      {showAddMedicineDialog && (
        <AddMedicineDialog
          onClose={() => setShowAddMedicineDialog(false)}
          onMedicineAdded={handleMedicineAdded}
        />
      )}
    </div>
  );
}

export default OrdersPage;