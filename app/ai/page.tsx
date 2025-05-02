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
