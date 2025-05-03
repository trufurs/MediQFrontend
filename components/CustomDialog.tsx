import React from "react";

interface CustomDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const CustomDialog: React.FC<CustomDialogProps> = ({ open, onClose, title, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center rounded-t-lg   justify-center backdrop-blur-sm bg-transparent bg-opacity-50 z-50">
      <div className="bg-white rounded-lg overflow-hidden w-full max-w-lg max-h-[90vh] shadow-xl relative">
        <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[70vh] text-gray-600">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CustomDialog;
