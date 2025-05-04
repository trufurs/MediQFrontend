"use client";

import React, { useEffect, useState } from "react";
import CustomDialog from "../../components/CustomDialog";
import { useToast } from "@/context/ToastContext";
import {
  fetchInventory,
  addInventory,
  updateInventory,
  searchMedicines,
  deleteInventory,
} from "@/utils/management";


interface Medicine {
  id: string;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Medicine[]>([]);
  const [reload, setReload] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    const loadInventory = async () => {
      try {
        const data = await fetchInventory();
        setInventory(data);
      } catch (error) {
        console.error("Error fetching inventory:", error);
        showToast("Error fetching inventory", "error");
      } finally {
        setLoading(false);
      }
    };
    loadInventory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload]);


  useEffect(()=>
    {
      // clear edit state when dialog is closed
      if (!openEdit) {
        setSelectedItem(null);
        setQuantity("");
        setExpiryDate("");
      }
    }, [openEdit]);
  useEffect(()=>
    {
      // clear add state when dialog is closed
      if (!openAdd) {
        setSelectedMedicine("");
        setQuantity("");
        setExpiryDate("");
      }
    }
    , [openAdd]);
  useEffect(()=>
    {
      // clear details state when dialog is closed
      if (!openDetails) {
        setSelectedItem(null);
      }
    }
    , [openDetails]);
    
    const handleSearch = async (query: string) => {
      setSearchQuery(query);
      if (query.trim() === "") {
        setSearchResults([]);
        return;
      }
      try {
        const results = await searchMedicines(query);
        setSearchResults(results);
      } catch (error) {
        showToast("Error searching medicines", "error");
        setSearchResults([]);
        console.error("Error searching medicines:", error);
      }
    };

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
    try {
      await addInventory({
        medicine: selectedMedicine,
        quantity: Number(quantity),
        expiryDate,
      });
      showToast("Inventory added successfully!", "success");
      setOpenAdd(false);
      setReload(!reload);
    } catch (error) {
      console.error("Error adding inventory:", error);
    }
  };

  const handleUpdate = async () => {
    if (!selectedItem) return;
    try {
      await updateInventory(selectedItem._id, {
        quantity: Number(quantity),
        expiryDate,
      });
      showToast("Inventory updated successfully!", "success");
      setOpenEdit(false);
      setReload(!reload);
    } catch (error) {
      console.error("Error updating inventory:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteInventory(id);
        // Remove the deleted item from the inventory state
        // This is a more efficient way to update the state
        // instead of fetching the entire inventory again
        setInventory((prev) => prev.filter((item) => item._id !== id));
        showToast("Inventory deleted successfully!", "success");
        setReload(!reload);
      } catch (error) {
        console.error("Error deleting inventory:", error);
        showToast("Error deleting inventory", "error");
      }
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
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-2"
            onClick={() => handleDelete(item._id)
            }
            title="Delete"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 9l-.867 10.142A2.25 2.25 0 0116.392 21H7.608a2.25 2.25 0 01-2.241-1.858L4.5 9m5.25 4.5v5.25m4.5-5.25v5.25M10.5 4.5h3m-6 0h9m-10.5 0a2.25 2.25 0 012.25-2.25h4.5a2.25 2.25 0 012.25 2.25m-9 0h9"
              />
            </svg>
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
          <input
            type="text"
            placeholder="Search Medicine"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full p-2 mb-4 border border-gray-700 bg-gray-800 text-white rounded"
          />
          {searchQuery && searchResults.length > 0 && (
            <ul className="bg-gray-800 border border-gray-700 rounded max-h-40 overflow-y-auto">
              {searchResults.map((medicine) => (
                <li
                  key={medicine.id}
                  onClick={() => {
                    setSelectedMedicine(medicine.id);
                    setSearchQuery(medicine.name); // Show selected medicine name
                    setSearchResults([]); // Clear search results
                  }}
                  className="p-2 hover:bg-gray-700 cursor-pointer"
                >
                  {medicine.name}
                </li>
              ))}
            </ul>
          )}
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
