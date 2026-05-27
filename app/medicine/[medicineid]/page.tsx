/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import axios from "axios";
import { createCustomerOrder } from "@/utils/management";
import CustomDialog from "@/components/CustomDialog";
import { FiMapPin, FiPhone, FiInfo, FiTruck, FiAlertTriangle, FiCheckCircle, FiStar } from "react-icons/fi";
import dynamic from "next/dynamic";

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
    location?: any;
  };
}

interface MedicineData {
  name: string;
  composition?: string;
  manufacturer?: string;
  usage?: string;
  precautions?: string;
  sideEffects?: string;
  storageInstructions?: string;
  activeIngredients?: string;
  inactiveIngredients?: string;
  dosageAndAdministration?: string;
  purpose?: string;
  warnings?: string;
  askDoctor?: string;
  stopUse?: string;
  pregnancyOrBreastFeeding?: string;
  keepOutOfReachOfChildren?: string;
  questions?: string;
  [key: string]: any;
}

export default function MedicineDetailsPage({
  params,
}: {
  params: Promise<{ medicineid: string }>;
 }) {
  const { medicineid } = React.use(params);
  const { showToast } = useToast();
  const router = useRouter();

  // Route guard: only allow customer and guest (temp) users
  useEffect(() => {
    const ud = localStorage.getItem("user_data");
    if (ud) {
      try {
        const parsed = JSON.parse(ud);
        if (parsed.role === "admin" || parsed.role === "store-owner") {
          showToast("Medicine details are for customers only.", "warning");
          router.replace("/");
        }
      } catch (err) {
        console.error("Error parsing user_data in route guard:", err);
      }
    }
  }, [router, showToast]);

  const [stores, setStores] = useState<Store[]>([]);
  const [loadingStores, setLoadingStores] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [medicineData, setMedicineData] = useState<MedicineData | null>(null);
  
  // Geolocation & Map Routing States
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [activeMapStore, setActiveMapStore] = useState<Store | null>(null);
  const [sortBy, setSortBy] = useState<"distance" | "stock">("distance");
  const [loaderMessage, setLoaderMessage] = useState("Acquiring GPS coordinates...");

  // Mobile Tab State
  const [mobileActiveTab, setMobileActiveTab] = useState<"stores" | "profile">("stores");

  // Active Route Info State (Shortest path distance & time)
  const [activeRouteInfo, setActiveRouteInfo] = useState<{ distance: string; duration: string } | null>(null);

  useEffect(() => {
    setActiveRouteInfo(null);
  }, [activeMapStore]);

  // Tabs State
  const [activeTab, setActiveTab] = useState<"overview" | "clinical" | "safety">("overview");

  // Dialog State
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  // Favorite stores system state
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const favs = localStorage.getItem("favorite_stores");
    if (favs) {
      try {
        setFavorites(JSON.parse(favs));
      } catch (err) {
        console.error("Error parsing favorites:", err);
      }
    }
  }, []);

  const toggleFavorite = (storeId: string) => {
    let updated = [...favorites];
    if (updated.includes(storeId)) {
      updated = updated.filter((id) => id !== storeId);
      showToast("Store removed from favorites.", "info");
    } else {
      updated.push(storeId);
      showToast("Store added to favorites!", "success");
    }
    setFavorites(updated);
    localStorage.setItem("favorite_stores", JSON.stringify(updated));
  };
  const [orderQuantity, setOrderQuantity] = useState<number>(1);
  const [orderRemarks, setOrderRemarks] = useState<string>("");
  const [submittingOrder, setSubmittingOrder] = useState<boolean>(false);
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);

  // Generic substitutes state
  const [substitutes, setSubstitutes] = useState<any[]>([]);
  const [loadingSubstitutes, setLoadingSubstitutes] = useState<boolean>(false);

  const search = medicineid.split("-").length <= 1;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND;

  // Rotate radar status scanning text
  useEffect(() => {
    if (!loadingStores) return;
    const messages = [
      "Acquiring GPS location coordinates...",
      "Connecting to MediQ central database...",
      "Filtering stores within 20km radius...",
      "Matching medicine composition matches...",
      "Analyzing active stock inventory counts...",
      "Verifying batch expiry timestamps..."
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % messages.length;
      setLoaderMessage(messages[idx]);
    }, 1800);
    return () => clearInterval(interval);
  }, [loadingStores]);

  // Sort stores dynamically with Favorites prioritized
  const sortedStores = React.useMemo(() => {
    const list = [...stores];
    list.sort((a, b) => {
      const aFav = favorites.includes(a.store);
      const bFav = favorites.includes(b.store);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;

      if (sortBy === "distance") {
        return a.distance - b.distance;
      } else if (sortBy === "stock") {
        return b.quantity - a.quantity;
      }
      return 0;
    });
    return list;
  }, [stores, sortBy, favorites]);

  // Fetch medicine details and generic substitutes
  useEffect(() => {
    const fetchMedicineData = async () => {
      try {
        const response = await axios.get(`${backendUrl}/search/${medicineid}`);
        setMedicineData(response.data); 
      } catch (err) {
        console.error("Error fetching medicine details:", err);
        setError("Failed to fetch medicine details.");
        showToast("Failed to fetch medicine details.", "error");
      }
    };

    const fetchSubstitutes = async () => {
      setLoadingSubstitutes(true);
      try {
        const response = await axios.get(`${backendUrl}/search/${medicineid}/substitutes`);
        setSubstitutes(response.data);
      } catch (err) {
        console.error("Error fetching generic substitutes:", err);
      } finally {
        setLoadingSubstitutes(false);
      }
    };

    fetchMedicineData();
    fetchSubstitutes();
  }, [medicineid, backendUrl, showToast]);

  // Search for stores with the medicine nearby
  const handleSearchStores = async () => {
    setLoadingStores(true);
    setError(null);
    setLoaderMessage("Acquiring GPS coordinates...");

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        showToast("Please log in to search for stores.", "error");
        setLoadingStores(false);
        return;
      }

      if (!navigator.geolocation) {
        showToast("Geolocation is not supported by this browser.", "error");
        setLoadingStores(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);

          try {
            const response = await axios.get(
              `${backendUrl}/inventory/stores-with-medicine-nearby`,
              {
                params: {
                  medicine: medicineid,
                  lat: latitude,
                  lng: longitude,
                  radius: 20, // Radius in kilometers
                },
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (response.data.length === 0) {
              setStores([]);
              showToast("No stores found with the specified medicine nearby.", "error");
            } else {
              setStores(response.data);
              if (response.data.length > 0) {
                // Default active store to first store for map polyline routing
                setActiveMapStore(response.data[0]);
              }
              // Auto switch to stores view tab on mobile devices
              setMobileActiveTab("stores");
              showToast("Nearby pharmacies loaded successfully!", "success");
            }
          } catch (err: any) {
            if (err.response && err.response.status === 404) {
              setStores([]);
              showToast("No stores found with the specified medicine nearby.", "error");
            } else {
              console.error("Error fetching stores:", err);
              showToast("Failed to fetch stores. Please try again.", "error");
            }
          } finally {
            setLoadingStores(false);
          }
        },
        (err) => {
          console.error("Error getting location:", err);
          showToast("Failed to get user location. Please enable location services.", "error");
          setLoadingStores(false);
        }
      );
    } catch (err) {
      console.error("Unexpected error:", err);
      showToast("An unexpected error occurred. Please try again.", "error");
      setLoadingStores(false);
    }
  };

  const handleOpenOrderDialog = (store: Store) => {
    setSelectedStore(store);
    setOrderQuantity(1);
    setOrderRemarks("");
    setOrderSuccess(false);
    setShowOrderDialog(true);
  };

  const handleSubmitOrderRequest = async () => {
    if (!selectedStore) return;
    if (orderQuantity < 1 || orderQuantity > selectedStore.quantity) {
      showToast(`Please enter a quantity between 1 and ${selectedStore.quantity}`, "error");
      return;
    }

    setSubmittingOrder(true);
    try {
      const payload = {
        store: selectedStore.store,
        medicines: [
          {
            medicine_id: medicineid,
            quantity: orderQuantity,
            expiry: selectedStore.expiryDate,
            price: 12.50, // Standard mock price
          }
        ],
        totalItems: 1,
        remarks: orderRemarks || `Customer B2C Request for ${medicineData?.name}`
      };

      await createCustomerOrder(payload);
      setOrderSuccess(true);
      showToast("Order request sent to store successfully!", "success");
      
      // Auto close dialog after showing animated checkmark for 1.5s
      setTimeout(() => {
        setShowOrderDialog(false);
        setOrderSuccess(false);
      }, 1800);
    } catch (err: any) {
      console.error("Error placing B2C order:", err);
      showToast(err.response?.data?.error || "Failed to place order request.", "error");
    } finally {
      setSubmittingOrder(false);
    }
  };

  const getDistanceBadgeColor = (dist: number) => {
    const km = dist / 1000;
    if (km < 5) return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
    if (km < 12) return "bg-amber-500/10 border-amber-500/30 text-amber-400";
    return "bg-rose-500/10 border-rose-500/30 text-rose-400";
  };

  const getStockStatus = (qty: number) => {
    if (qty > 20) return { text: "In Stock (High)", color: "text-emerald-400", bar: "bg-emerald-500", percent: 100 };
    if (qty > 0) return { text: "Low Stock", color: "text-amber-400", bar: "bg-amber-500", percent: 35 };
    return { text: "Out of Stock", color: "text-rose-400", bar: "bg-rose-500", percent: 0 };
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-rose-500 mb-4">Error</h1>
        <p className="text-gray-300 bg-rose-950/20 border border-rose-500/20 p-4 rounded-xl">{error}</p>
      </div>
    );
  }

  if (!medicineData) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
        <h1 className="text-xl font-medium text-gray-400">Fetching Clinical Profile...</h1>
      </div>
    );
  }

  const isPlaceholder = (val: any) => {
    if (!val) return true;
    if (typeof val !== "string") return false;
    const lower = val.toLowerCase().trim();
    return (
      lower === "" ||
      lower === "unknown" ||
      lower === "n/a" ||
      lower.startsWith("no ") && lower.endsWith("available") ||
      lower.includes("no usage information") ||
      lower.includes("no precautions") ||
      lower.includes("no side effects") ||
      lower.includes("no warnings") ||
      lower.includes("no storage instructions") ||
      lower.includes("no active ingredients") ||
      lower.includes("no inactive ingredients") ||
      lower.includes("no dosage information") ||
      lower.includes("no purpose information") ||
      lower.includes("no doctor consultation") ||
      lower.includes("no stop use") ||
      lower.includes("no pregnancy") ||
      lower.includes("no child safety") ||
      lower.includes("no contact information")
    );
  };

  const renderCard = (title: string, value: string | undefined, isAlert = false) => {
    if (isPlaceholder(value)) return null;
    return (
      <div key={title} className={`border rounded-2xl p-6 text-left transition duration-300 ${
        isAlert 
          ? "bg-rose-500/5 border-rose-500/10 hover:border-rose-500/20" 
          : "bg-white/5 border border-white/5 hover:border-white/10"
      }`}>
        <h3 className={`text-xs font-bold uppercase tracking-widest mb-2.5 flex items-center ${isAlert ? "text-rose-450" : "text-cyan-400"}`}>
          {isAlert ? <FiAlertTriangle className="mr-2" /> : <FiInfo className="mr-2" />} {title}
        </h3>
        <p className="text-sm text-gray-305 leading-relaxed whitespace-pre-line">{value}</p>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        const overviewCards = [
          renderCard("Formula Composition", medicineData.composition),
          renderCard("Manufacturer", medicineData.manufacturer),
          renderCard("Storage Instructions", medicineData.storageInstructions),
          renderCard("Active Ingredients", medicineData.activeIngredients),
          renderCard("Inactive Ingredients", medicineData.inactiveIngredients),
        ].filter(c => c !== null);

        if (overviewCards.length === 0) {
          return (
            <div className="bg-white/5 border border-white/5 rounded-2xl p-8 text-center text-gray-400">
              <FiInfo className="mx-auto text-4xl mb-3 text-cyan-400" />
              <p>No overview details logged for this medicine.</p>
            </div>
          );
        }

        return <div className="space-y-6">{overviewCards}</div>;
      
      case "clinical":
        const clinicalCards = [
          renderCard("Indications & Clinical Usage", medicineData.usage),
          renderCard("Dosage & Administration", medicineData.dosageAndAdministration),
          renderCard("Action / Purpose", medicineData.purpose),
        ].filter(c => c !== null);

        if (clinicalCards.length === 0) {
          return (
            <div className="bg-white/5 border border-white/5 rounded-2xl p-8 text-center text-gray-400">
              <FiInfo className="mx-auto text-4xl mb-3 text-cyan-400" />
              <p>No clinical usage details logged for this medicine.</p>
            </div>
          );
        }

        return <div className="space-y-6">{clinicalCards}</div>;

      case "safety":
        const safetyCards = [
          renderCard("Precautions & Warnings", medicineData.precautions || medicineData.warnings),
          renderCard("Side Effects / Adverse Reactions", medicineData.sideEffects, true),
          renderCard("Doctor Consultation Notes", medicineData.askDoctor, true),
          renderCard("Stop Use Scenario", medicineData.stopUse, true),
          renderCard("Pregnancy & Breastfeeding Safety", medicineData.pregnancyOrBreastFeeding, true),
          renderCard("Child Safety Lock Warnings", medicineData.keepOutOfReachOfChildren, true),
          renderCard("Contact / Questions", medicineData.questions),
        ].filter(c => c !== null);

        if (safetyCards.length === 0) {
          return (
            <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-8 text-center text-gray-400">
              <FiAlertTriangle className="mx-auto text-4xl mb-3 text-rose-400" />
              <p>No safety alerts or caution warnings logged for this medicine.</p>
            </div>
          );
        }

        return <div className="space-y-6">{safetyCards}</div>;
    }
  };;

  return (
    <div className="container mx-auto px-6 md:px-12 py-8 max-w-6xl relative">
      {/* Premium Glassmorphic Scan Radar Loader Overlay */}
      {loadingStores && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in p-6">
          <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
            {/* Pulsating glow rings */}
            <div className="absolute inset-0 rounded-full bg-cyan-500/5 border border-cyan-500/20 animate-ping"></div>
            <div className="absolute inset-4 rounded-full bg-emerald-500/5 border border-emerald-500/10 animate-pulse"></div>
            {/* Spinning Radar sweep */}
            <div className="absolute inset-2 rounded-full border border-white/5 flex items-center justify-center">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-500 to-emerald-500 animate-spin"></div>
            </div>
            {/* Center Satellite/Cross icon */}
            <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center text-white text-3xl shadow-[0_0_24px_rgba(6,182,212,0.6)]">
              🛰️
            </div>
          </div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">Scanning Pharmacy Networks</h3>
          <p className="text-sm text-cyan-400 font-semibold mt-3 animate-pulse">
            {loaderMessage}
          </p>
          <p className="text-xs text-gray-500 mt-2 max-w-xs text-center leading-relaxed">
            Searching a 20km radius from your active GPS coordinates. Please ensure location access is enabled.
          </p>
        </div>
      )}

      {/* Back button */}
      <button
        onClick={() => window.history.back()}
        className="mb-8 flex items-center text-sm font-bold text-gray-400 hover:text-white transition duration-200"
      >
        ← Back to search
      </button>

      {/* Premium Hero Header Card */}
      <div className="relative bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10 mb-8 shadow-2xl overflow-hidden text-left">
        {/* Glow effect */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold border border-cyan-500/30 text-cyan-400 uppercase tracking-widest">
              {medicineid.startsWith("openfda-") ? "Global openFDA Drug" : "In-Network Pharmacy Item"}
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-150 to-gray-400 mt-2">
              {medicineData.name}
            </h1>
            {medicineData.manufacturer && (
              <p className="text-gray-400 text-sm font-medium">
                Manufactured by <strong className="text-white">{medicineData.manufacturer}</strong>
              </p>
            )}
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            {search && (
              <button
                onClick={handleSearchStores}
                disabled={loadingStores}
                className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg transition duration-250 transform active:scale-95 disabled:opacity-50 flex items-center justify-center"
              >
                Find Stores Nearby 📍
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Screen Navigation Tabs (Visible on mobile, hidden on lg screens) */}
      <div className="flex lg:hidden bg-white/5 p-1 rounded-2xl border border-white/10 mb-6 w-full">
        <button
          type="button"
          onClick={() => setMobileActiveTab("stores")}
          className={`flex-grow py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer text-center ${
            mobileActiveTab === "stores" ? "bg-cyan-600/20 text-cyan-400 border border-cyan-500/30" : "text-gray-400 hover:text-white"
          }`}
        >
          🏪 Stockists & Map
        </button>
        <button
          type="button"
          onClick={() => setMobileActiveTab("profile")}
          className={`flex-grow py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer text-center ${
            mobileActiveTab === "profile" ? "bg-cyan-600/20 text-cyan-400 border border-cyan-500/30" : "text-gray-400 hover:text-white"
          }`}
        >
          📄 Medical Profile
        </button>
      </div>

      {/* Main Grid: Details on Left, Stores Panel on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Tabs & Clinical parameters */}
        <div className={`lg:col-span-8 space-y-6 ${mobileActiveTab === "profile" ? "block" : "hidden lg:block"}`}>
          {/* Tab buttons */}
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 max-w-md">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer text-center ${
                activeTab === "overview" ? "bg-white/10 text-white shadow-md" : "text-gray-400 hover:text-white"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("clinical")}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer text-center ${
                activeTab === "clinical" ? "bg-white/10 text-white shadow-md" : "text-gray-400 hover:text-white"
              }`}
            >
              Clinical Info
            </button>
            <button
              onClick={() => setActiveTab("safety")}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer text-center ${
                activeTab === "safety" ? "bg-white/10 text-white shadow-md" : "text-gray-400 hover:text-white"
              }`}
            >
              Safety Alerts
            </button>
          </div>

          <div className="transition duration-300">
            {renderTabContent()}
          </div>

          {/* ✨ Generic Substitutes Finder */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left relative overflow-hidden group">
            <div className="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-cyan-500/5 blur-2xl pointer-events-none" />
            
            <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-4 flex items-center gap-1.5">
              <span>✨</span> Generic Substitutes Finder
            </h3>
            
            {loadingSubstitutes ? (
              <div className="flex items-center gap-2 text-xs text-gray-500 py-3">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-cyan-500" />
                <span>Searching for chemical composition equivalents...</span>
              </div>
            ) : substitutes.length === 0 ? (
              <p className="text-xs text-gray-500 py-2 leading-relaxed">
                No generic substitutes with the exact same chemical formulation were found in the network database.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {substitutes.map((sub: any) => (
                  <div
                    key={sub.id}
                    onClick={() => {
                      router.push(`/medicine/${sub.id}`);
                    }}
                    className="p-4 bg-black/40 hover:bg-cyan-500/5 border border-white/5 hover:border-cyan-500/25 rounded-xl transition duration-305 cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-450 transition-colors">
                        {sub.name}
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-1 truncate">
                        {sub.manufacturer || "Unknown Manufacturer"}
                      </p>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between text-[10px] text-gray-500 border-t border-white/5 pt-2">
                      <span className="font-semibold text-cyan-300 truncate max-w-[70%]">
                        Composition: {sub.composition}
                      </span>
                      <span className="text-cyan-400 group-hover:translate-x-1 transition-transform">
                        View Details →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Pharmacy stock panel */}
        <div className={`lg:col-span-4 text-left ${mobileActiveTab === "stores" ? "block" : "hidden lg:block"}`}>
          {sortedStores.length === 0 ? (
            <div className="bg-white/5 rounded-3xl p-6 border border-white/10 text-center flex flex-col justify-center min-h-[300px]">
              <div className="text-4xl mb-3">🏪</div>
              <h3 className="font-extrabold text-white text-base">Store Availability</h3>
              <p className="text-gray-400 text-xs mt-2 max-w-xs mx-auto leading-relaxed">
                Click &quot;Find Stores Nearby&quot; above to check real-time stock levels of {medicineData.name} at pharmacy stores near your coordinates.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-ping"></span>
                Nearby Stockists
              </h2>

              {/* GPS Route Plotted Leaflet Map */}
              {userLocation && (
                <div className="w-full h-[250px] bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl z-10 relative">
                  <MedicineMap
                    userLocation={userLocation}
                    stores={sortedStores}
                    selectedStore={activeMapStore}
                    onSelectStore={(store) => setActiveMapStore(store)}
                    onRouteUpdate={setActiveRouteInfo}
                  />
                </div>
              )}

              {/* Sorting toggles */}
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 text-[10px]">
                <button
                  type="button"
                  onClick={() => setSortBy("distance")}
                  className={`flex-1 py-1.5 rounded-lg font-extrabold uppercase tracking-wider transition ${
                    sortBy === "distance" ? "bg-white/10 text-white shadow-md" : "text-gray-400 hover:text-white"
                  }`}
                >
                  Closest First
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy("stock")}
                  className={`flex-1 py-1.5 rounded-lg font-extrabold uppercase tracking-wider transition ${
                    sortBy === "stock" ? "bg-white/10 text-white shadow-md" : "text-gray-400 hover:text-white"
                  }`}
                >
                  Highest Stock
                </button>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {sortedStores.map((store) => {
                  const stock = getStockStatus(store.quantity);
                  const isActiveOnMap = activeMapStore?.store === store.store;
                  const storeLat = store.storeDetails?.latitude || store.storeAddress?.latitude;
                  const storeLng = store.storeDetails?.longitude || store.storeAddress?.longitude;

                  return (
                    <div
                      key={store.store}
                      onClick={() => setActiveMapStore(store)}
                      className={`border rounded-2xl p-5 shadow-lg transition duration-300 cursor-pointer text-left ${
                        isActiveOnMap
                          ? "border-emerald-500 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                          : "bg-white/5 border-white/10 hover:border-cyan-500/20"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3 gap-2">
                        <div className="flex items-center gap-2 max-w-[65%]">
                          <h3 className="font-extrabold text-white text-base truncate">
                            {store.storeDetails?.name || "Partner Store"}
                          </h3>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(store.store);
                            }}
                            className="text-gray-400 hover:text-amber-400 transition cursor-pointer"
                            title={favorites.includes(store.store) ? "Remove from Favorites" : "Add to Favorites"}
                          >
                            <FiStar
                              size={15}
                              className={
                                favorites.includes(store.store)
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-gray-500 hover:text-amber-400"
                              }
                            />
                          </button>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border tracking-wider ${getDistanceBadgeColor(store.distance)}`}>
                          {(store.distance / 1000).toFixed(2)} km
                        </span>
                      </div>

                      <div className="space-y-2 text-xs text-gray-300 mb-4 border-b border-white/5 pb-3">
                        <p className="flex items-center text-gray-400">
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

                      {/* Stock Progress meter */}
                      <div className="space-y-1 mb-4">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-gray-400">Availability:</span>
                          <span className={stock.color}>{stock.text} ({store.quantity} units)</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-1.5 border border-white/5 overflow-hidden">
                          <div className={`h-full ${stock.bar}`} style={{ width: `${stock.percent}%` }}></div>
                        </div>
                      </div>

                      {/* Shortest Path Driving Route Info */}
                      {isActiveOnMap && activeRouteInfo && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl mb-4 text-xs font-semibold text-emerald-450 animate-fade-in flex justify-between items-center">
                          <span>🚗 Driving Route:</span>
                          <span className="font-bold text-white">{activeRouteInfo.distance} km ({activeRouteInfo.duration} mins)</span>
                        </div>
                      )}

                      {/* Stacked interactive action buttons */}
                      <div className="flex flex-col gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                        {isActiveOnMap && userLocation && typeof storeLat === "number" && typeof storeLng === "number" && (
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation[0]},${userLocation[1]}&destination=${storeLat},${storeLng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2 bg-emerald-600/10 hover:bg-emerald-600 border border-emerald-500/20 hover:border-emerald-500 text-emerald-450 hover:text-white rounded-xl text-center text-xs font-bold transition duration-200"
                          >
                            Get Directions 🧭
                          </a>
                        )}
                        <button
                          onClick={() => handleOpenOrderDialog(store)}
                          className="w-full py-2.5 bg-cyan-600/10 hover:bg-cyan-600 border border-cyan-500/20 hover:border-cyan-500 text-cyan-455 hover:text-white rounded-xl text-xs font-bold transition duration-200 text-center"
                        >
                          Request Prescription Order
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Request Frosted Glass Custom Dialog */}
      {selectedStore && (
        <CustomDialog
          open={showOrderDialog}
          onClose={() => {
            if (!submittingOrder) {
              setShowOrderDialog(false);
              setOrderSuccess(false);
            }
          }}
          title="Checkout Prescription Order"
        >
          <div className="relative space-y-5 text-left min-h-[350px]">
            {/* Animated Checkmark Success Overlay */}
            {orderSuccess && (
              <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center z-50 rounded-2xl animate-fade-in text-center p-6">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-400 text-4xl animate-scale-up">
                  <FiCheckCircle />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Request Confirmed!</h3>
                <p className="text-sm text-gray-400 mt-2 max-w-xs leading-relaxed">
                  Your order request has been logged successfully and forwarded to the store owner.
                </p>
              </div>
            )}

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Dispensing Store</p>
              <h3 className="text-lg font-bold text-white">{selectedStore.storeDetails?.name}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{selectedStore.storeAddress?.street}, {selectedStore.storeAddress?.city}</p>
            </div>

            <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex gap-3.5 items-center">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.5 12.75l7.5-7.5c2.071-2.071 5.429-2.071 7.5 0s2.071 5.429 0 7.5l-7.5 7.5c-2.071 2.071-5.429 2.071-7.5 0s-2.071-5.429 0-7.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="truncate text-left">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Prescription Item</p>
                <h3 className="text-base font-bold text-white truncate">{medicineData.name}</h3>
              </div>
            </div>

            {/* Stepper counter */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Quantity Selector (Max {selectedStore.quantity})
              </label>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setOrderQuantity(prev => Math.max(1, prev - 1))}
                  className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-lg font-bold hover:bg-white/10 hover:text-white cursor-pointer transition text-gray-300"
                >
                  -
                </button>
                <div className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2.5 text-center text-base font-bold text-white select-none">
                  {orderQuantity}
                </div>
                <button
                  type="button"
                  onClick={() => setOrderQuantity(prev => Math.min(selectedStore.quantity, prev + 1))}
                  className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-lg font-bold hover:bg-white/10 hover:text-white cursor-pointer transition text-gray-300"
                >
                  +
                </button>
              </div>
            </div>

            {/* Remarks with quick suggestion chips */}
            <div>
              <label htmlFor="remarks-field" className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Order Remarks (Optional)
              </label>
              <textarea
                id="remarks-field"
                placeholder="Include pickup timing, special requests or details..."
                value={orderRemarks}
                onChange={(e) => setOrderRemarks(e.target.value)}
                className="w-full h-20 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition text-sm"
              />
              
              {/* Remarks Suggestions Chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {["Urgent Pickup", "Same-day Pickup", "Keep Refrigerated", "Call when ready"].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setOrderRemarks(chip)}
                    className="px-2.5 py-1 bg-white/5 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 text-gray-450 hover:text-cyan-400 rounded-lg text-[10px] transition cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Invoice checkout summary calculation */}
            <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-xs space-y-1.5 text-left">
              <div className="flex justify-between text-gray-400">
                <span>Unit Price (Est):</span>
                <span>₹12.50</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Selected Quantity:</span>
                <span>x {orderQuantity}</span>
              </div>
              <div className="flex justify-between text-white font-bold border-t border-white/5 pt-1.5 text-sm">
                <span>Estimated Cost:</span>
                <span className="text-cyan-400">₹{(orderQuantity * 12.50).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex space-x-3 pt-3">
              <button
                onClick={() => setShowOrderDialog(false)}
                disabled={submittingOrder}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitOrderRequest}
                disabled={submittingOrder}
                className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg transition duration-200 transform active:scale-95 disabled:opacity-50"
              >
                {submittingOrder ? "Submitting..." : "Confirm Request"}
              </button>
            </div>
          </div>
        </CustomDialog>
      )}
    </div>
  );
}