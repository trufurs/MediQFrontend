"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Button, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "../../utils/auth";

const HomePage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setAuthenticated(isLoggedIn());
  }, []);

  const handleSearch = () => {
    if (searchTerm.trim() !== "") {
      router.push(`/medicine?search=${searchTerm}`);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
        bgcolor: "#f5f5f5",
        p: 3,
      }}
    >
      <Typography variant="h2" sx={{ fontWeight: "bold", color: "#0d47a1", mb: 2 }}>
        Welcome to Mediq
      </Typography>
      <Typography variant="h5" sx={{ color: "#555", mb: 3 }}>
        A Smarter Way to Manage Medicine & Inventory
      </Typography>

      {/* Search Bar */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          label="Search Medicine"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 300 }}
        />
        <Button variant="contained" color="primary" onClick={handleSearch}>
          Search
        </Button>
      </Box>

      {/* Show Login/Register for guests, Inventory & Orders for logged-in users */}
      {!authenticated ? (
        <>
          <Button variant="contained" color="primary" sx={{ mb: 2, width: 200 }} onClick={() => router.push("/auth/login")}>
            Login
          </Button>
          <Button variant="outlined" color="primary" sx={{ width: 200 }} onClick={() => router.push("/auth/register")}>
            Register
          </Button>
        </>
      ) : (
        <>
          <Button variant="contained" color="secondary" sx={{ mb: 2, width: 200 }} onClick={() => router.push("/inventory")}>
            Inventory
          </Button>
          <Button variant="contained" color="secondary" sx={{ mb: 2, width: 200 }} onClick={() => router.push("/orders")}>
            Orders
          </Button>
        </>
      )}

      {/* Map Button */}
      <Button
        variant="contained"
        color="info"
        sx={{ mt: 2, width: 200 }}
        onClick={() => {
          if (authenticated) {
            router.push("/map");
          } else {
            alert("Login required to access the map.");
          }
        }}
      >
        {authenticated ? "Open Map" : "Map (Requires Login)"}
      </Button>
    </Box>
  );
};

export default HomePage;
