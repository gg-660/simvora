import React from 'react';

export default function MetricCard({ title, value }) {
  return (
    <div className="bg-[#1e1e1e] p-4 rounded-lg shadow border border-gray-700">
      <h4 className="text-sm text-gray-400 mb-1">{title}</h4>
      <p className="text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
