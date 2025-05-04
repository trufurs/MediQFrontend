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
  remainingDays: number;
  createdAt: string;
  updatedAt: string;
}

const ITEMS_PER_PAGE = 6;

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
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "expired" | "nearExpiry">("all");

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

  useEffect(() => {
    // clear edit state when dialog is closed
    if (!openEdit) {
      setSelectedItem(null);
      setQuantity("");
      setExpiryDate("");
    }
  }, [openEdit]);

  useEffect(() => {
    // clear add state when dialog is closed
    if (!openAdd) {
      setSelectedMedicine("");
      setQuantity("");
      setExpiryDate("");
    }
  }, [openAdd]);

  useEffect(() => {
    // clear details state when dialog is closed
    if (!openDetails) {
      setSelectedItem(null);
    }
  }, [openDetails]);

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
        setInventory((prev) => prev.filter((item) => item._id !== id));
        showToast("Inventory deleted successfully!", "success");
        setReload(!reload);
      } catch (error) {
        console.error("Error deleting inventory:", error);
        showToast("Error deleting inventory", "error");
      }
    }
  };

  const filteredInventory = React.useMemo(() => {
    let filtered = [...inventory];

    if (filter === "expired") {
      filtered = filtered.filter((item) => new Date(item.expiryDate) < new Date());
    } else if (filter === "nearExpiry") {
      filtered = filtered.filter((item) => {
        const expiryDate = new Date(item.expiryDate);
        const now = new Date();
        const diffTime = expiryDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
        return diffDays <= 30 && expiryDate > now;
      });
    }

    return filtered;
  }, [inventory, filter]);

  const paginatedInventory = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredInventory.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, filteredInventory]);

  const totalPages = Math.ceil(filteredInventory.length / ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6 text-center">Inventory Management</h1>

      <div className="flex justify-between items-center mb-4">
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value as "all" | "expired" | "nearExpiry");
            setCurrentPage(1); // Reset to first page when filter changes
          }}
          className="p-2 bg-gray-700 text-white rounded"
        >
          <option value="all">All</option>
          <option value="expired">Expired</option>
          <option value="nearExpiry">Near Expiry</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loader"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedInventory.map((item) => {
              const isExpired = new Date(item.expiryDate) < new Date();
              return (
                <div
                  key={item._id}
                  className="relative bg-gray-800 border border-gray-700 rounded-lg shadow-md p-4 overflow-hidden"
                >
                  <div
                    className={`absolute top-0 right-0 m-2 px-3 py-1 rounded-full text-xs font-bold ${
                      item.remainingDays <= 7
                        ? "bg-red-500 text-white"
                        : item.remainingDays <= 30
                        ? "bg-yellow-500 text-black"
                        : "bg-green-500 text-white"
                    }`}
                  >
                    {item.remainingDays} Days
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <p
                      className={`text-sm font-semibold ${
                        isExpired ? "text-red-500" : "text-gray-400"
                      }`}
                    >
                      {isExpired
                        ? "Expired"
                        : `Expiry: ${item.expiryDate.split("T")[0]}`}
                    </p>
                  </div>
                  <h2 className="text-lg font-semibold">{item.medicine.name}</h2>
                  <p className="text-sm mb-4">Quantity: {item.quantity}</p>
                  <div className="flex gap-2 mt-auto">
                    <button
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-transform transform hover:scale-105"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-transform transform hover:scale-105"
                      onClick={() => handleShowDetails(item)}
                    >
                      Show Details
                    </button>
                    <button
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-2 transition-transform transform hover:scale-105"
                      onClick={() => handleDelete(item._id)}
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
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-700 text-white rounded mx-2"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded mx-1 ${
                    currentPage === page ? "bg-blue-500 text-white" : "bg-gray-700 text-white"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-700 text-white rounded mx-2"
              >
                Next
              </button>
            </div>
          )}
        </>
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
            <p>
              <strong>Composition:</strong> {selectedItem.medicine.composition}
            </p>
            <p>
              <strong>Manufacturer:</strong> {selectedItem.medicine.manufacturer}
            </p>
            <p>
              <strong>Usage:</strong> {selectedItem.medicine.usage}
            </p>
            <p>
              <strong>Precautions:</strong> {selectedItem.medicine.precautions}
            </p>
            <p>
              <strong>Quantity:</strong> {selectedItem.quantity}
            </p>
            <p>
              <strong>Expiry Date:</strong> {selectedItem.expiryDate.split("T")[0]}
            </p>
          </div>
        )}
      </CustomDialog>
    </div>
  );
};

export default InventoryPage;