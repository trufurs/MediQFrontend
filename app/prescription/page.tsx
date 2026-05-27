"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useToast } from "@/context/ToastContext";
import dynamic from "next/dynamic";
import {
  FiUploadCloud,
  FiFileText,
  FiLoader,
  FiMapPin,
  FiPhone,
  FiCheckCircle,
  FiClock,
  FiInfo,
  FiAlertTriangle,
} from "react-icons/fi";

const MedicineMap = dynamic(() => import("@/components/MedicineMap"), {
  ssr: false,
});

interface Store {
  storeDetails: any;
  store: string;
  name: string;
  distance: number;
  quantity: number;
  expiryDate: string;
  storeAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
}

export default function PrescriptionScannerPage() {
  const { showToast } = useToast();
  const router = useRouter();

  // Route Guard: block admins and store owners
  useEffect(() => {
    const ud = localStorage.getItem("user_data");
    if (ud) {
      try {
        const parsed = JSON.parse(ud);
        if (parsed.role === "admin" || parsed.role === "store-owner") {
          showToast("Prescription scanning is for customers only.", "warning");
          router.replace("/");
        }
      } catch (err) {
        console.error("Route guard error:", err);
      }
    }
  }, [router, showToast]);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND;

  // Scanner & State Machine
  const [scanState, setScanState] = useState<"idle" | "scanning" | "done">("idle");
  const [fileName, setFileName] = useState<string>("");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // Results State
  const [medicineData, setMedicineData] = useState<any | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [activeMapStore, setActiveMapStore] = useState<Store | null>(null);
  const [activeRouteInfo, setActiveRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
  const [loadingStores, setLoadingStores] = useState(false);

  // Trigger Mock Scanning Sequences
  const triggerScanning = (fileDisplayName: string, targetMedicine: string) => {
    setFileName(fileDisplayName);
    setScanState("scanning");
    setTerminalLogs([]);

    const logSteps = [
      { text: "⏳ [SYS] Initializing handwriting OCR model core...", delay: 300 },
      { text: "⚙️ [SYS] Enhancing image contrast & removing grid background noise...", delay: 900 },
      { text: "🔍 [SYS] Extracting text clusters & matching signature structures...", delay: 1500 },
      { text: `📝 [SYS] Found medication match: ${targetMedicine}`, delay: 2100 },
      { text: "✅ [SYS] OCR check finished. Querying MediQ central stockist database...", delay: 2700 },
    ];

    logSteps.forEach((step) => {
      setTimeout(() => {
        setTerminalLogs((prev) => [...prev, step.text]);
      }, step.delay);
    });

    // Complete scan and resolve stockists
    setTimeout(async () => {
      await resolveMedicationAndStores(targetMedicine);
    }, 3200);
  };

  // Resolve matching drug details & store inventory locations
  const resolveMedicationAndStores = async (medName: string) => {
    setLoadingStores(true);
    try {
      // 1. Search database to get medicine record
      const searchRes = await axios.get(`${backendUrl}/search/`, {
        params: { query: medName, source: "mediq", limit: 1 },
      });

      if (searchRes.data && searchRes.data.length > 0) {
        const matchedMed = searchRes.data[0];
        
        // 2. Fetch full clinical details
        const detailsRes = await axios.get(`${backendUrl}/search/${matchedMed.id}`);
        setMedicineData(detailsRes.data);

        // 3. Request geolocation coordinates
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              setUserLocation([latitude, longitude]);

              try {
                const token = localStorage.getItem("auth_token");
                const response = await axios.get(
                  `${backendUrl}/inventory/stores-with-medicine-nearby`,
                  {
                    params: {
                      medicine: matchedMed.id,
                      lat: latitude,
                      lng: longitude,
                      radius: 20,
                    },
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                  }
                );

                setStores(response.data);
                if (response.data.length > 0) {
                  setActiveMapStore(response.data[0]);
                }
                setScanState("done");
                showToast(`Successfully matched ${medName} and found nearby stores!`, "success");
              } catch (err) {
                console.error("Error matching store inventories:", err);
                showToast("Failed to fetch nearby stocking stores.", "error");
                setScanState("done");
              } finally {
                setLoadingStores(false);
              }
            },
            (geoErr) => {
              console.error("Location error:", geoErr);
              showToast("Failed to acquire GPS location. Showing medicine info only.", "warning");
              setScanState("done");
              setLoadingStores(false);
            }
          );
        } else {
          setScanState("done");
          setLoadingStores(false);
        }
      } else {
        showToast(`Could not find a medication matching "${medName}" in our system.`, "error");
        setScanState("idle");
        setLoadingStores(false);
      }
    } catch (err) {
      console.error("Error resolving medication:", err);
      showToast("Error processing scanner results.", "error");
      setScanState("idle");
      setLoadingStores(false);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      // Randomly select one of our template medications for simulation based on dropped file
      const medicines = ["Amoxicillin", "Metformin", "Paracetamol"];
      const randomMed = medicines[Math.floor(Math.random() * medicines.length)];
      triggerScanning(file.name, randomMed);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const medicines = ["Amoxicillin", "Metformin", "Paracetamol"];
      const randomMed = medicines[Math.floor(Math.random() * medicines.length)];
      triggerScanning(file.name, randomMed);
    }
  };

  // Reset Scanner
  const handleResetScanner = () => {
    setScanState("idle");
    setFileName("");
    setTerminalLogs([]);
    setMedicineData(null);
    setStores([]);
    setActiveMapStore(null);
    setActiveRouteInfo(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-8 text-left relative min-h-[85vh]">
      
      {/* Header */}
      <div className="mb-8 border-b border-white/10 pb-5">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
          AI Prescription Hub
        </h1>
        <p className="text-gray-400 text-sm mt-1.5 leading-relaxed">
          Upload handwritten prescriptions. Our OCR models scan text, match medications, check local store stocks, and draw travel navigation paths dynamically.
        </p>
      </div>

      {/* IDLE VIEW: Dropzone & Templates */}
      {scanState === "idle" && (
        <div className="max-w-xl mx-auto space-y-8 py-10 animate-fade-in">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-10 text-center transition duration-300 relative group cursor-pointer ${
              isDragOver
                ? "border-emerald-500 bg-emerald-500/5 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
                : "border-white/15 bg-white/5 hover:border-white/30"
            }`}
          >
            <input
              type="file"
              id="rx-file-input"
              className="hidden"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
            />
            <label htmlFor="rx-file-input" className="cursor-pointer space-y-4 block">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:scale-105 transition-transform duration-250">
                <FiUploadCloud size={28} className="text-cyan-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Upload prescription sheet</h3>
                <p className="text-xs text-gray-500 mt-1">Drag and drop PNG, JPG, or PDF prescription file</p>
              </div>
            </label>
          </div>

          {/* Quick Case sheet templates */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              Or scan standard templates
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: "Amoxicillin Sheet.jpg", med: "Amoxicillin", doctor: "Dr. Roberts" },
                { name: "Metformin Sheet.png", med: "Metformin", doctor: "Dr. Gupta" },
                { name: "Paracetamol Sheet.jpg", med: "Paracetamol", doctor: "Dr. Chen" },
              ].map((tpl) => (
                <div
                  key={tpl.name}
                  onClick={() => triggerScanning(tpl.name, tpl.med)}
                  className="p-4 bg-white/5 hover:bg-cyan-500/5 border border-white/5 hover:border-cyan-500/30 rounded-2xl transition duration-200 cursor-pointer text-left space-y-2 group"
                >
                  <div className="flex items-center gap-2">
                    <FiFileText className="text-cyan-400 shrink-0" size={16} />
                    <span className="text-[11px] text-gray-300 font-bold truncate group-hover:text-white transition-colors">
                      {tpl.name}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-tight">
                    Prescribed by {tpl.doctor} for {tpl.med} formulation.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SCANNING VIEW: Laser Scanner & Console Logs */}
      {scanState === "scanning" && (
        <div className="max-w-2xl mx-auto py-10 space-y-8 animate-fade-in text-center">
          <div className="relative w-48 h-48 mx-auto border border-emerald-500/20 rounded-3xl flex items-center justify-center overflow-hidden bg-emerald-500/5 shadow-[0_0_50px_rgba(16,185,129,0.15)]">
            {/* Green Scanning sweep beam */}
            <div className="absolute inset-x-0 w-full h-0.5 bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)] animate-scan-sweep pointer-events-none" />
            <FiLoader className="animate-spin text-5xl text-emerald-400" style={{ animationDuration: "3s" }} />
          </div>

          {/* Console logs output */}
          <div className="bg-zinc-950/85 border border-white/10 rounded-2xl p-5 font-mono text-xs text-left space-y-2.5 max-w-lg mx-auto shadow-2xl h-44 overflow-y-auto scrollbar-none">
            <p className="text-gray-500 border-b border-white/5 pb-1.5 uppercase font-bold tracking-wider text-[10px]">
              Console Scanner Terminal - {fileName}
            </p>
            {terminalLogs.map((log, idx) => (
              <p key={idx} className="text-emerald-400 animate-fade-in leading-relaxed">
                {log}
              </p>
            ))}
            {terminalLogs.length < 5 && (
              <p className="text-gray-500 animate-pulse mt-1 flex items-center gap-1.5">
                <FiLoader className="animate-spin text-[10px]" />
                <span>Running handwriting recognition algorithm...</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* DONE VIEW: Side-by-Side Results & OSRM Map */}
      {scanState === "done" && medicineData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          
          {/* LEFT PANEL: Clinical Medication profile */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Summary card header */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 uppercase tracking-widest">
                  Successfully Decoded
                </span>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">{medicineData.name}</h2>
                <p className="text-xs text-gray-400">
                  Chemical Formula: <strong className="text-white">{medicineData.composition}</strong>
                </p>
              </div>
              <button
                onClick={handleResetScanner}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold rounded-xl text-gray-400 hover:text-white transition duration-200"
              >
                Scan Another Sheet
              </button>
            </div>

            {/* Profile details tabs */}
            <div className="space-y-5">
              
              <div className="bg-white/5 border border-white/5 rounded-2xl p-5 text-left transition duration-300">
                <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2 flex items-center">
                  <FiInfo className="mr-1.5" /> Indications & Clinical Usage
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                  {medicineData.usage || "No clinical usage information available in matching catalog."}
                </p>
              </div>

              {medicineData.precautions && (
                <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-5 text-left transition duration-300">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-rose-400 mb-2 flex items-center">
                    <FiAlertTriangle className="mr-1.5" /> Clinical Safety Precautions
                  </h3>
                  <p className="text-xs text-rose-350/90 leading-relaxed whitespace-pre-line">
                    {medicineData.precautions}
                  </p>
                </div>
              )}

              {medicineData.manufacturer && (
                <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="text-gray-500 block uppercase tracking-wider text-[9px] font-bold">Manufacturer Details</span>
                    <strong className="text-white text-sm block mt-0.5">{medicineData.manufacturer}</strong>
                  </div>
                  <span className="px-2 py-1 bg-white/5 border border-white/10 text-[9px] font-bold rounded">GMP Certified</span>
                </div>
              )}

            </div>
          </div>

          {/* RIGHT PANEL: Store stocks and Route Planner */}
          <div className="lg:col-span-5 space-y-5">
            <h2 className="text-lg font-bold text-white flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
              Stockist Locations & Navigation
            </h2>

            {/* Route GPS Leaflet Map */}
            {userLocation && (
              <div className="w-full h-[260px] bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl z-10 relative">
                <MedicineMap
                  userLocation={userLocation}
                  stores={stores}
                  selectedStore={activeMapStore}
                  onSelectStore={(store) => setActiveMapStore(store)}
                  onRouteUpdate={setActiveRouteInfo}
                />
              </div>
            )}

            {/* Availability Stock list */}
            {loadingStores ? (
              <div className="flex flex-col items-center justify-center py-10 bg-white/5 border border-white/10 rounded-3xl">
                <FiLoader className="animate-spin text-2xl text-cyan-400 mb-2" />
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Acquiring GPS stock locations...</p>
              </div>
            ) : stores.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-center space-y-2">
                <FiAlertTriangle className="text-rose-400 mx-auto" size={32} />
                <h3 className="font-bold text-white text-sm">Out of Stock Nearby</h3>
                <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                  Unfortunately, no pharmacies within a 20km radius currently have active batches of {medicineData.name}.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {stores.map((store) => {
                  const isActive = activeMapStore?.store === store.store;
                  const isLow = store.quantity < 15;
                  const storeLat = store.storeDetails?.latitude || store.storeAddress?.latitude;
                  const storeLng = store.storeDetails?.longitude || store.storeAddress?.longitude;

                  return (
                    <div
                      key={store.store}
                      onClick={() => setActiveMapStore(store)}
                      className={`border rounded-2xl p-4 transition duration-200 cursor-pointer text-left ${
                        isActive
                          ? "border-emerald-500 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                          : "bg-white/5 border-white/15 hover:border-cyan-500/30"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h4 className="text-sm font-bold text-white truncate max-w-[70%]">
                          {store.storeDetails?.name || "Partner Pharmacy"}
                        </h4>
                        <span className="text-[9px] font-extrabold uppercase bg-cyan-500/10 border border-cyan-500/35 text-cyan-400 px-2 py-0.5 rounded-full">
                          {(store.distance / 1000).toFixed(2)} km
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-gray-400 border-b border-white/5 pb-2.5 mb-2.5">
                        <p className="flex items-center">
                          <FiMapPin className="mr-1.5 flex-shrink-0" />
                          <span className="truncate">{store.storeAddress?.street}, {store.storeAddress?.city}</span>
                        </p>
                        {store.storeDetails?.contact && (
                          <p className="flex items-center text-cyan-400">
                            <FiPhone className="mr-1.5 flex-shrink-0" />
                            <span>{store.storeDetails.contact}</span>
                          </p>
                        )}
                      </div>

                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-gray-400">Stock Availability:</span>
                        <span className={`font-bold ${isLow ? "text-amber-400 animate-pulse" : "text-emerald-400"}`}>
                          {store.quantity} units {isLow ? "(Low)" : "(Available)"}
                        </span>
                      </div>

                      {/* Travel Directions shortcuts */}
                      {isActive && userLocation && typeof storeLat === "number" && typeof storeLng === "number" && (
                        <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation[0]},${userLocation[1]}&destination=${storeLat},${storeLng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-1.5 bg-emerald-600/15 hover:bg-emerald-600 border border-emerald-500/20 hover:border-emerald-500 text-emerald-400 hover:text-white rounded-lg text-center text-[10px] font-bold transition duration-200"
                          >
                            Open Directions 🧭
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Embedded scanning sweep styles */}
      <style>{`
        @keyframes scanSweep {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        .animate-scan-sweep {
          position: absolute;
          animation: scanSweep 2.2s infinite linear;
        }
      `}</style>
    </div>
  );
}
