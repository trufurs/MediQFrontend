"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Box, Typography, List, ListItem, CircularProgress } from "@mui/material";
import axios from "axios";

const MedicinePage = () => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [loading, setLoading] = useState(false);
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    if (searchQuery) {
      setLoading(true);
      axios
        .get(`http://localhost:3000/medicine?search=${searchQuery}`)
        .then((response) => {
          setMedicines(response.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [searchQuery]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" color="primary" gutterBottom>
        Medicine Search Results for "{searchQuery}"
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : medicines.length > 0 ? (
        <List>
          {medicines.map((medicine: any) => (
            <ListItem key={medicine.id}>{medicine.name} - {medicine.usage}</ListItem>
          ))}
        </List>
      ) : (
        <Typography>No medicines found.</Typography>
      )}
    </Box>
  );
};

export default MedicinePage;
