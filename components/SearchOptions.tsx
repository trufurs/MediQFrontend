import React from "react";
import { FiDatabase, FiGlobe, FiLayers } from "react-icons/fi";

interface SearchOptionsProps {
  searchSource: string;
  setSearchSource: (source: string) => void;
}

const SearchOptions: React.FC<SearchOptionsProps> = ({
  searchSource,
  setSearchSource,
}) => {
  const options = [
    { value: "mediq", label: "Local Library", sub: "MediQ", icon: <FiDatabase className="mr-2" size={14} /> },
    { value: "openfda", label: "Global Database", sub: "openFDA", icon: <FiGlobe className="mr-2" size={14} /> },
    { value: "any", label: "Search Both", sub: "Combined", icon: <FiLayers className="mr-2" size={14} /> },
  ];

  return (
    <div className="w-full max-w-2xl mt-6 flex flex-wrap justify-start gap-3.5 text-left">
      {options.map((option) => {
        const isSelected = searchSource.toLowerCase() === option.value.toLowerCase();
        return (
          <button
            key={option.value}
            onClick={() => setSearchSource(option.value)}
            className={`flex items-center px-5 py-3 rounded-2xl text-xs font-bold tracking-wide uppercase border cursor-pointer transition duration-300 transform active:scale-95 ${
              isSelected
                ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-lg shadow-cyan-500/5"
                : "bg-white/5 border-white/10 hover:border-white/20 text-gray-400 hover:text-white"
            }`}
          >
            {option.icon}
            <div className="flex flex-col text-left">
              <span>{option.label}</span>
              <span className="text-[9px] font-medium opacity-50 -mt-0.5">{option.sub}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default SearchOptions;