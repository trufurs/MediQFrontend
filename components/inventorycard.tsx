import React from "react";

interface Medicine {
  _id: string;
  name: string;
  composition: string;
  manufacturer: string;
  usage: string;
  precautions: string;
}

interface InventoryItem {
  _id: string;
  store: string;
  medicine: Medicine;
  quantity: number;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
}

interface CardiProps {
  item: InventoryItem;
}

const Cardi: React.FC<CardiProps> = ({ item }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow duration-300">
      {/* Medicine Name */}
      <h2 className="text-lg font-bold text-gray-800 mb-2">{item.medicine.name}</h2>

      {/* Manufacturer */}
      <p className="text-sm text-gray-600 mb-1">
        <span className="font-semibold">Manufacturer:</span> {item.medicine.manufacturer}
      </p>

      {/* Composition */}
      <p className="text-sm text-gray-600 mb-1">
        <span className="font-semibold">Composition:</span> {item.medicine.composition}
      </p>

      {/* Quantity */}
      <p className="text-sm text-gray-600 mb-1">
        <span className="font-semibold">Quantity:</span> {item.quantity}
      </p>

      {/* Expiry Date */}
      <p className="text-sm text-gray-600 mb-1">
        <span className="font-semibold">Expiry Date:</span> {new Date(item.expiryDate).toLocaleDateString()}
      </p>

      {/* Usage */}
      <p className="text-sm text-gray-600 mb-1">
        <span className="font-semibold">Usage:</span> {item.medicine.usage}
      </p>

      {/* Precautions */}
      <p className="text-sm text-gray-600">
        <span className="font-semibold">Precautions:</span> {item.medicine.precautions}
      </p>
    </div>
  );
};

export default Cardi;