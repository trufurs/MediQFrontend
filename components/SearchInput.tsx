/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { FiMic } from "react-icons/fi";

interface SearchInputProps {
  query: string;
  onQueryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVoiceInput: (voiceQuery: string) => void; // Callback for voice input
}

const SearchInput: React.FC<SearchInputProps> = ({ query, onQueryChange, onVoiceInput }) => {
  const [isListening, setIsListening] = useState(false); // State to track if voice recognition is active
  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support voice recognition.");
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onVoiceInput(transcript); // Pass the recognized text to the parent component
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
    alert(
      event.error === "network"
        ? "Network error: Please check your internet connection."
        : "An error occurred during voice recognition. Please try again."
    );
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder="Search medicine..."
        value={query}
        onChange={onQueryChange}
        className="w-full border rounded-full px-5 py-3 pr-12 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow"
      />
      <FiMic
        className={`absolute top-1/2 right-4 transform -translate-y-1/2 cursor-pointer ${
          isListening ? "text-blue-500 animate-pulse" : "text-gray-400"
        }`}
        size={22}
        onClick={handleVoiceInput} // Trigger voice recognition
      />
    </div>
  );
};

export default SearchInput;