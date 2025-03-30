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
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-transparent bg-opacity-50 z-50">
      <div className="bg-white rounded-lg w-96 p-6 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 px-3 py-1 bg-gray-500 text-white rounded-full hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          X
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
        <div className="text-gray-600">{children}</div>
      </div>
    </div>
  );
};

export default CustomDialog;
