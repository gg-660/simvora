

import React from 'react';

export default function SectionWeightModal({ weights, onUpdate, onClose }) {
  const handleChange = (key, value) => {
    const updated = { ...weights, [key]: parseFloat(value) };
    onUpdate(updated);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-[#1e1e1e] rounded p-6 w-full max-w-md text-white space-y-4">
        <h2 className="text-lg font-semibold">Edit Section Weights</h2>
        {Object.entries(weights).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <label className="capitalize text-gray-300">{key.replace(/([A-Z])/g, ' $1')}</label>
            <input
              type="number"
              step="any"
              className="bg-[#2a2a2a] text-white border border-gray-600 rounded px-3 py-1 w-32"
              value={value}
              onChange={(e) => handleChange(key, e.target.value)}
            />
          </div>
        ))}
        <div className="flex justify-end space-x-2 pt-4">
          <button
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}