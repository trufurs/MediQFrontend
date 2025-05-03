/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { searchMedicines, addOrder } from "@/utils/management";
import { useToast } from "@/context/ToastContext";

const AddOrderPage = () => {
  const [newOrder, setNewOrder] = useState({
    seller: "",
    remarks: "",
    items: [{ id: "", name: "", quantity: "", price: "", expiryDate: "", type: "" }],
  });
    const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
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
    showToast("New item added successfully.", "success"); // Success toast
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = newOrder.items.filter((_, i) => i !== index);
    setNewOrder({ ...newOrder, items: updatedItems });
    showToast("Item removed successfully.", "success"); // Success toast
  };

  const handleSearch = async (query: string) => {
    try {
      const results = await searchMedicines(query);
      setSearchResults(results);
    } catch (err) {
      console.error("Error fetching search results:", err);
      setSearchResults([]);
      showToast("Failed to fetch search results. Please try again.", "error"); // Error toast
    }
  };

  const handleSelectMedicine = (medicine: any, index: number) => {
    const updatedItems = [...newOrder.items];
    updatedItems[index] = { ...updatedItems[index], id: medicine.id, name: medicine.name };
    setNewOrder({ ...newOrder, items: updatedItems });
    setSearchQuery(""); // Clear the search query
    setSearchResults([]); // Clear the search results
  };

  const handleAddOrder = async () => {
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
      };

      await addOrder(orderPayload);
      showToast("Order added successfully!", "success");
      router.push("/orders");
    } catch (err) {
      console.error("Error adding order:", err);
      showToast("Failed to add order. Please try again.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Add New Order</h1>
        <div className="space-y-4">
        <input
          type="text"
          placeholder="Seller"
          value={newOrder.seller}
          onChange={(e) => setNewOrder({ ...newOrder, seller: e.target.value })}
          className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-gray-400"
        />
        <textarea
          placeholder="Remarks"
          value={newOrder.remarks}
          onChange={(e) => setNewOrder({ ...newOrder, remarks: e.target.value })}
          className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-gray-400"
        />
        <h3 className="text-md font-semibold mb-2">Items</h3>
        {newOrder.items.map((item, index) => (
          <div key={index} className="mb-4">
            <input
              type="text"
              name="name"
              placeholder="Search Medicine"
              value={item.name}
              onChange={(e) => {
                handleInputChange(e, index);
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              className="w-full mb-2 p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-gray-400"
            />
            {searchQuery && searchResults.length > 0 && (
              <ul className="bg-gray-800 border border-gray-600 rounded-md max-h-40 overflow-y-auto">
                {searchResults.map((medicine) => (
                  <li
                    key={medicine.id}
                    onClick={() => handleSelectMedicine(medicine, index)}
                    className="p-2 hover:bg-gray-700 cursor-pointer"
                  >
                    {medicine.name}
                  </li>
                ))}
              </ul>
            )}
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
            onClick={() => router.push("/orders")}
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
  );
};

export default AddOrderPage;