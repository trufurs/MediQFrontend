"use client";

import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Fab, Dialog, DialogTitle, DialogContent, TextField, CircularProgress } from "@mui/material";
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

// ✅ Define MedicineItem Type (inside Order)
interface MedicineItem {
  _id: string;
  medicine_id: Medicine;
  quantity: number;
  expiry: string;
  price: number;
  type: string;
}

// ✅ Define Order Type
interface Order {
  _id: string;
  store: string;
  seller: string;
  medicines: MedicineItem[];
  totalItems: number;
  status: string;
  orderDate: string;
  createdAt: string;
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [seller, setSeller] = useState("");
  const [medicines, setMedicines] = useState("");
  const [remarks, setRemarks] = useState("");

  const API_URL = "http://localhost:3000/order/";

  // ✅ Fetch Orders Data with Bearer Token
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(API_URL, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        setOrders(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
        setLoading(false);
      });
  }, []);

  // ✅ Place a New Order
  const handlePlaceOrder = async () => {
    const medicinesArray = medicines.split(",").map((med) => ({
      medicine_id: med.trim(),
      quantity: 1,
      expiry: "2024-12-31",
      price: 5.99,
      type: "new",
    }));

    const token = localStorage.getItem("token");
    try {
      await axios.post(
        API_URL,
        { seller, medicines: medicinesArray, totalItems: medicinesArray.length, orderDate: new Date().toISOString().split("T")[0], remarks },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Order placed successfully!");
      setOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Error placing order:", error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Orders Management
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        orders.map((order) => (
          <Box key={order._id} sx={{ border: "1px solid #ccc", borderRadius: 2, p: 2, mb: 2 }}>
            <Typography variant="h6">Seller: {order.seller}</Typography>
            <Typography>Status: {order.status}</Typography>
            <Typography>Total Items: {order.totalItems}</Typography>
            <Typography>Order Date: {new Date(order.orderDate).toDateString()}</Typography>
            <Typography>Medicines:</Typography>
            <ul>
              {order.medicines.map((med) => (
                <li key={med._id}>
                  <strong>{med.medicine_id.name}</strong> - {med.quantity} units (Expiry: {new Date(med.expiry).toDateString()}, ${med.price.toFixed(2)})  
                  <br />
                  <em>{med.medicine_id.composition}</em>
                  <br />
                  <small>{med.medicine_id.usage}</small>
                </li>
              ))}
            </ul>
          </Box>
        ))
      )}

      {/* ✅ Floating Add Button */}
      <Fab color="primary" sx={{ position: "fixed", bottom: 16, right: 16 }} onClick={() => setOpen(true)}>
        <AddIcon />
      </Fab>

      {/* ✅ Order Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Place a New Order</DialogTitle>
        <DialogContent>
          <TextField label="Seller Name" fullWidth value={seller} onChange={(e) => setSeller(e.target.value)} sx={{ my: 2 }} />
          <TextField label="Medicine IDs (comma separated)" fullWidth value={medicines} onChange={(e) => setMedicines(e.target.value)} sx={{ my: 2 }} />
          <TextField label="Remarks" fullWidth value={remarks} onChange={(e) => setRemarks(e.target.value)} sx={{ my: 2 }} />
          <Button variant="contained" color="primary" fullWidth onClick={handlePlaceOrder}>
            Place Order
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default OrdersPage;
