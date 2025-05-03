import React from "react";
import axios from "axios";

export default async function Page({
  params,
}: {
  params: Promise<{ medicineid: string }>;
}) {
  const { medicineid } = await params;

  let medicineData;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND;
  try {
    // Fetch data using axios
    const response = await axios.get(`${backendUrl}/search/${medicineid}`);
    medicineData = response.data;
  } catch (error) {
    console.error("Error fetching medicine details:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-red-500">Error</h1>
        <p className="text-gray-700">Failed to fetch medicine details.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-12 py-8">
      {/* Highlighted Name */}
      <h1 className="text-4xl font-bold mb-6 text-blue-600 text-left">{medicineData.name}</h1>

      {/* Dynamic Details */}
      <div className="space-y-6">
        {Object.entries(medicineData).map(([key, value]) => {
          // Skip highlighting the `name` field since it's already displayed above
          if (key === "name") return null;

          // Format the key to make it more readable (e.g., "composition" -> "Composition")
          const formattedKey = key
            .replace(/_/g, " ") // Replace underscores with spaces
            .replace(/^\w/, (c) => c.toUpperCase()); // Capitalize the first letter

          return (
            <div key={key} className="text-left">
              <h2 className="text-2xl font-semibold mb-2 text-white">{formattedKey}</h2>
              <p className="text-green-300 text-lg leading-relaxed">
                {typeof value === "string" ? value : JSON.stringify(value, null, 2)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}