"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import SearchInput from "@/components/SearchInput";
import SearchOptions from "@/components/SearchOptions";
import SearchResults from "@/components/SearchResults";
import { useToast } from "@/context/ToastContext";

export default function SearchMedicine() {
  const [query, setQuery] = useState("");
  const [movedUp, setMovedUp] = useState(false);
  const [searchSource, setSearchSource] = useState("any");
  const [filtered, setFiltered] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [skip, setSkip] = useState(0);
  const { showToast } = useToast();
  
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND;

  // Auto-trigger search from query parameters (e.g. from customer portal)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlQuery = params.get("q") || params.get("query");
      if (urlQuery && urlQuery.trim().length >= 3) {
        setQuery(urlQuery);
        setMovedUp(true);
        executeSearch(urlQuery, true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync movedUp state based on query content
  useEffect(() => {
    if (query.trim() !== "" && !movedUp) {
      setMovedUp(true);
    } else if (query.trim() === "" && movedUp) {
      setMovedUp(false);
      setFiltered([]);
      setErrorMessage("");
    }
  }, [query, movedUp]);

  const executeSearch = async (qValue: string, reset = false) => {
    const activeQuery = qValue || query;
    if (!activeQuery.trim() || activeQuery.length < 3) {
      setErrorMessage("Please enter at least 3 characters to search.");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/search/`, {
        params: {
          query: activeQuery,
          source: searchSource,
          limit: 10,
          skip: reset ? 0 : skip,
        },
      });

      setFiltered(response.data);
    } catch (error) {
      console.error("Error fetching search results:", error);
      showToast("Error fetching search results", "error");
      setFiltered([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    executeSearch(query, false);
  };

  // Re-run search if source changes
  useEffect(() => {
    if (query.trim().length >= 3) {
      executeSearch(query, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchSource]);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSkip(0);

    if (value.trim().length >= 3) {
      // Debounced or direct call
      executeSearch(value, true);
    } else if (value.trim().length === 0) {
      setErrorMessage("");
      setFiltered([]);
    } else {
      setErrorMessage("Please enter at least 3 characters to search.");
    }
  };

  const handleVoiceInput = (voiceQuery: string) => {
    setQuery(voiceQuery);
    setSkip(0);
    if (voiceQuery.trim().length >= 3) {
      executeSearch(voiceQuery, true);
    } else {
      setErrorMessage("Please enter at least 3 characters to search.");
    }
  };

  const loadMoreResults = () => {
    const newSkip = skip + 10;
    setSkip(newSkip);
    // Directly fetch next skip
    setIsLoading(true);
    axios.get(`${backendUrl}/search/`, {
      params: {
        query,
        source: searchSource,
        limit: 10,
        skip: newSkip,
      },
    })
    .then((res) => {
      setFiltered((prev) => [...prev, ...res.data]);
    })
    .catch((err) => {
      console.error(err);
      showToast("Failed to load more results", "error");
    })
    .finally(() => {
      setIsLoading(false);
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-12 flex flex-col items-center min-h-[80vh]">
      
      {/* Search Header Banner */}
      <div className={`transition-all duration-500 w-full ${
        movedUp 
          ? "opacity-100 mb-6 flex flex-row items-center justify-between border-b border-white/10 pb-4 text-left" 
          : "opacity-100 mb-10 flex flex-col items-center text-center max-w-xl"
      }`}>
        {movedUp ? (
          <>
            <div className="flex items-center space-x-3 text-left">
              <span className="text-3xl">💊</span>
              <div>
                <h1 className="text-xl font-extrabold text-white tracking-tight">Medicine Library</h1>
                <p className="text-gray-400 text-[11px]">Compare chemical formulas, precautions, and FDA logs.</p>
              </div>
            </div>
            <button
              onClick={() => {
                setQuery("");
                setFiltered([]);
                setMovedUp(false);
                setErrorMessage("");
              }}
              className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold rounded-xl text-gray-400 hover:text-white transition duration-200"
            >
              Clear Search
            </button>
          </>
        ) : (
          <>
            <div className="text-5xl mb-4">💊</div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight leading-none">
              Medicine Library
            </h1>
            <p className="text-gray-400 text-sm mt-4 leading-relaxed">
              Locate medications, review generic chemical formulas, clinical precautions, active ingredients, and OpenFDA information records.
            </p>
          </>
        )}
      </div>

      {/* Input container */}
      <div className="w-full transition-all duration-500">
        <SearchInput
          query={query}
          onQueryChange={handleQueryChange}
          onVoiceInput={handleVoiceInput}
          onSuggestionSelect={(val) => {
            setQuery(val);
            setSkip(0);
            executeSearch(val, true);
          }}
        />
        {errorMessage && (
          <p className="text-red-400 text-xs font-medium text-left mt-2.5 ml-4">{errorMessage}</p>
        )}
      </div>

      {/* Options & Results */}
      {movedUp && !errorMessage && (
        <div className="w-full flex flex-col items-center animate-fade-in">
          <SearchOptions
            searchSource={searchSource}
            setSearchSource={setSearchSource}
          />
          <SearchResults 
            isLoading={isLoading} 
            filtered={filtered} 
            onSuggestionClick={(val) => {
              setQuery(val);
              setSkip(0);
              executeSearch(val, true);
            }}
          />
          
          {filtered.length > 0 && filtered.length % 10 === 0 && (
            <button
              onClick={loadMoreResults}
              disabled={isLoading}
              className="mt-8 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl text-xs transition transform hover:-translate-y-0.5"
            >
              {isLoading ? "Loading..." : "Load More"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}