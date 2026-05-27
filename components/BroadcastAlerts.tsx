"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiX, FiInfo, FiAlertTriangle, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

interface Announcement {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'danger';
}

const BroadcastAlerts: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    const fetchActiveAlerts = async () => {
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

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND}/admin/announcements/active`,
          { 
            headers,
            params: { role: userRole }
          }
        );
        setAnnouncements(response.data);
      } catch (err) {
        console.error("Error loading system alerts:", err);
      }
    };

    fetchActiveAlerts();
    // Poll alerts every 2 minutes
    const interval = setInterval(fetchActiveAlerts, 120000);
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = (id: string) => {
    setDismissed((prev) => [...prev, id]);
  };

  const visibleAlerts = announcements.filter((a) => !dismissed.includes(a._id));

  if (visibleAlerts.length === 0) return null;

  const styleMap = {
    info: {
      bg: "bg-blue-950/40 border-blue-500/20 text-blue-300",
      icon: <FiInfo className="text-blue-400 shrink-0 mt-0.5" size={16} />,
      glow: "shadow-[0_0_15px_rgba(59,130,246,0.15)]",
    },
    warning: {
      bg: "bg-amber-950/40 border-amber-500/20 text-amber-300",
      icon: <FiAlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={16} />,
      glow: "shadow-[0_0_15px_rgba(245,158,11,0.15)]",
    },
    success: {
      bg: "bg-emerald-950/40 border-emerald-500/20 text-emerald-300",
      icon: <FiCheckCircle className="text-emerald-400 shrink-0 mt-0.5" size={16} />,
      glow: "shadow-[0_0_15px_rgba(16,185,129,0.15)]",
    },
    danger: {
      bg: "bg-rose-950/50 border-rose-500/30 text-rose-300",
      icon: <FiAlertCircle className="text-rose-400 shrink-0 mt-0.5 animate-pulse" size={16} />,
      glow: "shadow-[0_0_20px_rgba(239,68,68,0.25)]",
    },
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-6 pt-4 space-y-3 z-40 relative">
      {visibleAlerts.map((alert) => {
        const theme = styleMap[alert.type] || styleMap.info;
        return (
          <div
            key={alert._id}
            className={`flex items-start justify-between p-4 rounded-2xl border backdrop-blur-md transition-all duration-300 animate-slide-in text-left ${theme.bg} ${theme.glow}`}
          >
            <div className="flex gap-3">
              {theme.icon}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider mb-0.5 text-white/90">
                  {alert.title}
                </h4>
                <p className="text-xs leading-relaxed opacity-90">{alert.message}</p>
              </div>
            </div>
            <button
              onClick={() => handleDismiss(alert._id)}
              className="p-1 rounded-full hover:bg-white/5 transition text-gray-400 hover:text-white shrink-0 ml-4 cursor-pointer"
            >
              <FiX size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default BroadcastAlerts;
