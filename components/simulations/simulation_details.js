import React from 'react';
import MetricCard from './metric_card';
import { Doughnut } from 'react-chartjs-2';

export default function SimulationDetails({ selectedDeal, metrics, yearlySimulationResults, assumptions }) {
  if (!selectedDeal) {
    return (
      <div className="p-8 text-center text-gray-400">
        <h2 className="text-xl font-semibold mb-2">No Deal Selected</h2>
        <p>Please select a deal from the sidebar to view details.</p>
      </div>
    );
  }

  const dscrValues = yearlySimulationResults.map(y => y.dscr).filter(Boolean);
  const failedDSCR = dscrValues.filter(v => v < 1.2).length;
  const passedDSCR = dscrValues.length - failedDSCR;

  const dscrData = {
    labels: ['DSCR < 1.2', 'DSCR ≥ 1.2'],
    datasets: [
      {
        data: [failedDSCR, passedDSCR],
        backgroundColor: ['#ef4444', '#10b981'],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="p-6 space-y-12">
      <h2 className="text-2xl font-bold text-white">{selectedDeal.deal_name}</h2>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <MetricCard title="Purchase Price" value={`$${metrics.purchasePrice?.toLocaleString?.() ?? 'N/A'}`} />
        <MetricCard title="Monthly Rent" value={`$${metrics.monthlyRent?.toLocaleString?.() ?? 'N/A'}`} />
        <MetricCard title="Monthly Payment" value={`$${metrics.monthlyPayment?.toLocaleString?.() ?? 'N/A'}`} />
        <MetricCard title="Avg Cash Flow" value={`$${metrics.averageCashFlow?.toLocaleString?.() ?? 'N/A'}`} />
      </div>

      {/* Histograms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <MetricCard title="IRR Cash Flow" value={metrics.irrCashFlow != null ? `${metrics.irrCashFlow.toFixed?.(1)}%` : 'N/A'} />
        <MetricCard title="IRR Total" value={metrics.irrTotal != null ? `${metrics.irrTotal.toFixed?.(1)}%` : 'N/A'} />
        <MetricCard title="Final Value" value={`$${metrics.finalValue?.toLocaleString?.() ?? 'N/A'}`} />
        <MetricCard title="Worst Cash Flow" value={`$${metrics.worstCashFlow?.toLocaleString?.() ?? 'N/A'}`} />
      </div>

      {/* Sharpe & IRR Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <MetricCard title="Sharpe Ratio" value={typeof metrics.sharpeRatio === 'number' ? metrics.sharpeRatio.toFixed?.(2) : 'N/A'} />
        <div className="grid grid-cols-3 gap-4">
          <MetricCard title="IRR Min" value={metrics.irrMin != null ? `${metrics.irrMin.toFixed?.(1)}%` : 'N/A'} />
          <MetricCard title="IRR Avg" value={metrics.irrAvg != null ? `${metrics.irrAvg.toFixed?.(1)}%` : 'N/A'} />
          <MetricCard title="IRR Max" value={metrics.irrMax != null ? `${metrics.irrMax.toFixed?.(1)}%` : 'N/A'} />
        </div>
      </div>

      {/* DSCR Donut Chart */}
      <div className="bg-[#1e1e1e] p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-white mb-4 text-center">DSCR Risk Profile</h3>
        <div className="max-w-xs mx-auto">
          <Doughnut data={dscrData} />
        </div>
      </div>

      {/* Risk Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="DSCR Fail Years" value={metrics.dscrFailYears} />
        <MetricCard title="Lowest DSCR" value={metrics.lowestDSCR != null ? metrics.lowestDSCR.toFixed?.(2) : 'N/A'} />
        <MetricCard title="Max Drawdown" value={metrics.maxDrawdownPercent != null ? `${metrics.maxDrawdownPercent.toFixed?.(1)}%` : 'N/A'} />
      </div>
    </div>
  );
}