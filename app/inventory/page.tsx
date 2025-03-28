"use client";

import React, { useEffect, useState } from "react";
import { Box, Typography, Fab, Dialog, DialogTitle, DialogContent, TextField, Button, CircularProgress } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";

// ✅ Define Medicine Type
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

const InventoryPage = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [quantity, setQuantity] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [medicine, setMedicine] = useState("");

  const API_URL = "http://localhost:3000/inventory/";

  // ✅ Fetch Inventory Data with Bearer Token
  useEffect(() => {
    const token = localStorage.getItem("token"); // Get token from localStorage
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

  // ✅ Open Edit Dialog
  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setQuantity(item.quantity.toString());
    setExpiryDate(item.expiryDate.split("T")[0]); // Remove timestamp
    setOpenEdit(true);
  };

  // ✅ Update Inventory Item
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

  // ✅ Add New Inventory Item
  const handleAdd = async () => {
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        API_URL,
        { medicine, quantity: Number(quantity), expiryDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Inventory added successfully!");
      setOpenAdd(false);
      window.location.reload();
    } catch (error) {
      console.error("Error adding inventory:", error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Inventory Management
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        inventory.map((item) => (
          <Box key={item._id} sx={{ border: "1px solid #ccc", borderRadius: 2, p: 2, mb: 2 }}>
            <Typography variant="h6">{item.medicine.name}</Typography>
            <Typography>Composition: {item.medicine.composition}</Typography>
            <Typography>Manufacturer: {item.medicine.manufacturer}</Typography>
            <Typography>Usage: {item.medicine.usage}</Typography>
            <Typography>Precautions: {item.medicine.precautions}</Typography>
            <Typography>Quantity: {item.quantity}</Typography>
            <Typography>Expiry Date: {item.expiryDate.split("T")[0]}</Typography>
            <Button variant="outlined" color="primary" onClick={() => handleEdit(item)}>
              Edit
            </Button>
          </Box>
        ))
      )}

      {/* ✅ Floating Add Button */}
      <Fab color="primary" sx={{ position: "fixed", bottom: 16, right: 16 }} onClick={() => setOpenAdd(true)}>
        <AddIcon />
      </Fab>

      {/* ✅ Add Inventory Dialog */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)}>
        <DialogTitle>Add Inventory</DialogTitle>
        <DialogContent>
          <TextField label="Medicine ID" fullWidth value={medicine} onChange={(e) => setMedicine(e.target.value)} sx={{ my: 2 }} />
          <TextField label="Quantity" fullWidth value={quantity} onChange={(e) => setQuantity(e.target.value)} sx={{ my: 2 }} />
          <TextField label="Expiry Date" type="date" fullWidth value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} sx={{ my: 2 }} />
          <Button variant="contained" color="primary" fullWidth onClick={handleAdd}>
            Add Inventory
          </Button>
        </DialogContent>
      </Dialog>

      {/* ✅ Update Inventory Dialog */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
        <DialogTitle>Edit Inventory</DialogTitle>
        <DialogContent>
          <TextField label="Quantity" fullWidth value={quantity} onChange={(e) => setQuantity(e.target.value)} sx={{ my: 2 }} />
          <TextField label="Expiry Date" type="date" fullWidth value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} sx={{ my: 2 }} />
          <Button variant="contained" color="primary" fullWidth onClick={handleUpdate}>
            Update
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default InventoryPage;
