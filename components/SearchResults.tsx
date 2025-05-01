import React from "react";
import Image from "next/image";
import LoaderSVG from "@/components/LoaderSVG";

interface SearchResultsProps {
  isLoading: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filtered: any; // Updated type for search results
}

const SearchResults: React.FC<SearchResultsProps> = ({ isLoading, filtered }) => {

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <LoaderSVG />
      </div>
    );
  }

  if (filtered.length > 0) {
    return (
      <div className="w-full max-w-2xl mt-6 space-y-3">
        {filtered.map((med: { id: number; name: string; manufacturer: string }) => (
          <div
            onClick={() => window.location.replace(`/medicine/${med.id}`)} // Navigate to the medicine details page
            key={med.id}
            className="w-full border border-gray-300 rounded-lg px-6 py-4 text-lg shadow hover:shadow-md cursor-pointer transition"
          >
            <p className="font-bold">{med.name}</p>
            <p className="text-sm text-gray-600">Manufacturer: {med.manufacturer}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mt-6 text-center">
      <Image
        src="/no-results.png"
        alt="No results"
        width={200}
        height={200}
        className="mx-auto mb-2"
      />
      <p className="text-lg">No results found</p>
    </div>
  );
};

export default SearchResults;