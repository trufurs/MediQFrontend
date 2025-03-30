"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import Cardi from "@/components/inventorycard";
import React from "react";

interface Medicine {
  _id: string;
  name: string;
  composition: string;
  manufacturer: string;
  usage: string;
  precautions: string;
}

// ✅ Define Inventory Type
interface InventoryItem {
  _id: string;
  store: string;
  medicine: Medicine;
  quantity: number;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
}

function InventoryPage() {
  // ✅ State Management
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Modal States
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // ✅ Form States
  const [quantity, setQuantity] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [medicine, setMedicine] = useState("");

  const API_URL = "http://localhost:3000/inventory/";

  // ✅ Fetch Inventory Data with Bearer Token
  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null); // Reset error state
      const token = localStorage.getItem("auth_token"); // Get token from localStorage
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInventory(response.data);
    } catch (err) {
      console.error("Error fetching inventory:", err);
      setError("Failed to fetch inventory. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // ✅ Render Inventory Items
  const renderInventory = () => {
    if (inventory.length === 0) {
      return <p className="text-gray-500">No inventory items found.</p>;
    }

    return inventory.map((item) => (
      <Cardi key={item._id} item={item} />
    ));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Inventory</h1>

      {/* ✅ Loading State */}
      {loading && <p className="text-blue-500">Loading inventory...</p>}

      {/* ✅ Error State */}
      {error && <p className="text-red-500">{error}</p>}

      {/* ✅ Inventory List */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {renderInventory()}
        </div>
      )}

      {/* ✅ Add/Edit Modals (Placeholder for future implementation) */}
      {openAdd && <div>Add Modal</div>}
      {openEdit && <div>Edit Modal</div>}
    </div>
  );
}

export default InventoryPage;