/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { searchMedicines, addOrder } from "@/utils/management";
import { useToast } from "@/context/ToastContext";
import { FiPlus, FiTrash2, FiSearch, FiDollarSign, FiCalendar, FiPackage } from "react-icons/fi";

const AddOrderPage = () => {
  const [newOrder, setNewOrder] = useState({
    seller: "",
    remarks: "",
    items: [{ id: "", name: "", quantity: "", price: "", expiryDate: "", type: "" }],
  });
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(null);
  const router = useRouter();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index: number
  ) => {
    const { name, value } = e.target;
    const updatedItems = [...newOrder.items];
    updatedItems[index] = { ...updatedItems[index], [name]: value };
    setNewOrder({ ...newOrder, items: updatedItems });
  };

  const handleAddItem = () => {
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, { id: "", name: "", quantity: "", price: "", expiryDate: "", type: "" }],
    });
    showToast("New item added to restock invoice.", "success");
  };

  const handleRemoveItem = (index: number) => {
    if (newOrder.items.length === 1) {
      showToast("Invoice must contain at least one line item.", "error");
      return;
    }
    const updatedItems = newOrder.items.filter((_, i) => i !== index);
    setNewOrder({ ...newOrder, items: updatedItems });
    showToast("Line item removed.", "success");
  };

  const handleSearch = async (query: string, index: number) => {
    setActiveSearchIndex(index);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await searchMedicines(query);
      setSearchResults(results);
    } catch (err) {
      console.error("Error fetching search results:", err);
      setSearchResults([]);
    }
  };

  const handleSelectMedicine = (medicine: any, index: number) => {
    const updatedItems = [...newOrder.items];
    updatedItems[index] = { ...updatedItems[index], id: medicine.id, name: medicine.name };
    setNewOrder({ ...newOrder, items: updatedItems });
    setSearchQuery("");
    setSearchResults([]);
    setActiveSearchIndex(null);
    showToast(`Selected ${medicine.name}`, "success");
  };

  const handleAddOrder = async () => {
    if (!newOrder.seller.trim()) {
      showToast("Please specify the Seller/Supplier.", "error");
      return;
    }

    // Validate items
    for (let i = 0; i < newOrder.items.length; i++) {
      const item = newOrder.items[i];
      if (!item.id) {
        showToast(`Line Item #${i + 1}: Please select a medicine.`, "error");
        return;
      }
      if (!item.quantity || parseInt(item.quantity, 10) <= 0) {
        showToast(`Line Item #${i + 1}: Quantity must be positive.`, "error");
        return;
      }
      if (!item.price || parseFloat(item.price) <= 0) {
        showToast(`Line Item #${i + 1}: Price must be positive.`, "error");
        return;
      }
      if (!item.expiryDate) {
        showToast(`Line Item #${i + 1}: Expiry date is required.`, "error");
        return;
      }
      if (!item.type) {
        showToast(`Line Item #${i + 1}: Type is required.`, "error");
        return;
      }
    }

    try {
      const orderPayload = {
        seller: newOrder.seller,
        medicines: newOrder.items.map((item) => ({
          medicine_id: item.id,
          quantity: parseInt(item.quantity, 10),
          expiry: item.expiryDate,
          price: parseFloat(item.price),
          type: item.type,
        })),
        totalItems: newOrder.items.length,
        orderDate: new Date().toISOString().split("T")[0],
        remarks: newOrder.remarks,
        status: "completed",
      };

      await addOrder(orderPayload);
      showToast("B2B Restock Order submitted successfully!", "success");
      router.push("/orders");
    } catch (err) {
      console.error("Error adding order:", err);
      showToast("Failed to record restock order. Try again.", "error");
    }
  };

  // Grand total calculations
  const totals = React.useMemo(() => {
    let grandTotal = 0;
    let totalUnits = 0;
    newOrder.items.forEach((item) => {
      const qty = parseInt(item.quantity, 10) || 0;
      const price = parseFloat(item.price) || 0;
      grandTotal += qty * price;
      totalUnits += qty;
    });
    return { grandTotal, totalUnits };
  }, [newOrder.items]);

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 max-w-6xl mx-auto text-left">
      {/* Back button */}
      <button
        onClick={() => router.push("/orders")}
        className="mb-6 text-sm font-bold text-gray-400 hover:text-white transition duration-200"
      >
        ← Back to orders
      </button>

      <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-8">
        New Restock Invoice <span className="text-cyan-400 text-sm font-normal block mt-1">Record a wholesale B2B purchase restock order.</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Details & Items */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Supplier details card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest border-b border-white/5 pb-2">Supplier Details</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="seller-input" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Seller / Supplier Name
                </label>
                <input
                  type="text"
                  id="seller-input"
                  placeholder="e.g. Pfizer Wholesale, Novartis Distribution"
                  value={newOrder.seller}
                  onChange={(e) => setNewOrder({ ...newOrder, seller: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition text-sm"
                />
              </div>

              <div>
                <label htmlFor="remarks-input" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Invoice Remarks
                </label>
                <textarea
                  id="remarks-input"
                  placeholder="Reference invoice numbers, delivery notes, or special handling comments..."
                  value={newOrder.remarks}
                  onChange={(e) => setNewOrder({ ...newOrder, remarks: e.target.value })}
                  className="w-full h-20 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition text-sm"
                />
              </div>
            </div>
          </div>

          {/* Line items section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white tracking-tight">Restock Items</h2>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                <FiPlus /> Add Item
              </button>
            </div>

            {newOrder.items.map((item, index) => {
              const itemSubtotal = (parseFloat(item.price) || 0) * (parseInt(item.quantity, 10) || 0);
              
              return (
                <div
                  key={index}
                  className="bg-white/5 border border-white/10 hover:border-cyan-500/20 rounded-2xl p-6 shadow-lg transition duration-200 relative overflow-hidden"
                >
                  {/* Item index banner */}
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/5">
                    <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-lg">
                      Line Item #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-rose-400 hover:text-rose-300 transition text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <FiTrash2 /> Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Medicine Autocomplete Search */}
                    <div className="relative">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                        Search Medicine
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Type brand/generic name..."
                          value={activeSearchIndex === index ? searchQuery : item.name}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            handleInputChange(e, index);
                            handleSearch(e.target.value, index);
                          }}
                          name="name"
                          className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition text-xs"
                        />
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                      </div>

                      {activeSearchIndex === index && searchQuery && searchResults.length > 0 && (
                        <ul className="absolute z-30 left-0 right-0 mt-2 bg-zinc-950 border border-white/10 rounded-xl shadow-2xl max-h-40 overflow-y-auto">
                          {searchResults.map((medicine) => (
                            <li
                              key={medicine.id}
                              onClick={() => handleSelectMedicine(medicine, index)}
                              className="p-3 text-xs text-white hover:bg-cyan-500/10 cursor-pointer border-b border-white/5 last:border-0 text-left"
                            >
                              <p className="font-bold">{medicine.name}</p>
                              <p className="text-[10px] text-gray-450 truncate mt-0.5">{medicine.composition} • {medicine.manufacturer}</p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Stock Type (New / Renew) */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                        Purchase Type
                      </label>
                      <select
                        name="type"
                        value={item.type}
                        onChange={(e) => handleInputChange(e, index)}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 transition text-xs cursor-pointer"
                      >
                        <option className="text-black" value="">Select Type</option>
                        <option className="text-black" value="new">New Inventory Batch</option>
                        <option className="text-black" value="renew">Replenish Existing</option>
                      </select>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                        Quantity
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="quantity"
                          placeholder="0"
                          value={item.quantity}
                          onChange={(e) => handleInputChange(e, index)}
                          className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition text-xs"
                        />
                        <FiPackage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                      </div>
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                        Unit Purchase Price (₹)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          name="price"
                          placeholder="0.00"
                          value={item.price}
                          onChange={(e) => handleInputChange(e, index)}
                          className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition text-xs"
                        />
                        <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold text-sm select-none">₹</span>
                      </div>
                    </div>

                    {/* Expiry Date */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                        Batch Expiry Date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          name="expiryDate"
                          value={item.expiryDate}
                          onChange={(e) => handleInputChange(e, index)}
                          className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 transition text-xs"
                        />
                        <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                      </div>
                    </div>

                    {/* Item Subtotal display */}
                    <div className="flex items-end justify-end md:col-span-1">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-450 uppercase tracking-widest">Item Subtotal</p>
                        <p className="text-lg font-bold text-white">₹{itemSubtotal.toFixed(2)}</p>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: Invoice summary details */}
        <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl sticky top-6 space-y-6">
          <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest border-b border-white/5 pb-2">Invoice Summary</h2>
          
          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400 font-semibold">Total Line Items:</span>
              <span className="font-bold text-white">{newOrder.items.length} items</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400 font-semibold">Total Restock Units:</span>
              <span className="font-bold text-white">{totals.totalUnits} units</span>
            </div>

            <div className="h-px bg-white/5" />

            <div className="flex justify-between text-base border-t border-white/5 pt-3">
              <span className="text-gray-300 font-bold">Grand Invoice Total:</span>
              <span className="text-xl font-extrabold text-cyan-400">₹{totals.grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 pt-2">
            <button
              onClick={handleAddOrder}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg transition duration-200 transform active:scale-95 text-center text-sm"
            >
              Submit Purchase Invoice
            </button>
            <button
              onClick={() => router.push("/orders")}
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition text-center text-sm"
            >
              Discard Invoice
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AddOrderPage;