import React from "react";
import { AppBar, BottomNavigation, BottomNavigationAction, Toolbar, Typography, IconButton } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { usePathname, useRouter } from "next/navigation";
import useMediaQuery from "@mui/material/useMediaQuery";

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");

  return isMobile ? (
    // Mobile Bottom Navigation
    <BottomNavigation
      showLabels
      value={pathname}
      onChange={(_, newValue) => router.push(newValue)}
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        bgcolor: "primary.main",
      }}
    >
      <BottomNavigationAction label="Home" value="/" icon={<HomeIcon />} />
      <BottomNavigationAction label="Inventory" value="/inventory" icon={<InventoryIcon />} />
      <BottomNavigationAction label="Orders" value="/orders" icon={<ShoppingCartIcon />} />
      <BottomNavigationAction label="Login" value="/auth/login" icon={<AccountCircleIcon />} />
    </BottomNavigation>
  ) : (
    // Desktop Top Navigation
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Mediq Dashboard
        </Typography>
        <IconButton color="inherit" onClick={() => router.replace("/")}>
          <HomeIcon />
        </IconButton>
        <IconButton color="inherit" onClick={() => router.replace("/inventory")}>
          <InventoryIcon />
        </IconButton>
        <IconButton color="inherit" onClick={() => router.replace("/orders")}>
          <ShoppingCartIcon />
        </IconButton>
        <IconButton color="inherit" onClick={() => router.replace("/auth/login")}>
          <AccountCircleIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
