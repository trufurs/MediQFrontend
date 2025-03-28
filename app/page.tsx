"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useMediaQuery from "@mui/material/useMediaQuery";

const HomePage = () => {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    router.replace(isMobile ? "/mobile" : "/desktop");
  }, [isMobile, router]);

  return null; // No UI, just redirect
};

export default HomePage;
