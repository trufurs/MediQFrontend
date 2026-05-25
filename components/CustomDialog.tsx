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
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-black/60 z-50 p-4 transition duration-300">
      <div className="bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden w-full max-w-lg max-h-[90vh] shadow-2xl relative animate-fade-in">
        <div className="sticky top-0 bg-zinc-950/85 backdrop-blur-md z-10 p-5 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-extrabold text-white tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white focus:outline-none transition rounded-full p-1 hover:bg-white/5"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[65vh] text-gray-300">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CustomDialog;
