"use client";
import React, { useState } from "react";
import { addMedicine } from "@/utils/medicine";
import { FiPlus, FiX, FiCheck } from "react-icons/fi";

interface Medicine {
  name: string;
  composition: string;
  manufacturer: string;
  usage: string;
  precautions: string;
  [key: string]: string;
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
  const [submitting, setSubmitting] = useState(false);

  const handleAddField = () => {
    const fieldName = prompt("Enter the name of the new field:");
    if (fieldName) {
      const sanitized = fieldName.trim();
      if (sanitized) {
        setExtraFields((prev) => ({ ...prev, [sanitized]: "" }));
      }
    }
  };

  const handleRemoveField = (field: string) => {
    const updated = { ...extraFields };
    delete updated[field];
    setExtraFields(updated);
  };

  const handleAddMedicine = async () => {
    if (!medicine.name.trim() || !medicine.composition.trim() || !medicine.manufacturer.trim()) {
      alert("Please fill in all required fields (Name, Composition, Manufacturer).");
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem("auth_token");
      const data = await addMedicine(token!, { ...medicine, ...extraFields });
      onMedicineAdded(data);
      onClose();
    } catch (err) {
      console.error("Error adding medicine:", err);
      alert("Failed to add medicine. Please verify connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
      {/* Modal Container */}
      <div className="bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col relative animate-scale-up">
        {/* Glow corner */}
        <div className="absolute -right-20 -top-20 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        
        {/* Header */}
        <div className="bg-white/5 border-b border-white/5 px-6 py-5 flex justify-between items-center relative z-10 text-left">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Add Custom Medicine</h2>
            <p className="text-xs text-gray-400 mt-0.5">Register new pharmaceutical records locally.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition cursor-pointer"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-grow relative z-10 text-left">
          
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Medicine Name <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Lipitor, Amoxicillin"
              value={medicine.name}
              onChange={(e) => setMedicine({ ...medicine, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition text-xs"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Composition / Chemical formula <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Atorvastatin Calcium"
              value={medicine.composition}
              onChange={(e) => setMedicine({ ...medicine, composition: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition text-xs"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Manufacturer Laboratory <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Pfizer Labs"
              value={medicine.manufacturer}
              onChange={(e) => setMedicine({ ...medicine, manufacturer: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition text-xs"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Indications & Usage
            </label>
            <input
              type="text"
              placeholder="e.g. Used to lower cholesterol levels..."
              value={medicine.usage}
              onChange={(e) => setMedicine({ ...medicine, usage: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition text-xs"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Precautions / Warnings
            </label>
            <textarea
              placeholder="List crucial safety details or precautions..."
              value={medicine.precautions}
              onChange={(e) => setMedicine({ ...medicine, precautions: e.target.value })}
              className="w-full h-20 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition text-xs resize-none"
            />
          </div>

          {/* Dynamic attributes section */}
          {Object.keys(extraFields).length > 0 && (
            <div className="space-y-3 pt-2 border-t border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Custom Attributes</p>
              {Object.keys(extraFields).map((field, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <div className="flex-grow">
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-500 mb-1">{field}</label>
                    <input
                      type="text"
                      placeholder={`Enter ${field} value...`}
                      value={extraFields[field]}
                      onChange={(e) => setExtraFields({ ...extraFields, [field]: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveField(field)}
                    className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl mt-4 transition cursor-pointer"
                    title="Remove Field"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={handleAddField}
            className="flex items-center justify-center gap-1.5 w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <FiPlus size={14} /> Add Custom Field
          </button>
        </div>

        {/* Footer Actions */}
        <div className="bg-white/5 border-t border-white/5 px-6 py-4 flex gap-3 z-10">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAddMedicine}
            disabled={submitting}
            className="flex-grow flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg transition duration-200 transform active:scale-95 disabled:opacity-50"
          >
            <FiCheck size={14} /> {submitting ? "Submitting..." : "Add Record"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMedicineDialog;