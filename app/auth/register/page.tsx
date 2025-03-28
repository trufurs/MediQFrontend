"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { TextField, Button, Box, Typography, Paper } from "@mui/material";
import axios from "axios";
import { useRouter } from "next/navigation";

const RegisterPage = () => {
  const { register, handleSubmit } = useForm();
  const router = useRouter();

  const onSubmit = async (data: any) => {
    try {
      const response = await axios.post("http://localhost:3000/auth/register", data);
      console.log("Registration successful", response.data);
      router.push("/auth/login"); // Redirect to login page
    } catch (error) {
      console.error("Registration failed", error);
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Paper elevation={3} sx={{ p: 4, width: 400 }}>
        <Typography variant="h5" gutterBottom>
          Create an Account
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField label="Name" {...register("name")} required variant="outlined" fullWidth />
          <TextField label="Email" {...register("email")} required variant="outlined" fullWidth />
          <TextField label="Gender" {...register("gender")} required variant="outlined" fullWidth />
          <TextField label="Password" type="password" {...register("password")} required variant="outlined" fullWidth />
          <TextField label="Phone" {...register("phone")} required variant="outlined" fullWidth />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Register
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default RegisterPage;
