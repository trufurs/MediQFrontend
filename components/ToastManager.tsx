/* eslint-disable react/display-name */
"use client";
import React, { useState, useCallback, forwardRef, useImperativeHandle } from "react";
import Toast, { ToastType } from "./Toast";

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

const ToastManager = forwardRef((_, ref) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Add a new toast
  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts((prevToasts) => [{ id, message, type }, ...prevToasts]);

    // Automatically remove the toast after 3.8 seconds (slightly after animation finishes)
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, 3800);
  }, []);

  // Expose the `addToast` method via the ref
  useImperativeHandle(ref, () => ({
    addToast,
  }));

  // Remove a toast manually
  const removeToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <div className="fixed top-5 right-5 md:right-6 flex flex-col gap-3 z-[9999] pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
            duration={3500}
          />
        </div>
      ))}
    </div>
  );
});

export default ToastManager;