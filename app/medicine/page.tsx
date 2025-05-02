"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import SearchInput from "@/components/SearchInput";
import SearchOptions from "@/components/SearchOptions";
import SearchResults from "@/components/SearchResults";

export default function SearchMedicine() {
  const [query, setQuery] = useState("");
  const [movedUp, setMovedUp] = useState(false);
  const [searchSource, setSearchSource] = useState("any");
  const [filtered, setFiltered] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Loading state for search
  const [errorMessage, setErrorMessage] = useState(""); // Error message state
  const [skip, setSkip] = useState(0); // Pagination offset
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND;

  useEffect(() => {
    if (query.trim() !== "" && !movedUp) {
      setMovedUp(true);
    } else if (query.trim() === "" && movedUp) {
      setMovedUp(false);
    }
  }, [query, movedUp]);

  const handleSearch = async (reset = false) => {
    if (!query.trim() || query.length < 3) {
      setErrorMessage("Please enter at least 3 characters to search.");
      return;
    }

    setErrorMessage(""); // Clear any previous error message
    setIsLoading(true); // Start loading
    try {
      const response = await axios.get(`${backendUrl}/search/`, {
        params: {
          query,
          source: searchSource,
          limit: 10, // Limit the number of results
          skip: reset ? 0 : skip, // Use the current skip value or reset to 0
        },
      });

      setFiltered(response.data) 
    } catch (error) {
      console.error("Error fetching search results:", error);
      setFiltered([]);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSkip(0); // Reset skip for a new search
    if (value.trim().length >= 3) {
      handleSearch(true); // Trigger search and reset results
    } else if (value.trim().length === 0) {
      setErrorMessage(""); // Clear error message if input is empty
      setFiltered([]); // Clear results if input is empty
    } else {
      setErrorMessage("Please enter at least 3 characters to search.");
    }
  };

  const handleVoiceInput = (voiceQuery: string) => {
    setQuery(voiceQuery); // Update the query state with the voice input
    setSkip(0); // Reset skip for a new search
    if (voiceQuery.trim().length >= 3) {
      handleSearch(true); // Trigger search and reset results
    } else {
      setErrorMessage("Please enter at least 3 characters to search.");
    }
  };

  const loadMoreResults = () => {
    setSkip((prev) => prev + 10); // Increment skip by 10
    handleSearch(); // Fetch the next set of results
  };

  return (
    <div className="min-h-90 w-full flex flex-col items-center px-4">
      <div
        className={`w-full max-w-2xl transition-all duration-500 ${
          movedUp ? "mt-10" : "flex-grow flex items-center"
        }`}
      >
        <SearchInput
          query={query}
          onQueryChange={handleQueryChange}
          onVoiceInput={handleVoiceInput} // Pass the voice input handler
        />
        {errorMessage && (
          <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
        )}
      </div>

      {movedUp && !errorMessage && (
        <>
          <SearchOptions
            searchSource={searchSource}
            setSearchSource={setSearchSource}
          />
          <SearchResults isLoading={isLoading} filtered={filtered} />
          {filtered.length > 0 && filtered.length % 10 === 0 && (
            <button
              onClick={loadMoreResults}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              {isLoading ? "Loading..." : "Load More"}
            </button>
          )}
        </>
      )}
    </div>
  );
}