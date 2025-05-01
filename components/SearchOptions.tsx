import React from "react";

interface SearchOptionsProps {
  searchSource: string;
  setSearchSource: (source: string) => void;
}

const SearchOptions: React.FC<SearchOptionsProps> = ({
  searchSource,
  setSearchSource,
}) => {
  const options = ["mediq", "openFda", "any"];

  return (
    <div className="w-full max-w-2xl mt-4 flex justify-start space-x-4">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => setSearchSource(option)}
          className={`px-4 py-2 rounded-md text-white ${
            searchSource === option ? "bg-blue-600" : "bg-gray-600"
          } hover:bg-blue-700 transition`}
        >
          {option.charAt(0).toUpperCase() + option.slice(1)}
        </button>
      ))}
    </div>
  );
};

export default SearchOptions;