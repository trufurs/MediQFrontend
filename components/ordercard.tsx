import React from "react";

interface MedicineItem {
  name: string;
  quantity: number;
  price: number;
  expiryDate: string;
  type: string;
}

interface Order {
  _id: string; // Added Order ID
  orderDate: string;
  seller: string;
  totalItems: number;
  items: MedicineItem[];
  remarks: string;
}

interface CardoProps {
  order: Order;
}

const Cardo: React.FC<CardoProps> = ({ order }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-4 hover:shadow-lg transition-shadow duration-300">
      {/* Order Details */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-800">Order ID: {order._id}</h2>
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Order Date:</span> {new Date(order.orderDate).toLocaleDateString()}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Seller:</span> {order.seller}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Total Items:</span> {order.totalItems}
        </p>
      </div>

      {/* Items List */}
      <div className="mb-4">
        <h3 className="text-md font-semibold text-gray-800 mb-2">Items:</h3>
        <div className="space-y-2">
          {order.items.map((item, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-md bg-gray-50"
            >
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Name:</span> {item.name}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Quantity:</span> {item.quantity}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Price:</span> ₹{item.price.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Expiry Date:</span> {new Date(item.expiryDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Type:</span> {item.type}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Remarks */}
      <div>
        <h3 className="text-md font-semibold text-gray-800 mb-2">Remarks:</h3>
        <p className="text-sm text-gray-600">{order.remarks}</p>
      </div>
    </div>
  );
};

export default Cardo;