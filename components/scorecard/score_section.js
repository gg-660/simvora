import React from 'react';
import MetricCard from './metric_card';
import { getNumericScore, getLetterGrade, formatMetricValue, getMetricValue } from '@/lib/scoreUtils';

export default function ScoreSection({ title, metrics, selectedDeal, thresholds, expandedMetric, setExpandedMetric }) {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const rawValue = getMetricValue(selectedDeal, metric.key);
          const thresholdsForMetric = thresholds[metric.key];
          const invert = metric.invert || false;

          let metricValue = rawValue;
          const normalizeByInvestment = [
            'appreciation', 'finalValue', 'totalCashFlow', 'averageCashFlow',
            'finalEquity', 'totalCFSim', 'averageCFSim', 'finalEquitySim',
            'worstCashFlow', 'worstCFSim'
          ].includes(metric.key);
          const base = Number(selectedDeal?.purchase_price);
          if (normalizeByInvestment && !isNaN(base) && base > 0) {
            metricValue = Number(rawValue) / base;
          }

          const score = getNumericScore(metricValue, thresholdsForMetric, invert);
          const letter = score !== null ? getLetterGrade(score) : 'N/A';

          return (
            <MetricCard
              key={metric.key}
              label={metric.label}
              value={formatMetricValue(metric.key, rawValue, metricValue)}
              letter={letter}
              onExpand={() =>
                setExpandedMetric(expandedMetric === metric.key ? null : metric.key)
              }
              isExpanded={expandedMetric === metric.key}
            />
          );
        })}
      </div>
    </div>
  );
}