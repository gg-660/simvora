import React from 'react';

export default function MetricCard({ label, value, letter, onExpand }) {
  const getGradeStyle = (grade) => {
    switch (grade) {
      case 'A': return 'bg-green-500/20 text-green-300 hover:bg-green-500/30';
      case 'B': return 'bg-yellow-400/20 text-yellow-300 hover:bg-yellow-400/30';
      case 'C': return 'bg-orange-400/20 text-orange-300 hover:bg-orange-400/30';
      case 'D': return 'bg-red-500/20 text-red-300 hover:bg-red-500/30';
      case 'F': return 'bg-red-700/30 text-red-500 hover:bg-red-700/40';
      default: return 'bg-gray-700 text-white';
    }
  };

  return (
    <div className="bg-[#2a2a2a] p-3 rounded text-gray-200">
      <div className="text-sm text-gray-400">{label}</div>
      <div className="text-lg font-bold">{value}</div>
      <button
        onClick={onExpand}
        className={`mt-2 inline-block border border-gray-600 text-sm font-medium py-1 px-2 rounded transition-colors ${getGradeStyle(letter)}`}
      >
        Grade: {letter}
      </button>
    </div>
  );
}