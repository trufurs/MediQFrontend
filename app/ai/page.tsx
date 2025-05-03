import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GAPI});

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: "Explain how AI works in a few words",
  });
  console.log(response.text);
}

import React from 'react'

export default function AI() {
    if(typeof window !== "undefined"){ 
    main()
    } 
  return (
    
    <div>
    <h1 className="text-4xl font-bold mb-6 text-blue-600 text-left">AI</h1>
    <p className="text-lg">This is a page for AI related content.</p>
    <p className="text-gray-600 italic">Page under construction. More content coming soon!</p>
    </div>
  )
}


/*
"use client";
import React from "react";
import dynamic from "next/dynamic";
const ToastManager = dynamic(() => import("@/components/ToastManager"), { ssr: false });

const ExamplePage = () => {
  const toastRef = React.useRef<{ addToast: (message: string, type: string) => void } | null>(null);

  const showSuccess = () => {
    toastRef.current?.addToast("Operation completed successfully!", "success");
  };

  const showError = () => {
    toastRef.current?.addToast("An error occurred. Please try again.", "error");
  };

  return (
    <div className="p-6">
      <button
        onClick={showSuccess}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Show Success
      </button>
      <button
        onClick={showError}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 ml-4"
      >
        Show Error
      </button>

      <ToastManager ref={toastRef} />
    </div>
  );
};

export default ExamplePage;

*/