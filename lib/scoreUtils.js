// lib/scoreUtils.js

export const getNumericScore = (value, thresholds, invert = false) => {
    if (value === 'N/A') return null;
    const num = parseFloat(value);
    if (isNaN(num)) return null;
  
    if (invert) {
      if (num <= thresholds.grade_a) return 95;
      if (num <= thresholds.grade_b) return 85;
      if (num <= thresholds.grade_c) return 75;
      if (num <= thresholds.grade_d) return 65;
      return 55;
    } else {
      if (num >= thresholds.grade_a) return 95;
      if (num >= thresholds.grade_b) return 85;
      if (num >= thresholds.grade_c) return 75;
      if (num >= thresholds.grade_d) return 65;
      return 55;
    }
  };
  
  export const getLetterGrade = (score) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };
  
// Optional placeholder if you want to move these in later
export const formatMetricValue = (key, value) => value;
export const getMetricValue = (key) => value;

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