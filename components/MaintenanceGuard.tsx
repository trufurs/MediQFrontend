"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import axios from "axios";
import { FiAlertTriangle, FiLoader } from "react-icons/fi";

interface Announcement {
  _id: string;
  title: string;
  message: string;
  type: string;
  isActive: boolean;
}

interface MaintenanceGuardProps {
  children: React.ReactNode;
}

const MaintenanceGuard: React.FC<MaintenanceGuardProps> = ({ children }) => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isDown, setIsDown] = useState(false);
  const [role, setRole] = useState<string>("temp");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync user role from localStorage
  useEffect(() => {
    const checkRole = () => {
      const userData = localStorage.getItem("user_data");
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          setRole(parsed.role || "temp");
        } catch {
          setRole("temp");
        }
      } else {
        setRole("temp");
      }
    };

    checkRole();

    // Listen for storage changes
    window.addEventListener("storage", checkRole);
    return () => {
      window.removeEventListener("storage", checkRole);
    };
  }, []);

  // Fetch active announcements to determine if a danger alert is live
  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const headers: Record<string, string> = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        // Get user role from local storage
        let userRole = "temp";
        const userData = localStorage.getItem("user_data");
        if (userData) {
          try {
            const parsed = JSON.parse(userData);
            userRole = parsed.role || "temp";
          } catch {}
        }

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND}/admin/announcements/active`,
          { 
            headers,
            params: { role: userRole }
          }
        );

        const activeAlerts: Announcement[] = res.data;
        const hasDangerAlert = activeAlerts.some((a) => a.type === "danger");
        setIsDown(hasDangerAlert);
      } catch (err) {
        console.error("Error checking system status:", err);
      } finally {
        setLoading(false);
      }
    };

    // Run check immediately
    checkSystemStatus();

    // Poll status frequently (every 10 seconds) for real-time response
    const interval = setInterval(checkSystemStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const isAdmin = role === "admin";
  const isExcludedPath = pathname ? (pathname === "/login" || pathname.startsWith("/admin")) : false;

  // Render original layout during SSR and first client pass to avoid hydration mismatches
  if (!mounted) {
    return <>{children}</>;
  }

  // If a danger alert is active and the user is NOT an admin on an excluded path, block access
  if (isDown && !isAdmin && !isExcludedPath) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#09090b] text-white p-6 overflow-hidden">
        {/* Futuristic glowing grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        {/* Soft Radial Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />

        <div className="relative max-w-lg w-full text-center space-y-8 z-10 px-4">
          {/* Animated Hazard Shield */}
          <div className="mx-auto w-24 h-24 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.2)] animate-bounce duration-1000">
            <FiAlertTriangle className="text-red-500 text-5xl animate-pulse" />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
              System Maintenance
            </h1>
            <p className="text-xs uppercase tracking-widest text-red-400 font-extrabold">
              Server Temporarily Offline
            </p>
          </div>

          {/* Glassmorphic message container */}
          <div className="p-6 bg-white/[0.02] border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl space-y-4">
            <p className="text-zinc-300 text-sm leading-relaxed">
              We are currently fixing a critical issue and performing urgent maintenance to restore the system to optimal performance.
            </p>
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <p className="text-zinc-400 text-xs italic">
              Please do not refresh the page. The system will automatically reconnect and reload your page as soon as operations resume.
            </p>
          </div>

          {/* Pulse reconnection status */}
          <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 font-medium">
            <FiLoader className="animate-spin text-red-500" />
            <span>Automatic reconnection in progress...</span>
          </div>
        </div>
      </div>
    );
  }

  // Normal flow
  return <>{children}</>;
};

export default MaintenanceGuard;
