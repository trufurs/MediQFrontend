"use client";

import React, { createContext, useContext, useRef } from "react";
import ToastManager from "@/components/ToastManager";
import { ToastType } from "@/components/Toast";

const ToastContext = createContext<{
  showToast: (message: string, type: ToastType) => void;
}>({
  showToast: () => {
    throw new Error("showToast function must be used within a ToastProvider");
  },
});

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const toastRef = useRef<{ addToast: (message: string, type: ToastType) => void } | null>(null);

  const showToast = (message: string, type: ToastType) => {
    toastRef.current?.addToast(message, type);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      <ToastManager ref={toastRef} />
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);