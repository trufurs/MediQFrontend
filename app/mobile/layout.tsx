import React from "react";
import Navbar from "../../components/Navbar";
import { Box } from "@mui/material";

const MobileLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box sx={{ pb: 8 }}> {/* Padding to avoid bottom navbar overlap */}
      {children}
      <Navbar />
    </Box>
  );
};

export default MobileLayout;
