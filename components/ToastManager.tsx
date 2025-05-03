/* eslint-disable react/display-name */
"use client";
import React, { useState, useCallback, forwardRef, useImperativeHandle } from "react";
import Toast from "./Toast";

interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error";
}

const ToastManager = forwardRef((_, ref) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Add a new toast
  const addToast = useCallback((message: string, type: "success" | "error") => {
    const id = Date.now().toString(); // Unique ID for each toast
    setToasts((prevToasts) => [ { id, message, type } , ...prevToasts ]); // Add new toast to the top of the list

    // Automatically remove the toast after 2 seconds
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, 2000);
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
    <div className="fixed top-5 right-5 md:right-10 flex flex-col gap-4 z-50">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
});

export default ToastManager;