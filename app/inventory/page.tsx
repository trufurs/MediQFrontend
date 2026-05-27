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
import { FiBox, FiAlertTriangle, FiTrash2, FiEdit2, FiInfo, FiSearch, FiCalendar, FiPlus } from "react-icons/fi";

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
  const [filter, setFilter] = useState<"all" | "expired" | "nearExpiry" | "lowStock">("all");

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
    if (!openEdit) {
      setSelectedItem(null);
      setQuantity("");
      setExpiryDate("");
    }
  }, [openEdit]);

  useEffect(() => {
    if (!openAdd) {
      setSelectedMedicine("");
      setQuantity("");
      setExpiryDate("");
    }
  }, [openAdd]);

  useEffect(() => {
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
    if (!selectedMedicine) {
      showToast("Please search and select a medicine record.", "error");
      return;
    }
    if (!quantity || parseInt(quantity, 10) <= 0) {
      showToast("Please enter a valid stock quantity.", "error");
      return;
    }
    if (!expiryDate) {
      showToast("Please specify the batch expiry date.", "error");
      return;
    }

    try {
      await addInventory({
        medicine: selectedMedicine,
        quantity: Number(quantity),
        expiryDate,
      });
      showToast("Inventory batch added successfully!", "success");
      setOpenAdd(false);
      setReload(!reload);
    } catch (error) {
      console.error("Error adding inventory:", error);
      showToast("Failed to add inventory batch.", "error");
    }
  };

  const handleUpdate = async () => {
    if (!selectedItem) return;
    if (!quantity || parseInt(quantity, 10) <= 0) {
      showToast("Please enter a valid stock quantity.", "error");
      return;
    }
    if (!expiryDate) {
      showToast("Please specify the batch expiry date.", "error");
      return;
    }

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
      showToast("Failed to update inventory batch.", "error");
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

  // Compute metrics
  const stats = React.useMemo(() => {
    const total = inventory.length;
    const expired = inventory.filter((item) => new Date(item.expiryDate) < new Date()).length;
    const near = inventory.filter((item) => {
      const expiryDate = new Date(item.expiryDate);
      const now = new Date();
      const diffTime = expiryDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
      return diffDays <= 30 && expiryDate > now;
    }).length;
    const lowStock = inventory.filter((item) => item.quantity < 15).length;
    return { total, expired, near, lowStock };
  }, [inventory]);

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
    } else if (filter === "lowStock") {
      filtered = filtered.filter((item) => item.quantity < 15);
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
    <div className="p-6 md:p-10 bg-black min-h-screen text-white max-w-6xl mx-auto text-left">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Stock Inventory Manager</h1>
          <p className="text-gray-400 text-sm mt-1">Track physical medicine batches, expiry alerts, and stock counts.</p>
        </div>
        <button
          onClick={() => setOpenAdd(true)}
          className="self-start md:self-auto flex items-center gap-1.5 px-5 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg transition duration-200 transform active:scale-95 cursor-pointer text-sm"
        >
          <FiPlus /> Add Stock Batch
        </button>
      </div>

      {/* Expiry Warning Alert Banner */}
      {!loading && (stats.expired > 0 || stats.near > 0) && (
        <div className="mb-6 p-4 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/30 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition duration-300">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 animate-pulse">
              <FiAlertTriangle size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Batch Action Required</h4>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                You have {stats.expired > 0 ? `${stats.expired} expired` : ""} 
                {stats.expired > 0 && stats.near > 0 ? " and " : ""}
                {stats.near > 0 ? `${stats.near} near-expiry` : ""} inventory batches. Remove or discount them to prevent sales compliance issues.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setFilter(stats.expired > 0 ? "expired" : "nearExpiry");
              setCurrentPage(1);
            }}
            className="px-4.5 py-2 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/20 hover:border-amber-500 rounded-xl text-xs font-bold transition duration-200 cursor-pointer whitespace-nowrap self-stretch md:self-auto text-center"
          >
            Review Batches
          </button>
        </div>
      )}

      {/* Stats Summary widgets row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-md flex items-center justify-between relative overflow-hidden">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Active Batches</p>
            <p className="text-3xl font-extrabold text-white">{loading ? "..." : stats.total}</p>
          </div>
          <span className="text-3xl p-3 bg-white/5 rounded-xl border border-white/5"><FiBox className="text-gray-300" size={24} /></span>
        </div>

        <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-5 shadow-md flex items-center justify-between relative overflow-hidden">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-rose-455 uppercase tracking-wider">Expired Batches</p>
            <p className="text-3xl font-extrabold text-rose-400">{loading ? "..." : stats.expired}</p>
          </div>
          <span className="text-3xl p-3 bg-rose-500/10 rounded-xl border border-rose-500/20"><FiAlertTriangle className="text-rose-400" size={24} /></span>
        </div>

        <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-5 shadow-md flex items-center justify-between relative overflow-hidden">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-amber-455 uppercase tracking-wider">Nearing Expiry</p>
            <p className="text-3xl font-extrabold text-amber-400">{loading ? "..." : stats.near}</p>
          </div>
          <span className="text-3xl p-3 bg-amber-500/10 rounded-xl border border-amber-500/20"><FiAlertTriangle className="text-amber-400" size={24} /></span>
        </div>

        <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-2xl p-5 shadow-md flex items-center justify-between relative overflow-hidden">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-cyan-455 uppercase tracking-wider">Low Stock (&lt; 15 units)</p>
            <p className="text-3xl font-extrabold text-cyan-400">{loading ? "..." : stats.lowStock}</p>
          </div>
          <span className="text-3xl p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20"><FiBox className="text-cyan-400" size={24} /></span>
        </div>
      </div>

      {/* Filter and Tab Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-4 mb-6 gap-4">
        {/* Toggle tabs */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-full md:max-w-md">
          {(["all", "expired", "nearExpiry", "lowStock"] as const).map((type) => {
            const labels = { all: "All", expired: "Expired", nearExpiry: "Expiring", lowStock: "Low Stock" };
            return (
              <button
                key={type}
                onClick={() => {
                  setFilter(type);
                  setCurrentPage(1);
                }}
                className={`flex-grow py-2 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
                  filter === type ? "bg-white/10 text-white shadow-md" : "text-gray-400 hover:text-white"
                }`}
              >
                {labels[type]}
              </button>
            );
          })}
        </div>
        
        <span className="text-xs text-gray-500 font-semibold uppercase tracking-widest">
          Showing {filteredInventory.length} results
        </span>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
          <p className="text-gray-400 text-sm">Synchronizing inventory records...</p>
        </div>
      ) : filteredInventory.length === 0 ? (
        <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl shadow-xl">
          <FiBox className="mx-auto text-5xl text-gray-500 mb-3" />
          <p className="text-gray-400 text-base">No inventory records found.</p>
          <p className="text-gray-550 text-xs mt-1">Try toggling filters or add a new stock batch to start.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedInventory.map((item) => {
              const isExpired = new Date(item.expiryDate) < new Date();
              const daysLeft = item.remainingDays;
              
              // Expiry urgency status
              const daysPercent = Math.max(0, Math.min(100, (daysLeft / 180) * 100));
              const progressColor = daysLeft <= 7 ? "bg-red-500" : daysLeft <= 30 ? "bg-amber-500" : "bg-emerald-500";
              const tagStyle = daysLeft <= 7 
                ? "bg-red-500/10 border-red-500/30 text-red-400" 
                : daysLeft <= 30 
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400" 
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";

              return (
                <div
                  key={item._id}
                  className={`bg-white/5 hover:bg-white/10 border rounded-2xl p-5 shadow-lg hover:shadow-2xl transition duration-300 flex flex-col justify-between relative overflow-hidden ${
                    isExpired ? "border-red-500/10 hover:border-red-500/30" : "border-white/10 hover:border-cyan-500/20"
                  }`}
                >
                  {/* Urgency Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border uppercase tracking-wider ${tagStyle}`}>
                      {daysLeft <= 0 ? "Expired" : `${daysLeft} Days Left`}
                    </span>
                  </div>

                  <div>
                    {/* Expiry Calendar info */}
                    <div className="text-gray-400 text-[10px] font-mono tracking-tight flex items-center mb-3">
                      <FiCalendar className="mr-1.5 flex-shrink-0" />
                      <span>{isExpired ? "Expired on:" : "Expiry Date:"} {item.expiryDate.split("T")[0]}</span>
                    </div>

                    <h2 className="text-lg font-bold text-white tracking-tight pr-20 leading-tight mb-2 truncate" title={item.medicine.name}>
                      {item.medicine.name}
                    </h2>

                    <div className="bg-black/25 border border-white/5 rounded-xl p-3 mb-4 flex justify-between items-center text-xs">
                      <div>
                        <p className="text-gray-450 uppercase tracking-widest text-[9px] font-bold">In-Stock Volume</p>
                        <p className="text-base font-bold text-white mt-0.5">{item.quantity} units</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 flex items-center justify-center">
                        <FiBox size={20} />
                      </div>
                    </div>
                  </div>

                  {/* Expiry visual progress bar */}
                  {!isExpired && (
                    <div className="space-y-1.5 mb-5 text-xs">
                      <div className="flex justify-between font-semibold text-gray-450 text-[10px] uppercase">
                        <span>Shelf Urgency:</span>
                        <span>{daysLeft > 30 ? "Safe Freshness" : "Action Required"}</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
                        <div className={`h-full ${progressColor}`} style={{ width: `${daysPercent}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 border-t border-white/5 pt-4 mt-auto">
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <FiEdit2 size={12} /> Edit
                    </button>
                    <button
                      onClick={() => handleShowDetails(item)}
                      className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <FiInfo size={12} /> Details
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="px-3 py-2 bg-rose-600/10 hover:bg-rose-600 border border-rose-500/20 hover:border-rose-500 text-rose-400 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer"
                      title="Delete Batch Record"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
                    currentPage === page 
                      ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" 
                      : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Add Stock Dialog */}
      <CustomDialog open={openAdd} onClose={() => setOpenAdd(false)} title="Register Stock Batch">
        <div className="space-y-4 text-left">
          
          <div className="relative">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Search Local Medicine
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Type brand/generic name..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition text-xs"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>

            {searchQuery && searchResults.length > 0 && (
              <ul className="absolute z-30 left-0 right-0 mt-2 bg-zinc-950 border border-white/10 rounded-xl shadow-2xl max-h-40 overflow-y-auto">
                {searchResults.map((medicine) => (
                  <li
                    key={medicine.id}
                    onClick={() => {
                      setSelectedMedicine(medicine.id);
                      setSearchQuery(medicine.name);
                      setSearchResults([]);
                    }}
                    className="p-3 text-xs text-white hover:bg-cyan-500/10 cursor-pointer border-b border-white/5 last:border-0 text-left"
                  >
                    <p className="font-bold">{medicine.name}</p>
                    <p className="text-[10px] text-gray-450 truncate mt-0.5">{medicine.composition}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Stock Quantity (Units)
            </label>
            <input
              type="number"
              placeholder="e.g. 100"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition text-xs"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Batch Expiry Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 transition text-xs"
              />
              <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setOpenAdd(false)}
              className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold transition text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="flex-grow py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg transition duration-200 transform active:scale-95 text-xs text-center"
            >
              Confirm Batch Addition
            </button>
          </div>
        </div>
      </CustomDialog>

      {/* Edit Stock Dialog */}
      <CustomDialog open={openEdit} onClose={() => setOpenEdit(false)} title="Update Stock Batch">
        <div className="space-y-4 text-left">
          
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Stock Quantity (Units)
            </label>
            <input
              type="number"
              placeholder="e.g. 150"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition text-xs"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Batch Expiry Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 transition text-xs"
              />
              <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setOpenEdit(false)}
              className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold transition text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="flex-grow py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg transition duration-200 transform active:scale-95 text-xs text-center"
            >
              Save Update
            </button>
          </div>
        </div>
      </CustomDialog>

      {/* Details Dialog */}
      <CustomDialog open={openDetails} onClose={() => setOpenDetails(false)} title="Clinical Inventory Batch Details">
        {selectedItem && (
          <div className="space-y-5 text-left">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Medicine Name</p>
              <h2 className="text-xl font-extrabold text-white leading-tight">{selectedItem.medicine.name}</h2>
            </div>

            <div className="bg-white/5 border border-white/5 p-4 rounded-xl space-y-3 text-xs leading-relaxed">
              <p>
                <strong className="text-gray-400 uppercase tracking-widest text-[9px] block mb-1">Composition:</strong> 
                <span className="text-white text-sm font-bold">{selectedItem.medicine.composition || "N/A"}</span>
              </p>
              <p className="border-t border-white/5 pt-2">
                <strong className="text-gray-400 uppercase tracking-widest text-[9px] block mb-1">Manufacturer:</strong> 
                <span className="text-white text-sm font-semibold">{selectedItem.medicine.manufacturer || "N/A"}</span>
              </p>
              <p className="border-t border-white/5 pt-2">
                <strong className="text-gray-400 uppercase tracking-widest text-[9px] block mb-1">Usage:</strong> 
                <span className="text-gray-300 text-xs">{selectedItem.medicine.usage || "N/A"}</span>
              </p>
              <p className="border-t border-white/5 pt-2">
                <strong className="text-gray-400 uppercase tracking-widest text-[9px] block mb-1">Safety Precautions:</strong> 
                <span className="text-gray-300 text-xs">{selectedItem.medicine.precautions || "N/A"}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-white/5 border border-white/5 p-3.5 rounded-xl">
                <span className="text-gray-400 block uppercase tracking-widest text-[9px] font-bold">Quantity</span>
                <span className="text-lg font-bold text-white mt-1 block">{selectedItem.quantity} units</span>
              </div>
              <div className="bg-white/5 border border-white/5 p-3.5 rounded-xl">
                <span className="text-gray-400 block uppercase tracking-widest text-[9px] font-bold">Expiry Date</span>
                <span className="text-sm font-bold text-amber-300 mt-1.5 block">{selectedItem.expiryDate.split("T")[0]}</span>
              </div>
            </div>

            <button
              onClick={() => setOpenDetails(false)}
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition text-xs mt-2"
            >
              Close Details
            </button>
          </div>
        )}
      </CustomDialog>
    </div>
  );
};

export default InventoryPage;