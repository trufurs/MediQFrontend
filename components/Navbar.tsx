"use client";

import React, { useState, useEffect } from "react";
import { AppBar, BottomNavigation, BottomNavigationAction, Toolbar, Typography, IconButton, Box } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import MapIcon from "@mui/icons-material/Map";
import LogoutIcon from "@mui/icons-material/Logout";
import { usePathname, useRouter } from "next/navigation";
import { isLoggedIn, logout } from "../utils/auth";

const Navbar = () => {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [currentPath, setCurrentPath] = useState<string | null>(null);

  // ✅ Ensure this runs only on the client
  useEffect(() => {
    setAuthenticated(isLoggedIn());
    setCurrentPath(window.location.pathname);
  }, []);

  // ✅ Prevent Hydration Mismatch
  if (authenticated === null || currentPath === null) return null;

  const isMobile = currentPath.startsWith("/mobile");

  // ✅ Define BottomNavigation items as an array
  const bottomNavItems = [
    <BottomNavigationAction key="home" label="Home" value="/" icon={<HomeIcon />} />,
    authenticated && <BottomNavigationAction key="inventory" label="Inventory" value="/mobile/inventory" icon={<InventoryIcon />} />,
    authenticated && <BottomNavigationAction key="orders" label="Orders" value="/mobile/orders" icon={<ShoppingCartIcon />} />,
    <BottomNavigationAction
      key="map"
      label="Map"
      value="/mobile/map"
      icon={<MapIcon />}
      onClick={() => {
        if (!authenticated) {
          alert("Login required to access the map.");
        }
      }}
    />,
    !authenticated && <BottomNavigationAction key="login" label="Login" value="/auth/login" icon={<AccountCircleIcon />} />,
    !authenticated && <BottomNavigationAction key="register" label="Register" value="/auth/register" icon={<PersonAddIcon />} />,
    authenticated && <BottomNavigationAction key="logout" label="Logout" value="/mobile" icon={<LogoutIcon />} onClick={logout} />,
  ].filter(Boolean); // ✅ Removes `false` values (undefined components)

  return isMobile ? (
    <BottomNavigation
      showLabels
      value={currentPath}
      onChange={(_, newValue) => router.push(newValue)}
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        bgcolor: "primary.main",
      }}
    >
      {bottomNavItems}
    </BottomNavigation>
  ) : (
    <AppBar position="static">
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography variant="h6">Mediq Dashboard</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <IconButton color={currentPath === "/desktop" ? "secondary" : "inherit"} onClick={() => router.push("/desktop")}>
            <HomeIcon />
          </IconButton>
          {authenticated && (
            <>
              <IconButton color={currentPath === "/inventory" ? "secondary" : "inherit"} onClick={() => router.push("/inventory")}>
                <InventoryIcon />
              </IconButton>
              <IconButton color={currentPath === "/orders" ? "secondary" : "inherit"} onClick={() => router.push("/orders")}>
                <ShoppingCartIcon />
              </IconButton>
            </>
          )}
          <IconButton
            color={currentPath === "/map" ? "secondary" : "inherit"}
            onClick={() => {
              if (!authenticated) {
                alert("Login required to access the map.");
              } else {
                router.push("/map");
              }
            }}
          >
            <MapIcon />
          </IconButton>
          {!authenticated && (
            <>
              <IconButton color={currentPath === "/auth/login" ? "secondary" : "inherit"} onClick={() => router.push("/auth/login")}>
                <AccountCircleIcon />
              </IconButton>
              <IconButton color={currentPath === "/auth/register" ? "secondary" : "inherit"} onClick={() => router.push("/auth/register")}>
                <PersonAddIcon />
              </IconButton>
            </>
          )}
          {authenticated && (
            <IconButton color="error" onClick={logout}>
              <LogoutIcon />
            </IconButton>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
