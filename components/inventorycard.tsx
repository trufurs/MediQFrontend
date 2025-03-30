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
  sellerName: string;
}

interface CardiProps {
  item: InventoryItem;
  onEdit: () => void;
  onDelete: (id: string) => void;
}

const Cardi: React.FC<CardiProps> = ({ item, onEdit, onDelete }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow duration-300">
      {/* Medicine Details */}
      <h2 className="text-lg font-bold text-gray-800">{item.medicine.name}</h2>
      <p className="text-sm text-gray-600">
        <span className="font-semibold">Composition:</span> {item.medicine.composition}
      </p>
      <p className="text-sm text-gray-600">
        <span className="font-semibold">Manufacturer:</span> {item.medicine.manufacturer}
      </p>

      {/* Inventory Details */}
      <p className="text-sm text-gray-600">
        <span className="font-semibold">Quantity:</span> {item.quantity}
      </p>
      <p className="text-sm text-gray-600">
        <span className="font-semibold">Expiry Date:</span> {new Date(item.expiryDate).toLocaleDateString()}
      </p>
      <p className="text-sm text-gray-600">
        <span className="font-semibold">Seller:</span> {item.sellerName}
      </p>

      {/* Action Buttons */}
      <div className="mt-4 flex justify-between">
        <button
          onClick={onEdit}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(item._id)}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default Cardi;