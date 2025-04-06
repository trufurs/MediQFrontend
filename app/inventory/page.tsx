"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import CustomDialog from "../../components/CustomDialog";

const host = `${process.env.backend}`;

interface Medicine {
  _id: string;
  name: string;
  composition: string;
  manufacturer: string;
  usage: string;
  precautions: string;
}

interface InventoryItem {
  _id: string;
  store: string;
  medicine: Medicine;
  quantity: number;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
}

const InventoryPage = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [quantity, setQuantity] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  const API_URL = `${host}/inventory/`;

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    axios
      .get(API_URL, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        setInventory(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching inventory:", error);
        setLoading(false);
      });
  }, []);

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setQuantity(item.quantity.toString());
    setExpiryDate(item.expiryDate.split("T")[0]);
    setOpenEdit(true);
  };

  const handleShowDetails = (item: InventoryItem) => {
    setSelectedItem(item);
    setOpenDetails(true);
  };

  const handleAdd = async () => {
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        API_URL,
        { medicine: selectedMedicine, quantity: Number(quantity), expiryDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Inventory added successfully!");
      setOpenAdd(false);
      window.location.reload();
    } catch (error) {
      console.error("Error adding inventory:", error);
    }
  };

  const handleUpdate = async () => {
    if (!selectedItem) return;
    const token = localStorage.getItem("token");

    try {
      await axios.put(
        `${API_URL}${selectedItem._id}`,
        { quantity: Number(quantity), expiryDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Inventory updated successfully!");
      setOpenEdit(false);
      window.location.reload();
    } catch (error) {
      console.error("Error updating inventory:", error);
    }
  };

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">Inventory Management</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loader"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inventory.map((item) => (
            <div
              key={item._id}
              className="bg-gray-800 border border-gray-700 rounded-lg shadow-md p-4"
            >
              <h2 className="text-lg font-semibold">{item.medicine.name}</h2>
              <p className="text-sm">Quantity: {item.quantity}</p>
              <p className="text-sm">Expiry Date: {item.expiryDate.split("T")[0]}</p>
              <div className="flex gap-2 mt-4">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => handleEdit(item)}
                >
                  Edit
                </button>
                <button
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  onClick={() => handleShowDetails(item)}
                >
                  Show Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600"
        onClick={() => setOpenAdd(true)}
      >
        +
      </button>

      <CustomDialog open={openAdd} onClose={() => setOpenAdd(false)} title="Add Inventory">
        <div>
          <select
            value={selectedMedicine}
            onChange={(e) => setSelectedMedicine(e.target.value)}
            className="w-full p-2 mb-4 border border-gray-700 bg-gray-800 text-white rounded"
          >
            <option value="" disabled>
              Select Medicine
            </option>
            {medicines.map((medicine) => (
              <option key={medicine._id} value={medicine._id}>
                {medicine.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full p-2 mb-4 border border-gray-700 bg-gray-800 text-white rounded"
          />
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="w-full p-2 mb-4 border border-gray-700 bg-gray-800 text-white rounded"
          />
          <button
            onClick={handleAdd}
            className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Add Inventory
          </button>
        </div>
      </CustomDialog>

      <CustomDialog open={openEdit} onClose={() => setOpenEdit(false)} title="Edit Inventory">
        <div>
          <input
            type="text"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full p-2 mb-4 border border-gray-700 bg-gray-800 text-white rounded"
          />
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="w-full p-2 mb-4 border border-gray-700 bg-gray-800 text-white rounded"
          />
          <button
            onClick={handleUpdate}
            className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Update
          </button>
        </div>
      </CustomDialog>

      <CustomDialog open={openDetails} onClose={() => setOpenDetails(false)} title="Inventory Details">
        {selectedItem && (
          <div>
            <h2 className="text-lg font-semibold mb-2">{selectedItem.medicine.name}</h2>
            <p><strong>Composition:</strong> {selectedItem.medicine.composition}</p>
            <p><strong>Manufacturer:</strong> {selectedItem.medicine.manufacturer}</p>
            <p><strong>Usage:</strong> {selectedItem.medicine.usage}</p>
            <p><strong>Precautions:</strong> {selectedItem.medicine.precautions}</p>
            <p><strong>Quantity:</strong> {selectedItem.quantity}</p>
            <p><strong>Expiry Date:</strong> {selectedItem.expiryDate.split("T")[0]}</p>
          </div>
        )}
      </CustomDialog>
    </div>
  );
};

export default InventoryPage;
