export const getGradeColor = (grade) => {
  switch (grade) {
    case 'A': return 'text-green-300 bg-green-500/20';
    case 'B': return 'text-yellow-300 bg-yellow-400/20';
    case 'C': return 'text-orange-300 bg-orange-400/20';
    case 'D': return 'text-red-300 bg-red-500/20';
    case 'F': return 'text-red-500 bg-red-700/30';
    default: return 'text-gray-300 bg-gray-700';
  }
};

import React from 'react';

export default function OverallScoreCard({ overallScore, overallGrade }) {
  return (
    <div className={`p-4 rounded-lg text-center h-full flex flex-col justify-between border border-gray-600 font-semibold ${getGradeColor(overallGrade)}`}>
      <div className="text-sm font-bold text-white">Overall Score</div>
      <div className="text-4xl font-bold mt-1">{overallScore.toFixed(0)}%</div>
      <div className="text-sm font-semibold">Grade: {overallGrade}</div>
    </div>
  );
}