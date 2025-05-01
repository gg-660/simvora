

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function CashFlowGraph({ cashFlows }) {
  if (!cashFlows || cashFlows.length === 0) {
    return <p>No cash flow data available.</p>;
  }

  const data = {
    labels: cashFlows.map((_, i) => `Year ${i + 1}`),
    datasets: [
      {
        label: 'Cash Flow ($)',
        data: cashFlows,
        fill: false,
        borderColor: '#4ade80',
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: '#e0e0e0'
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#e0e0e0'
        }
      },
      y: {
        ticks: {
          color: '#e0e0e0'
        }
      }
    }
  };

  return (
    <div className="bg-[#1e1e1e] p-6 rounded-lg shadow-md">
      <Line data={data} options={options} />
    </div>
  );
}