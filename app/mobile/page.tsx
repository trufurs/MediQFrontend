import React from "react";
import { Box, Typography } from "@mui/material";

const MobileHome = () => {
  return (
    <Box sx={{ textAlign: "center", p: 3 }}>
      <Typography variant="h4" color="primary">
        Welcome to Mediq (Mobile)
      </Typography>
      <Typography variant="body1">Manage your medicine & orders easily.</Typography>
    </Box>
  );
};

export default MobileHome;
