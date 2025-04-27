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
    
    <div>AI</div>
  )
}
