"use client";
import React, { useState } from "react";
import { addMedicine } from "@/utils/medicine"; // Replace with your actual API utility function

interface Medicine {
  name: string;
  composition: string;
  manufacturer: string;
  usage: string;
  precautions: string;
  [key: string]: string; // Allows additional fields dynamically
}

interface AddMedicineDialogProps {
  onClose: () => void;
  onMedicineAdded: (medicine: Medicine) => void;
}

const AddMedicineDialog: React.FC<AddMedicineDialogProps> = ({
  onClose,
  onMedicineAdded,
}) => {
  const [medicine, setMedicine] = useState<Medicine>({
    name: "",
    composition: "",
    manufacturer: "",
    usage: "",
    precautions: "",
  });

  const [extraFields, setExtraFields] = useState<{ [key: string]: string }>({});

  const handleAddField = () => {
    const fieldName = prompt("Enter the name of the new field:");
    if (fieldName) {
      setExtraFields((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  const handleAddMedicine = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!medicine.name || !medicine.composition || !medicine.manufacturer) {
        alert("Please fill in all required fields.");
        return;
      }
      const data = await addMedicine(token!, { ...medicine, ...extraFields });
      onMedicineAdded(data);
      onClose();
    } catch (err) {
      console.error("Error adding medicine:", err);
      alert("Failed to add medicine. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
      <div className="bg-gray-900 rounded-lg shadow-lg w-96 max-h-[90vh] overflow-y-auto">
        <div className="bg-gray-800 text-white p-4 rounded-t-lg">
          <h2 className="text-lg font-bold">Add New Medicine</h2>
        </div>
        <div className="p-6">
          <input
            type="text"
            placeholder="Medicine Name"
            value={medicine.name}
            onChange={(e) =>
              setMedicine({ ...medicine, name: e.target.value })
            }
            className="w-full mb-4 p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-gray-400"
          />
          <input
            type="text"
            placeholder="Composition"
            value={medicine.composition}
            onChange={(e) =>
              setMedicine({ ...medicine, composition: e.target.value })
            }
            className="w-full mb-4 p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-gray-400"
          />
          <input
            type="text"
            placeholder="Manufacturer"
            value={medicine.manufacturer}
            onChange={(e) =>
              setMedicine({ ...medicine, manufacturer: e.target.value })
            }
            className="w-full mb-4 p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-gray-400"
          />
          <input
            type="text"
            placeholder="Usage"
            value={medicine.usage}
            onChange={(e) =>
              setMedicine({ ...medicine, usage: e.target.value })
            }
            className="w-full mb-4 p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-gray-400"
          />
          <textarea
            placeholder="Precautions"
            value={medicine.precautions}
            onChange={(e) =>
              setMedicine({ ...medicine, precautions: e.target.value })
            }
            className="w-full mb-4 p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-gray-400"
          />
          <h3 className="text-md font-semibold mb-2">Additional Fields</h3>
          {Object.keys(extraFields).map((field, index) => (
            <input
              key={index}
              type="text"
              placeholder={field}
              value={extraFields[field]}
              onChange={(e) =>
                setExtraFields({ ...extraFields, [field]: e.target.value })
              }
              className="w-full mb-2 p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-gray-400"
            />
          ))}
          <button
            onClick={handleAddField}
            className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Add Field
          </button>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAddMedicine}
              className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMedicineDialog;

/*
import AddMedicineDialog from "@/components/AddMedicineDialog";

const ParentComponent = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleMedicineAdded = (medicine) => {
    console.log("New medicine added:", medicine);
    // Update your state or perform any action with the new medicine
  };

  return (
    <>
      <button onClick={() => setIsDialogOpen(true)}>Add Medicine</button>
      {isDialogOpen && (
        <AddMedicineDialog
          onClose={() => setIsDialogOpen(false)}
          onMedicineAdded={handleMedicineAdded}
        />
      )}
    </>
  );
};
*/