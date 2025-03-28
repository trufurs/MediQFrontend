import React from "react";
import Navbar from "../../components/Navbar";
import { Box } from "@mui/material";

const DesktopLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box>
      <Navbar />
      {children}
    </Box>
  );
};

export default DesktopLayout;

