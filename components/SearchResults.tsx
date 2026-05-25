import React from "react";
import Link from "next/link";

interface SearchResultsProps {
  isLoading: boolean;
  filtered: any;
  onSuggestionClick?: (val: string) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ isLoading, filtered, onSuggestionClick }) => {
  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mt-8 space-y-4 text-left">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-white/5 border border-white/10 rounded-2xl px-6 py-5 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-6 bg-white/10 rounded-lg w-1/2"></div>
              <div className="h-5 bg-white/10 rounded-full w-20"></div>
            </div>
            <div className="h-4 bg-white/10 rounded-lg w-1/3"></div>
            <div className="h-4 bg-white/10 rounded-lg w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (filtered && filtered.length > 0) {
    return (
      <div className="w-full max-w-2xl mt-8 space-y-4 text-left">
        {filtered.map((med: { id: string; name: string; manufacturer: string; composition?: string }) => {
          const isOpenFda = med.id.startsWith("openfda-");
          
          return (
            <Link
              href={`/medicine/${med.id}`}
              key={med.id}
              className="block group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 rounded-2xl px-6 py-5 shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-0.5 relative overflow-hidden"
            >
              {/* Radial gradient background highlight on hover */}
              <div className="absolute inset-0 bg-radial-gradient from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none" />
              
              <div className="flex justify-between items-start gap-4 relative z-10">
                <div className="flex gap-4 max-w-[80%]">
                  {/* Decorative Medicine Pill Icon */}
                  <div className="flex-shrink-0 mt-1 w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4.5 12.75l7.5-7.5c2.071-2.071 5.429-2.071 7.5 0s2.071 5.429 0 7.5l-7.5 7.5c-2.071 2.071-5.429 2.071-7.5 0s-2.071-5.429 0-7.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8.5 8.75l6.75 6.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-extrabold text-white text-lg tracking-tight group-hover:text-cyan-400 transition leading-tight">
                      {med.name}
                    </h3>
                    <p className="text-gray-400 text-sm font-medium">
                      Manufacturer: <span className="text-gray-250 font-semibold">{med.manufacturer || "Unknown"}</span>
                    </p>
                    {med.composition && (
                      <p className="text-gray-450 text-xs italic mt-2 line-clamp-2 bg-black/20 p-2 rounded-lg border border-white/5">
                        Composition: {med.composition}
                      </p>
                    )}
                  </div>
                </div>

                {/* Source Badge */}
                <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold border tracking-wider uppercase ${
                  isOpenFda
                    ? "bg-purple-500/10 border-purple-500/30 text-purple-400"
                    : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                }`}>
                  {isOpenFda ? "openFDA" : "MediQ"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    );
  }

  const popularMeds = ["Paracetamol", "Aspirin", "Ibuprofen", "Amoxicillin", "Lipitor"];

  return (
    <div className="w-full max-w-2xl mt-10 text-center py-12 bg-white/5 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl">
      <div className="text-6xl mb-4 animate-bounce">🔍</div>
      <p className="text-xl text-white font-extrabold">No medications found matching your criteria</p>
      <p className="text-sm text-gray-400 mt-1.5 max-w-md mx-auto leading-relaxed">
        Try entering a different brand name or generic chemical formula.
      </p>
      {onSuggestionClick && (
        <div className="mt-6">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Suggested Quick Searches:</p>
          <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
            {popularMeds.map((med) => (
              <button
                key={med}
                onClick={() => onSuggestionClick(med)}
                className="px-3.5 py-1.5 bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 text-gray-300 hover:text-cyan-400 text-xs font-semibold rounded-full cursor-pointer transition duration-200"
              >
                {med}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;