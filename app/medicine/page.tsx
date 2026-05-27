"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import SearchInput from "@/components/SearchInput";
import SearchOptions from "@/components/SearchOptions";
import SearchResults from "@/components/SearchResults";
import { useToast } from "@/context/ToastContext";
import CustomDialog from "@/components/CustomDialog";
import { FiCamera, FiFileText, FiCpu, FiCheck } from "react-icons/fi";

export default function SearchMedicine() {
  const [query, setQuery] = useState("");
  const [movedUp, setMovedUp] = useState(false);
  const [searchSource, setSearchSource] = useState("any");
  const [filtered, setFiltered] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [skip, setSkip] = useState(0);
  const { showToast } = useToast();
  const router = useRouter();

  // AI Scanner Simulator States
  const [openScanner, setOpenScanner] = useState(false);
  const [scanState, setScanState] = useState<"idle" | "scanning" | "done">("idle");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [detectedMeds, setDetectedMeds] = useState<string>("");

  // Route guard: only allow customer and guest (temp) users
  useEffect(() => {
    const ud = localStorage.getItem("user_data");
    if (ud) {
      try {
        const parsed = JSON.parse(ud);
        if (parsed.role === "admin" || parsed.role === "store-owner") {
          showToast("Medicine search is for customers only.", "warning");
          router.replace("/");
        }
      } catch (err) {
        console.error("Error parsing user_data in route guard:", err);
      }
    }
  }, [router, showToast]);
  
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND;

  const handleSelectTemplate = (medName: string) => {
    setSelectedTemplate(medName);
    setScanState("scanning");
    
    // Simulate OCR scanning
    setTimeout(() => {
      setDetectedMeds(medName);
      setScanState("done");
      showToast("OCR analysis complete! Medicine recognized.", "success");
    }, 2200);
  };

  const handleApplyScan = () => {
    setQuery(detectedMeds);
    setSkip(0);
    setOpenScanner(false);
    setScanState("idle");
    setSelectedTemplate(null);
    executeSearch(detectedMeds, true);
  };

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
            <div className="flex gap-2">
              <button
                onClick={() => setOpenScanner(true)}
                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-xs font-bold rounded-xl text-white shadow-md transition duration-200 cursor-pointer"
              >
                Scan Rx 📷
              </button>
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
            </div>
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
            <button
              onClick={() => setOpenScanner(true)}
              className="mt-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold rounded-xl shadow-lg hover:shadow-cyan-500/20 transition duration-250 transform active:scale-95 text-xs text-center cursor-pointer"
            >
              Scan Prescription with AI 📷
            </button>
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

      {/* AI Scanner Dialog */}
      {openScanner && (
        <CustomDialog
          open={openScanner}
          onClose={() => {
            if (scanState !== "scanning") {
              setOpenScanner(false);
              setScanState("idle");
              setSelectedTemplate(null);
            }
          }}
          title="AI Prescription OCR Scanner"
        >
          <div className="space-y-6 text-left relative overflow-hidden">
            {scanState === "idle" && (
              <div className="space-y-4">
                <p className="text-xs text-gray-400 leading-relaxed">
                  Our Optical Character Recognition (OCR) model processes doctor handwriting templates. Select a prescription case sheet below to run the extraction engine:
                </p>
                
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { title: "Amoxicillin Formula", detail: "Dr. Roberts - 250mg capsule, twice daily.", med: "Amoxicillin" },
                    { title: "Metformin Tablet", detail: "Dr. Gupta - 500mg tablet for diabetes care.", med: "Metformin" },
                    { title: "Paracetamol Case", detail: "Dr. Chen - 650mg tablet for high fever.", med: "Paracetamol" },
                  ].map((tpl) => (
                    <div
                      key={tpl.title}
                      onClick={() => handleSelectTemplate(tpl.med)}
                      className="p-4 bg-white/5 hover:bg-emerald-500/5 border border-white/10 hover:border-emerald-500/30 rounded-xl transition duration-200 cursor-pointer text-left"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">{tpl.title}</h4>
                        <span className="text-[10px] text-gray-500 font-bold font-mono">Rx Sheet</span>
                      </div>
                      <p className="text-xs text-gray-300 mt-2 font-medium">{tpl.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {scanState === "scanning" && (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
                <div className="relative w-36 h-36 border border-emerald-500/20 rounded-2xl flex items-center justify-center overflow-hidden bg-emerald-500/5 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
                  {/* Sweep Scanning Laser */}
                  <div className="absolute inset-x-0 w-full h-0.5 bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-scan-sweep pointer-events-none" />
                  
                  <FiCpu className="text-5xl text-emerald-450 animate-spin" style={{ animationDuration: "3s" }} />
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-white">Running Handwriting Analysis</h4>
                  <p className="text-xs text-emerald-400 font-extrabold tracking-wider uppercase animate-pulse">
                    Decoding: {selectedTemplate}...
                  </p>
                </div>
              </div>
            )}

            {scanState === "done" && (
              <div className="space-y-5">
                <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-4 animate-scale-up">
                  <div className="p-3 bg-emerald-500/20 rounded-full text-emerald-400 text-2xl flex-shrink-0">
                    <FiCheck />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-450">Prescription Decoded</h4>
                    <h3 className="text-lg font-black text-white mt-0.5">{detectedMeds}</h3>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setScanState("idle")}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Rescan
                  </button>
                  <button
                    onClick={handleApplyScan}
                    className="flex-grow py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold rounded-xl text-xs shadow-lg transition duration-200 transform active:scale-95 text-center cursor-pointer"
                  >
                    Auto-Fill and Search
                  </button>
                </div>
              </div>
            )}
          </div>
        </CustomDialog>
      )}

      <style>{`
        @keyframes scanSweep {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        .animate-scan-sweep {
          position: absolute;
          animation: scanSweep 2s infinite linear;
        }
      `}</style>
    </div>
  );
}