

import React from 'react';

export default function MetricSettingsModal({ metricKey, thresholds, onUpdate, onClose }) {
  const handleChange = (grade, value) => {
    const updated = { ...thresholds[metricKey], [grade]: parseFloat(value) };
    onUpdate(metricKey, updated);
  };

  const grades = ['grade_a', 'grade_b', 'grade_c', 'grade_d'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-[#1e1e1e] rounded p-6 w-full max-w-md text-white space-y-4">
        <h2 className="text-lg font-semibold">Edit Thresholds: {metricKey}</h2>
        {grades.map((grade) => (
          <div key={grade} className="flex items-center justify-between">
            <label className="capitalize text-gray-300">{grade.replace('grade_', 'Grade ')}</label>
            <input
              type="number"
              step="any"
              className="bg-[#2a2a2a] text-white border border-gray-600 rounded px-3 py-1 w-32"
              value={thresholds[metricKey]?.[grade] ?? ''}
              onChange={(e) => handleChange(grade, e.target.value)}
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