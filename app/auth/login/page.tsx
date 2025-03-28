"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { TextField, Button, Box, Typography, Paper } from "@mui/material";
import axios from "axios";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const { register, handleSubmit } = useForm();
  const router = useRouter();

  const onSubmit = async (data: any) => {
    try {
      console.log(data);
      const response = await axios.post("http://localhost:3000/auth/login/", data);
      console.log(response);
      localStorage.setItem("token", response.data.token); // Save token
      router.push("/"); // Redirect after login
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Paper elevation={3} sx={{ p: 4, width: 400 }}>
        <Typography variant="h5" gutterBottom>
          Login to Mediq
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField label="Email" {...register("email")} required variant="outlined" fullWidth />
          <TextField label="Password" type="password" {...register("password")} required variant="outlined" fullWidth />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Login
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;
