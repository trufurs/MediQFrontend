#!/bin/bash
# Exit on any error
set -e

echo "🚀 Creating additional pages for Auth, Inventory, and Orders..."

# 1. Create folders for auth, inventory, and orders under app/
mkdir -p app/auth app/inventory app/orders

# 2. Create the Login Page at app/auth/login/page.tsx
cat << 'EOF' > app/auth/login/page.tsx
"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import LoginForm from "../../../components/client/LoginForm";

const LoginPage = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center", color: "primary.main" }}>
        Login
      </Typography>
      <LoginForm />
    </Box>
  );
};

export default LoginPage;
EOF

# 3. Create the Register Page at app/auth/register/page.tsx
cat << 'EOF' > app/auth/register/page.tsx
"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import RegisterForm from "../../../components/client/RegisterForm";

const RegisterPage = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center", color: "primary.main" }}>
        Register
      </Typography>
      <RegisterForm />
    </Box>
  );
};

export default RegisterPage;
EOF

# 4. Create the Inventory Management Page at app/inventory/page.tsx
cat << 'EOF' > app/inventory/page.tsx
import React from "react";
import { Box, Typography } from "@mui/material";

const InventoryPage = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center", color: "primary.main" }}>
        Inventory Management
      </Typography>
      <Typography variant="body1" align="center">
        Inventory details and forms will be displayed here.
      </Typography>
    </Box>
  );
};

export default InventoryPage;
EOF

# 5. Create the Orders Management Page at app/orders/page.tsx
cat << 'EOF' > app/orders/page.tsx
import React from "react";
import { Box, Typography } from "@mui/material";

const OrdersPage = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center", color: "primary.main" }}>
        Orders Management
      </Typography>
      <Typography variant="body1" align="center">
        Order details and management tools will be displayed here.
      </Typography>
    </Box>
  );
};

export default OrdersPage;
EOF

echo "✅ Additional pages created!"
