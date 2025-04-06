"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import React from "react";

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
  seller: string;
  totalItems: number;
  items: MedicineItem[];
  remarks: string;
}

function OrdersPage() {
  // ✅ State Management
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // ✅ Add Order Dialog States
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newOrder, setNewOrder] = useState({
    seller: "",
    remarks: "",
    items: [{ name: "", quantity: 0, price: 0, expiryDate: "", type: "" }],
  });
  const host = `${process.env.NEXT_PUBLIC_BACKEND}`;
  const API_URL = `${host}/order/`;
  const ORDERS_PER_PAGE = 6;

  // ✅ Fetch Orders Data with Bearer Token
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("auth_token");
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const mappedOrders: Order[] = response.data.map((order: any) => ({
        _id: order._id,
        orderDate: order.orderDate,
        seller: order.seller,
        totalItems: order.totalItems,
        items: order.medicines.map((medicine: any) => ({
          name: medicine.medicine_id.name,
          quantity: medicine.quantity,
          price: medicine.price,
          expiryDate: medicine.expiry,
          type: medicine.type,
        })),
        remarks: order.status,
      }));

      setOrders(mappedOrders);
      setFilteredOrders(mappedOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to fetch orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ✅ Handle Add Order Form Submission
  const handleAddOrder = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await axios.post(
        API_URL,
        {
          seller: newOrder.seller,
          remarks: newOrder.remarks,
          items: newOrder.items,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Add the new order to the orders list
      setOrders((prevOrders) => [...prevOrders, response.data]);
      setFilteredOrders((prevOrders) => [...prevOrders, response.data]);
      setShowAddDialog(false); // Close the dialog
      setNewOrder({
        seller: "",
        remarks: "",
        items: [{ name: "", quantity: 0, price: 0, expiryDate: "", type: "" }],
      });
    } catch (err) {
      console.error("Error adding order:", err);
      alert("Failed to add order. Please try again.");
    }
  };

  // ✅ Handle Input Changes for Add Order Form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, index: number) => {
    const { name, value } = e.target;
    const updatedItems = [...newOrder.items];
    updatedItems[index] = { ...updatedItems[index], [name]: value };
    setNewOrder({ ...newOrder, items: updatedItems });
  };

  const handleAddItem = () => {
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, { name: "", quantity: 0, price: 0, expiryDate: "", type: "" }],
    });
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = newOrder.items.filter((_, i) => i !== index);
    setNewOrder({ ...newOrder, items: updatedItems });
  };

  // ✅ Filter Orders
  const handleFilterChange = (filter: string) => {
    setFilter(filter);
    if (filter === "all") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter((order) => order.remarks === filter));
    }
  };

  // ✅ Pagination
  const indexOfLastOrder = currentPage * ORDERS_PER_PAGE;
  const indexOfFirstOrder = indexOfLastOrder - ORDERS_PER_PAGE;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // ✅ Open Dialog for Order Details
  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setSelectedOrder(null);
  };

  // ✅ Render Orders
  const renderOrders = () => {
    if (currentOrders.length === 0) {
      return <p className="text-gray-400">No orders found.</p>;
    }

    return currentOrders.map((order) => (
      <div
        key={order._id}
        className="cursor-pointer p-4 border border-gray-600 rounded-md bg-gray-800 hover:bg-gray-700 transition"
        onClick={() => handleOrderClick(order)}
      >
        <p><span className="font-semibold">Order ID:</span> {order._id}</p>
        <p><span className="font-semibold">Date:</span> {order.orderDate}</p>
        <p><span className="font-semibold">Seller:</span> {order.seller}</p>
        <p><span className="font-semibold">Items:</span> {order.totalItems}</p>
        <p><span className="font-semibold">Remarks:</span> {order.remarks}</p>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Orders</h1>

      {/* ✅ Filter Options */}
      <div className="mb-6 flex items-center space-x-4">
        <select
          value={filter}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-gray-400"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button
          onClick={() => setShowAddDialog(true)}
          className="bg-gray-700 text-white px-4 py-2 rounded-md shadow-md hover:bg-gray-800 transition"
        >
          Add Order
        </button>
      </div>

      {/* ✅ Add Order Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="bg-gray-900 rounded-lg shadow-lg w-96 max-h-[90vh] overflow-y-auto">
            <div className="bg-gray-800 text-white p-4 rounded-t-lg">
              <h2 className="text-lg font-bold">Add New Order</h2>
            </div>
            <div className="p-6">
              <input
                type="text"
                placeholder="Seller"
                value={newOrder.seller}
                onChange={(e) => setNewOrder({ ...newOrder, seller: e.target.value })}
                className="w-full mb-4 p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-gray-400"
              />
              <textarea
                placeholder="Remarks"
                value={newOrder.remarks}
                onChange={(e) => setNewOrder({ ...newOrder, remarks: e.target.value })}
                className="w-full mb-4 p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-gray-400"
              />
              <h3 className="text-md font-semibold mb-2">Items</h3>
              {newOrder.items.map((item, index) => (
                <div key={index} className="mb-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="Medicine Name"
                    value={item.name}
                    onChange={(e) => handleInputChange(e, index)}
                    className="w-full mb-2 p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-gray-400"
                  />
                  <input
                    type="number"
                    name="quantity"
                    placeholder="Quantity"
                    value={item.quantity}
                    onChange={(e) => handleInputChange(e, index)}
                    className="w-full mb-2 p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-gray-400"
                  />
                  <input
                    type="number"
                    name="price"
                    placeholder="Price"
                    value={item.price}
                    onChange={(e) => handleInputChange(e, index)}
                    className="w-full mb-2 p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-gray-400"
                  />
                  <input
                    type="date"
                    name="expiryDate"
                    placeholder="Expiry Date"
                    value={item.expiryDate}
                    onChange={(e) => handleInputChange(e, index)}
                    className="w-full mb-2 p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-gray-400"
                  />
                  <select
                    name="type"
                    value={item.type}
                    onChange={(e) => handleInputChange(e, index)}
                    className="w-full mb-2 p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-gray-400"
                  >
                    <option value="">Select Type</option>
                    <option value="new">New</option>
                    <option value="renew">Renew</option>
                  </select>
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-400 hover:underline"
                  >
                    Remove Item
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddItem}
                className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition"
              >
                Add Item
              </button>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => setShowAddDialog(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddOrder}
                  className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Loading State */}
      {loading && <p className="text-gray-400">Loading orders...</p>}

      {/* ✅ Error State */}
      {error && <p className="text-red-400">{error}</p>}

      {/* ✅ Orders List */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {renderOrders()}
        </div>
      )}

      {/* ✅ Pagination */}
      <div className="mt-6 flex justify-center space-x-2">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => handlePageChange(index + 1)}
            className={`px-4 py-2 rounded-md ${
              currentPage === index + 1
                ? "bg-gray-700 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* ✅ Dialog for Order Details */}
      {showDialog && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="bg-gray-900 rounded-lg shadow-lg w-96 max-h-[90vh] overflow-y-auto">
            <div className="flex  justify-between items-center bg-gray-800 text-white p-4 rounded-t-lg">
              <h2 className="text-lg font-bold">Order Details</h2>
              <button
                onClick={closeDialog}
                className=" bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition"
              >
                Close
              </button>
            </div>
            <div className="p-6">
              {selectedOrder.items.map((item, index) => (
                <div key={index} className="mb-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="Medicine Name"
                    value={item.name}
                    onChange={(e) => handleInputChange(e, index)}
                    className="w-full mb-2 p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-gray-400"
                  />
                  <input
                    type="number"
                    name="quantity"
                    placeholder="Quantity"
                    value={item.quantity}
                    onChange={(e) => handleInputChange(e, index)}
                    className="w-full mb-2 p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-gray-400"
                  />
                  <input
                    type="number"
                    name="price"
                    placeholder="Price"
                    value={item.price}
                    onChange={(e) => handleInputChange(e, index)}
                    className="w-full mb-2 p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-gray-400"
                  />
                  <input
                    type="text"
                    name="expiryDate"
                    placeholder="Expiry Date"
                    value={item.expiryDate.split("T")[0]} 
                    onChange={(e) => handleInputChange(e, index)}
                    className="w-full mb-2 p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-gray-400"
                  />
                  <select
                    name="type"
                    value={item.type}
                    onChange={(e) => handleInputChange(e, index)}
                    className="w-full mb-2 p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-gray-400"
                  >
                    <option value="">Select Type</option>
                    <option value="new">New</option>
                    <option value="renew">Renew</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdersPage;