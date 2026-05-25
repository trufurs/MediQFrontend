/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { FiMic } from "react-icons/fi";
import { BiSearch } from "react-icons/bi";

interface SearchInputProps {
  query: string;
  onQueryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVoiceInput: (voiceQuery: string) => void;
  onSuggestionSelect?: (val: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({
  query,
  onQueryChange,
  onVoiceInput,
  onSuggestionSelect,
}) => {
  const [isListening, setIsListening] = useState(false);

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
      onVoiceInput(transcript);
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

  const popularMeds = ["Paracetamol", "Aspirin", "Ibuprofen", "Amoxicillin", "Lipitor"];

  return (
    <div className="w-full space-y-3">
      <div className="relative w-full group">
        {/* Shifting Glow highlight */}
        <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 rounded-full opacity-20 group-focus-within:opacity-75 blur-md transition duration-500 -z-10" />
        
        <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition duration-300">
          <BiSearch size={22} />
        </div>

        <input
          type="text"
          placeholder="Search by brand name or generic chemical composition..."
          value={query}
          onChange={onQueryChange}
          className="w-full bg-zinc-950/90 backdrop-blur-xl border border-white/10 rounded-full pl-13 pr-13 py-4 text-white text-base focus:outline-none focus:border-cyan-500/50 shadow-2xl transition duration-300 placeholder-gray-500"
        />

        <button
          type="button"
          onClick={handleVoiceInput}
          className={`absolute right-5 top-1/2 transform -translate-y-1/2 p-2 rounded-full hover:bg-white/5 transition focus:outline-none ${
            isListening ? "text-cyan-400 animate-pulse bg-cyan-500/10" : "text-gray-400 hover:text-white"
          }`}
          title="Voice Search"
        >
          <FiMic size={18} />
        </button>
      </div>

      {/* Suggestion Chips */}
      {onSuggestionSelect && (
        <div className="flex flex-wrap items-center gap-2 pl-4 text-left">
          <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider mr-1">Popular:</span>
          {popularMeds.map((med) => (
            <button
              key={med}
              type="button"
              onClick={() => onSuggestionSelect(med)}
              className="px-3.5 py-1 bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 text-gray-400 hover:text-cyan-400 text-xs font-medium rounded-full cursor-pointer transition duration-200"
            >
              {med}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchInput;