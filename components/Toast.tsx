"use client";
import React, { useEffect } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error"; // Define the type of alert
  onClose: () => void; // Callback to close the alert
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    // Automatically close the toast after 2 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 2000);

    return () => clearTimeout(timer); // Cleanup the timer on unmount
  }, [onClose]);

  return (
    <div
      className={`flex items-start gap-4 px-4 py-3 rounded-lg shadow-lg text-white transition-transform transform ${
        type === "success" ? "bg-green-500" : "bg-red-500"
      } animate-fade-in`}
      style={{ animationDuration: "0.3s" }}
    >
      {/* SVG Icon */}
      <div className="flex-shrink-0 mt-1">
        {type === "success" ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )}
      </div>

      {/* Message */}
      <div className="flex-1 text-sm font-medium break-words">
        {message}
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="text-white hover:text-gray-200 focus:outline-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

export default Toast;