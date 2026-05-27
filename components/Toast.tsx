"use client";
import React, { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const toastConfig: Record<
  ToastType,
  { bg: string; border: string; progress: string; icon: React.ReactNode }
> = {
  success: {
    bg: "bg-gradient-to-r from-emerald-900/95 to-emerald-800/95",
    border: "border-emerald-500/30",
    progress: "bg-emerald-400",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  error: {
    bg: "bg-gradient-to-r from-rose-900/95 to-rose-800/95",
    border: "border-rose-500/30",
    progress: "bg-rose-400",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  info: {
    bg: "bg-gradient-to-r from-blue-900/95 to-blue-800/95",
    border: "border-blue-500/30",
    progress: "bg-blue-400",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  warning: {
    bg: "bg-gradient-to-r from-amber-900/95 to-amber-800/95",
    border: "border-amber-500/30",
    progress: "bg-amber-400",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
};

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3500 }) => {
  const [progress, setProgress] = useState(100);
  const [visible, setVisible] = useState(false);

  // Slide-in animation
  useEffect(() => {
    const enterTimer = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(enterTimer);
  }, []);

  // Progress bar countdown
  useEffect(() => {
    const interval = 50; // update every 50ms
    const steps = duration / interval;
    const decrement = 100 / steps;

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(progressTimer);
          return 0;
        }
        return prev - decrement;
      });
    }, interval);

    return () => clearInterval(progressTimer);
  }, [duration]);

  // Auto-close
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // wait for slide-out animation
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const config = toastConfig[type];

  return (
    <div
      className={`
        relative flex items-start gap-3 pl-4 pr-3 pt-3 pb-4 rounded-xl shadow-2xl
        border backdrop-blur-xl text-white overflow-hidden
        transition-all duration-300 ease-out min-w-[300px] max-w-[380px]
        ${config.bg} ${config.border}
        ${visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      `}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">{config.icon}</div>

      {/* Message */}
      <div className="flex-1 text-sm font-medium leading-relaxed pr-2 break-words">
        {message}
      </div>

      {/* Close Button */}
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 300);
        }}
        className="flex-shrink-0 p-1 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 rounded-b-xl overflow-hidden">
        <div
          className={`h-full transition-none ${config.progress}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default Toast;