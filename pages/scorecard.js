import Navbar from '@/components/Navbar';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

// Normalize metrics for scorecard calculation
const normalizeMetrics = (rawMetrics, deal) => {
  const purchasePrice = deal?.purchase_price || 1;
  return {
    irrCashFlow: rawMetrics.irrCashFlow / 100,
    irrTotal: rawMetrics.irrTotal / 100,
    appreciation: rawMetrics.appreciation / purchasePrice,
    finalValue: rawMetrics.finalValue / purchasePrice,
    totalCashFlow: rawMetrics.totalCashFlow / purchasePrice,
    averageCashFlow: rawMetrics.averageCashFlow / purchasePrice,
    worstCashFlow: rawMetrics.worstCashFlow / purchasePrice,
    equityMultiple: rawMetrics.equityMultiple,
    sharpeRatio: rawMetrics.sharpeRatio,
    maxLtv: rawMetrics.maxLtv,
    averageDscr: rawMetrics.averageDscr,
    minDscr: rawMetrics.minDscr,
    breakEvenEquity: rawMetrics.breakEvenYear,
    yearsDscrBelow1_2: rawMetrics.yearsDscrBelow1_2,
    yearsDscrBelow1_2_sim: rawMetrics.yearsDscrBelow1_2_sim ?? rawMetrics.yearsDscrBelow1_2,
    maxDrawdownSim: rawMetrics.maxDrawdownSim,
    negativeCashFlowYears: rawMetrics.negativeCashFlowYears,
    finalEquity: rawMetrics.finalEquity ?? (
      rawMetrics.finalValue && rawMetrics.equityMultiple
        ? rawMetrics.finalValue / rawMetrics.equityMultiple
        : null
    ),
  };
};

// Utility function to calculate metric score (A=4, B=3, C=2, D=1, F=0)
const calculateMetricScore = (value, thresholds) => {
  if (value == null || thresholds == null) return 0;
  if (value >= thresholds.grade_a) return 4;
  if (value >= thresholds.grade_b) return 3;
  if (value >= thresholds.grade_c) return 2;
  if (value >= thresholds.grade_d) return 1;
  return 0;
};
import { supabase } from '@/lib/supabaseClient';

// Calculate total weighted score out of 400
const calculateWeightedScore = (weights, metricValues, thresholds, defaultThresholdMap, defaultThresholds) => {
  let total = 0;
  Object.entries(weights).forEach(([group, metrics]) => {
    Object.entries(metrics).forEach(([key, weight]) => {
      const val = metricValues[key];
      const thresh = thresholds[key] || defaultThresholdMap[key] || defaultThresholds;
      // 🔍 Add debug output
      console.log(`Scoring ${key}: value = ${val}, thresholds =`, thresh);
      const score = calculateMetricScore(val, thresh);
      total += weight * score;
    });
  });
  return total;
};

export default function Scorecard() {
  // Preset state
  const [presets, setPresets] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [newPresetName, setNewPresetName] = useState('');
  const [userDeals, setUserDeals] = useState([]);
  const router = useRouter();
  // Extract dealId from query and find selectedDeal
  const { dealId } = router.query;
  // Ensure selectedDeal is found even if deal.id is a UUID and dealId is a string
  const selectedDeal = userDeals.find(deal => deal.id?.toString() === dealId);

  useEffect(() => {
    const fetchDeals = async () => {
      const {
        data: sessionData,
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !sessionData?.session?.user?.id) {
        console.error('Session fetch error:', sessionError);
        return;
      }

      const userId = sessionData.session.user.id;

      const { data: deals, error: dealError } = await supabase
        .from('deals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (dealError) {
        console.error('Deals fetch error:', dealError);
      } else {
        setUserDeals(deals);
      }
    };

    fetchDeals();
  }, []);

  // Load presets from Supabase on mount
  useEffect(() => {
    const fetchPresets = async () => {
      const { data: user } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('Scorecard Presets')
        .select('*')
        .eq('user_id', user?.data?.user?.id);
      if (!error && data) {
        setPresets(data);
      }
    };
    fetchPresets();
  }, []);

  // Save a new preset
  const savePreset = async () => {
    const { data: user } = await supabase.auth.getUser();
    const payload = {
      user_id: user?.data?.user?.id,
      name: newPresetName,
      thresholds,
      weights,
    };
    await supabase.from('Scorecard Presets').insert(payload);
    setNewPresetName('');
    // Refresh presets after insert
    const { data, error } = await supabase
      .from('Scorecard Presets')
      .select('*')
      .eq('user_id', user?.data?.user?.id);
    if (!error && data) {
      setPresets(data);
    }
  };

  // Load a selected preset
  const loadPreset = (preset) => {
    setThresholds(preset.thresholds);
    setWeights(preset.weights);
    setSelectedPreset(preset);
  };
  const defaultThresholdMap = {
    // IRR Metrics (updated: IRR cash flow more lenient, IRR/property value stricter)
    irrCashFlow: { grade_a: 0.12, grade_b: 0.09, grade_c: 0.06, grade_d: 0.04 },
    irrTotal: { grade_a: 0.25, grade_b: 0.20, grade_c: 0.15, grade_d: 0.10 },
    irrSpread: { grade_a: 0.05, grade_b: 0.08, grade_c: 0.10, grade_d: 0.12 },
    medianIrr: { grade_a: 0.18, grade_b: 0.15, grade_c: 0.12, grade_d: 0.08 },
    irr5PercentThreshold: { grade_a: 85, grade_b: 75, grade_c: 60, grade_d: 45 },
    irr5: { grade_a: 0.12, grade_b: 0.10, grade_c: 0.07, grade_d: 0.04 },
    irr10: { grade_a: 0.13, grade_b: 0.11, grade_c: 0.08, grade_d: 0.05 },
    irr15: { grade_a: 0.14, grade_b: 0.12, grade_c: 0.09, grade_d: 0.06 },
    irr20: { grade_a: 0.15, grade_b: 0.13, grade_c: 0.10, grade_d: 0.07 },
    irr25: { grade_a: 0.16, grade_b: 0.14, grade_c: 0.11, grade_d: 0.08 },

    // Cash Flow Metrics (stricter)
    totalCashFlow: { grade_a: 0.75, grade_b: 0.6, grade_c: 0.45, grade_d: 0.3 },
    averageCashFlow: { grade_a: 0.03, grade_b: 0.02, grade_c: 0.01, grade_d: 0.005 },
    worstCashFlow: { grade_a: 0, grade_b: -0.01, grade_c: -0.02, grade_d: -0.03 },
    negativeCashFlowYears: { grade_a: 0, grade_b: 1, grade_c: 3, grade_d: 5 },
    sdCashFlow: { grade_a: 0.002, grade_b: 0.004, grade_c: 0.006, grade_d: 0.008 },

    // Leverage
    maxLtv: { grade_a: 0.75, grade_b: 0.8, grade_c: 0.85, grade_d: 0.90 }, // more lenient
    averageLtv: { grade_a: 0.65, grade_b: 0.7, grade_c: 0.75, grade_d: 0.8 },
    finalLtv: { grade_a: 0.65, grade_b: 0.7, grade_c: 0.75, grade_d: 0.8 },
    debtYield: { grade_a: 0.12, grade_b: 0.10, grade_c: 0.08, grade_d: 0.06 },
    interestCoverageRatio: { grade_a: 2.0, grade_b: 1.8, grade_c: 1.5, grade_d: 1.2 },

    // Drawdown
    maxDrawdownEquity: { grade_a: 0.10, grade_b: 0.15, grade_c: 0.22, grade_d: 0.3 },
    maxDrawdownValue: { grade_a: 0.10, grade_b: 0.15, grade_c: 0.22, grade_d: 0.3 },
    maxDrawdownSim: { grade_a: 0.15, grade_b: 0.22, grade_c: 0.28, grade_d: 0.35 }, // more lenient

    // Equity Performance (stricter)
    breakEvenEquity: { grade_a: 5, grade_b: 7, grade_c: 9, grade_d: 12 },
    finalEquity: { grade_a: 0.5, grade_b: 0.4, grade_c: 0.3, grade_d: 0.2 },
    cumulativeEquityBuilt: { grade_a: 1.5, grade_b: 1.3, grade_c: 1.1, grade_d: 0.9 },
    equityMultiple: { grade_a: 2.0, grade_b: 1.75, grade_c: 1.5, grade_d: 1.25 },
    annualizedReturn: { grade_a: 0.12, grade_b: 0.10, grade_c: 0.08, grade_d: 0.06 },

    // DSCR Risk
    yearsDscrBelow1_2: { grade_a: 0, grade_b: 1, grade_c: 3, grade_d: 6 },
    yearsDscrBelow1_2_sim: { grade_a: 0, grade_b: 1, grade_c: 3, grade_d: 5 },
    minDscr: { grade_a: 1.35, grade_b: 1.25, grade_c: 1.15, grade_d: 1.05 },

    // Property Value (stricter)
    finalValue: { grade_a: 2.5, grade_b: 2.3, grade_c: 2.1, grade_d: 1.9 },
    appreciation: { grade_a: 1.5, grade_b: 1.2, grade_c: 1.0, grade_d: 0.8 },

    // Sharpe & Risk (stricter)
    averageDscr: { grade_a: 1.5, grade_b: 1.3, grade_c: 1.1, grade_d: 0.9 },
    sharpeRatio: { grade_a: 2.0, grade_b: 1.5, grade_c: 1.0, grade_d: 0.5 },
  };

  // Finalized weights: all values are whole numbers and the total equals 100%
  // Each metric is individually listed; ordering and values match the provided screenshot.
  const initialWeights = selectedDeal?.scorecard_weights || {
    appreciationIrr: { irrCashFlow: 5, irrTotal: 5, appreciation: 5, finalValue: 5 },
    cashFlow: { totalCashFlow: 5, averageCashFlow: 5, equityMultiple: 3, negativeCashFlowYears: 2 },
    risk: { averageDscr: 3, yearsDscrBelow1_2: 3, sharpeRatio: 7, breakEvenEquity: 2 },
    simulationOne: { minDscr: 4, yearsDscrBelow1_2_sim: 8, maxLtv: 5, maxDrawdownSim: 3 },
    simulationTwo: { finalValue: 4, appreciation: 2, finalEquity: 2, equityMultiple: 2 },
    simulationThree: { irrCashFlow: 5, irrTotal: 5, sharpeRatio: 7, worstCashFlow: 3 },
  };
  const [weights, setWeights] = useState(initialWeights);

  const [thresholdModalOpen, setThresholdModalOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('');
  const [thresholds, setThresholds] = useState({});
  const [editingThresholds, setEditingThresholds] = useState({
    grade_a: 90,
    grade_b: 80,
    grade_c: 70,
    grade_d: 60,
  });

  const defaultThresholds = {
    grade_a: 90,
    grade_b: 80,
    grade_c: 70,
    grade_d: 60,
  };

  // Use metrics from selectedDeal, normalized, or null if not present
  const metricValues = selectedDeal?.metrics ? normalizeMetrics(selectedDeal.metrics, selectedDeal) : null;
  const finalScore = metricValues
    ? calculateWeightedScore(weights, metricValues, thresholds, defaultThresholdMap, defaultThresholds)
    : null;

  useEffect(() => {
    if (selectedMetric) {
      const defaults = defaultThresholdMap[selectedMetric] || { grade_a: 90, grade_b: 80, grade_c: 70, grade_d: 60 };
      setEditingThresholds(defaults);
    }
  }, [selectedMetric]);

  useEffect(() => {
    if (selectedDeal?.scorecard_thresholds) {
      setThresholds(selectedDeal.scorecard_thresholds);
      return;
    }

    const fetchThresholds = async () => {
      const { data, error } = await supabase
        .from('Scorecard Thresholds')
        .select('*')
        .eq('user_id', supabase.auth.getUser()?.data?.user?.id);

      if (!error && data) {
        const mapped = {};
        data.forEach(row => {
          mapped[row.metric_key] = {
            grade_a: row.grade_a,
            grade_b: row.grade_b,
            grade_c: row.grade_c,
            grade_d: row.grade_d,
          };
        });
        setThresholds(mapped);
      }
    };

    fetchThresholds();
  }, [selectedDeal]);

  const saveThreshold = async (metricKey, newThresholds) => {
    const { data: existing, error: fetchError } = await supabase
      .from('Scorecard Thresholds')
      .select('id')
      .eq('user_id', supabase.auth.getUser()?.data?.user?.id)
      .eq('metric_key', metricKey)
      .single();

    const payload = {
      user_id: supabase.auth.getUser()?.data?.user?.id,
      metric_key: metricKey,
      grade_a: newThresholds.grade_a,
      grade_b: newThresholds.grade_b,
      grade_c: newThresholds.grade_c,
      grade_d: newThresholds.grade_d,
    };

    const { error: upsertError } = existing
      ? await supabase.from('Scorecard Thresholds').update(payload).eq('id', existing.id)
      : await supabase.from('Scorecard Thresholds').insert(payload);

    if (!upsertError) {
      setThresholds(prev => ({
        ...prev,
        [metricKey]: newThresholds,
      }));
      // Save thresholds to deal if editing a specific deal
      if (selectedDeal?.id) {
        const newMap = {
          ...thresholds,
          [metricKey]: newThresholds,
        };

        await supabase
          .from('deals')
          .update({ scorecard_thresholds: newMap })
          .eq('id', selectedDeal.id);
      }
    }
  };

  const handleWeightChange = (group, key, value) => {
    const newWeights = {
      ...weights,
      [group]: {
        ...weights[group],
        [key]: value === '' ? '' : Number(value),
      },
    };
    setWeights(newWeights);

    // Auto-save to Supabase
    if (selectedDeal?.id) {
      supabase
        .from('deals')
        .update({ scorecard_weights: newWeights })
        .eq('id', selectedDeal.id)
        .then(({ error }) => {
          if (error) console.error('Failed to save weights', error);
        });
    }
  };

  const descriptions = {
    maxDrawdownSim: 'Largest drop in property value or equity during simulation.',
    // Projection-based
    totalCashFlow: 'Sum of all net cash flows over the investment period.',
    averageCashFlow: 'Average annual cash flow.',
    worstCashFlow: 'Worst annual cash flow as a percent of purchase price (relative to value).',
    negativeCashFlowYears: 'Number of years with negative cash flow.',
    sdCashFlow: 'Volatility of annual cash flow.',
    debtYield: 'NOI divided by loan amount, a lender risk measure.',
    interestCoverageRatio: 'NOI divided by interest expense, measures ability to pay interest on debt.',
    aggregatedDrawdown: 'Largest drop in either property or equity value during simulations.',
    breakEvenEquity: 'Year equity + payouts match original investment.',
    finalEquity: 'Ending equity at the end of simulation.',
    cumulativeEquityBuilt: 'Total equity built over the hold.',
    equityMultiple: 'Total returns divided by initial investment.',
    annualizedReturn: 'Average compounded annual return.',
    yearsDscrBelow1_2: 'Years DSCR < 1.2 — loan risk indicator.',
    yearsDscrBelow1_2_sim: 'Years with DSCR below 1.2 in simulation.',
    minDscr: 'Lowest DSCR observed in simulation.',
    // Simulation-based
    averageDscr: 'Average DSCR across all simulation years.',
    irrCashFlow: 'IRR from cash flows only (simulated).',
    irrTotal: 'IRR including appreciation (simulated).',
    sharpeRatio: 'Risk-adjusted return (simulated).',
    finalValue: 'Final property value at end of simulation.',
    appreciation: 'Total property appreciation in simulation.',
    equityMultiple: 'Total returns divided by initial investment.',
    maxLtv: 'Highest loan-to-value ratio during simulation.',
    maxDrawdownValue: 'Largest drop in property value during simulation.',
    maxDrawdownEquity: 'Largest drop in equity during simulation.',
  };

  const renderGroup = (groupName, group) => {
    // Remove "Total: xx%" from title, add section-level percentage and grade
    const totalWeight = Object.values(group).reduce((a, b) => a + b, 0);
    let groupScore = 0;
    Object.entries(group).forEach(([key, weight]) => {
      const val = metricValues?.[key] ?? 0;
      const thresh = thresholds[key] || defaultThresholdMap[key] || defaultThresholds;
      const score = calculateMetricScore(val, thresh);
      groupScore += weight * score;
    });
    const percent = totalWeight === 0 ? 0 : (groupScore / (totalWeight * 4)) * 100;

    let grade = 'F';
    let color = 'text-red-500 border border-red-500 bg-red-900/20';
    if (percent >= 90) { grade = 'A'; color = 'text-green-400 border border-green-400 bg-green-900/20'; }
    else if (percent >= 80) { grade = 'B'; color = 'text-lime-400 border border-lime-400 bg-lime-900/20'; }
    else if (percent >= 70) { grade = 'C'; color = 'text-yellow-300 border border-yellow-300 bg-yellow-900/20'; }
    else if (percent >= 60) { grade = 'D'; color = 'text-orange-300 border border-orange-300 bg-orange-900/20'; }

    // Render display name for groupName
    let displayGroupName = {
      appreciationIrr: 'IRR & Appreciation',
      cashFlow: 'Cash Flow Metrics',
      risk: 'Risk Metrics',
      simulationOne: 'Sim: Risk Metrics',
      simulationTwo: 'Sim: Property & Equity',
      simulationThree: 'Sim: IRR & Cash Flow',
    }[groupName] || groupName;
    if (groupName === 'yearlyIrr') {
      displayGroupName = 'Yearly IRR';
    }
    return (
      <div className="bg-[#1e1e1e] p-4 rounded-md shadow-md h-full relative">
        <h2 className="text-white text-xl font-semibold mb-2 capitalize">{displayGroupName}</h2>
        <div className={`absolute top-4 right-4 rounded px-2 py-1 text-sm font-semibold ${color}`}>
          {grade} ({percent.toFixed(1)}%)
        </div>
        {Object.entries(group).map(([key, val]) => (
          <div key={key} className="mb-4">
            <button
              type="button"
              className="block text-left text-sm mb-2 px-2 py-1 bg-[#2a2a2a] text-white rounded border border-gray-600 hover:bg-[#3a3a3a]"
              onClick={() => {
                setSelectedMetric(key);
                setThresholdModalOpen(true);
              }}
            >
              {key
                .replace('yearsDscrBelow1_2_sim', 'Years DSCR < 1.2 (Sim)')
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase())
                .replace('Dscr', 'DSCR')
                .replace('Ltv', 'LTV')
                .replace('Irr', 'IRR')
                .replace('Sd', 'Standard Deviation')
                .replace('Equity Built', 'Equity Built')
                .replace('Sharpe Ratio', 'Sharpe Ratio')
                .replace('Cash Flow', 'Cash Flow')
                .replace('5 Percent Threshold', '5% IRR Threshold')
                .replace('AggregatedDrawdown', 'Drawdown')}
            </button>
            <input
              type="number"
              className="w-full p-2 bg-[#2a2a2a] text-white rounded border border-gray-600"
              value={val ?? ''}
              readOnly
            />
            <p className="text-sm text-gray-500 mt-1">{descriptions[key]}</p>
            {val === '' && (
              <p className="text-sm text-red-500 mt-1">Field must be a numeric value: 1-100</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const hasAnyEmpty = Object.values(weights).some(group =>
    Object.values(group).some(val => val === '')
  );

  const totalWeight = hasAnyEmpty
    ? '–'
    : Object.values(weights).reduce((sum, group) => {
        return (
          sum +
          Object.values(group).reduce((a, b) => a + (typeof b === 'number' && !isNaN(b) ? b : 0), 0)
        );
      }, 0);

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen relative bg-[#121212] text-gray-300">
        {/* Sidebar */}
        <aside
          className="p-6 z-30 bg-[#1e1e1e] text-gray-300"
          style={{
            position: 'fixed',
            top: '4rem',
            left: 0,
            width: '20rem',
            height: 'calc(100vh - 4rem)',
            boxShadow: '4px 0px 6px rgba(0, 0, 0, 0.1)',
            borderRight: '2px solid #2a2a2a',
            overflowY: 'auto',
            boxSizing: 'border-box',
          }}
        >
          {/* Preset management section */}
          <div className="space-y-4 mb-6">
            <h2 className="text-lg font-semibold text-white">Scorecard Presets</h2>
            <div className="space-y-2">
              <input
                type="text"
                className="w-full p-2 bg-[#2a2a2a] text-white border border-gray-600 rounded"
                placeholder="New preset name"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
              />
              <button
                className="w-full p-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                onClick={savePreset}
              >
                Save Preset
              </button>
            </div>
            {/* 
            <div className="space-y-2">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => loadPreset(preset)}
                  className={`w-full text-left p-2 rounded ${
                    selectedPreset?.id === preset.id ? 'bg-blue-700' : 'bg-[#2a2a2a]'
                  } hover:bg-blue-800 text-white border border-gray-600`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
            */}
            <div className="grid grid-cols-1 gap-4">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  className={`p-4 rounded-md shadow border cursor-pointer ${
                    selectedPreset?.id === preset.id
                      ? 'bg-blue-800 border-blue-400 ring-2 ring-blue-300'
                      : 'bg-[#2a2a2a] border-[#333] hover:bg-[#3a3a3a]'
                  }`}
                  onClick={() => loadPreset(preset)}
                >
                  <h3 className="text-white font-semibold text-lg mb-1">{preset.name}</h3>
                  <p className="text-gray-400 text-sm">Click to load preset</p>
                </div>
              ))}
            </div>
          </div>
          {/* Your Deals section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Your Deals</h2>
            <div className="space-y-3">
              {userDeals.map((deal) => (
                <div
                  key={deal.id}
                  onClick={() => router.push(`/scorecard?dealId=${deal.id}`)}
                  className={`cursor-pointer p-4 border rounded-md transition-all duration-200 ${
                    router.query.dealId === deal.id
                      ? 'bg-blue-800 border-blue-400 ring-2 ring-blue-300'
                      : 'bg-[#232323] border-[#333] hover:bg-[#2c2c2c]'
                  }`}
                >
                  <p className="text-md font-semibold text-white truncate">{deal.deal_name}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6" style={{ marginLeft: '20rem' }}>
          <div className="flex items-center justify-between gap-4 mb-6">
            {(() => {
              if (!Number.isFinite(finalScore)) return null;
              const percent = (finalScore / 400) * 100;
              let grade = 'F';
              let color = 'text-red-500 border border-red-500 bg-red-900/20';
              if (percent >= 90) { grade = 'A'; color = 'text-green-400 border border-green-400 bg-green-900/20'; }
              else if (percent >= 80) { grade = 'B'; color = 'text-lime-400 border border-lime-400 bg-lime-900/20'; }
              else if (percent >= 70) { grade = 'C'; color = 'text-yellow-300 border border-yellow-300 bg-yellow-900/20'; }
              else if (percent >= 60) { grade = 'D'; color = 'text-orange-300 border border-orange-300 bg-orange-900/20'; }

              return (
                <div className={`rounded-md p-4 w-[180px] text-center shadow-md font-semibold text-xl ${color}`}>
                  <div className="flex items-center justify-center gap-6">
                    <span className="text-3xl font-extrabold tracking-tight">{grade}</span>
                    <span className="text-sm font-semibold">({percent.toFixed(1)}%)</span>
                  </div>
                </div>
              );
            })()}

            <h2 className="text-white text-2xl font-bold text-center">Create Scorecard</h2>

            <div
              className={`rounded-md p-4 w-[180px] text-center shadow-md font-semibold text-xl ${
                totalWeight !== 100
                  ? 'text-red-500 border border-red-500 bg-[#1e1e1e]'
                  : 'text-green-400 border border-green-400 bg-green-900/20'
              }`}
            >
              {Number.isFinite(totalWeight) ? `${totalWeight}% / 100%` : '–'}
            </div>
          </div>
          {/* Category weights summary row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {Object.entries(weights).map(([groupName, group]) => {
              const hasEmpty = Object.values(group).some(val => val === '');
              const total = hasEmpty ? '–' : Object.values(group).reduce((a, b) => a + b, 0);
              // Display name for groupName
              let displayGroupName = {
                appreciationIrr: 'IRR & Appreciation',
                cashFlow: 'Cash Flow Metrics',
                risk: 'Risk Metrics',
                simulationOne: 'Sim: Risk Metrics',
                simulationTwo: 'Sim: Property & Equity',
                simulationThree: 'Sim: IRR & Cash Flow',
              }[groupName] || groupName;
              return (
                <div key={groupName} className="bg-[#2b2b2b] p-3 rounded-md shadow-sm text-center">
                  <h3 className="text-sm font-medium text-gray-300 capitalize">{displayGroupName}</h3>
                  <p className="text-lg font-bold text-white">{total}%</p>
                </div>
              );
            })}
          </div>

          {/* Three metric sections side by side in a single row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-min">
            <div>{renderGroup('appreciationIrr', weights.appreciationIrr)}</div>
            <div>{renderGroup('cashFlow', weights.cashFlow)}</div>
            <div>{renderGroup('risk', weights.risk)}</div>
          </div>
          {/* Simulation Metrics section */}
          <h3 className="text-xl font-bold text-gray-300 mt-8 mb-2">Simulation Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-min">
            <div>{renderGroup('simulationOne', weights.simulationOne)}</div>
            <div>{renderGroup('simulationTwo', weights.simulationTwo)}</div>
            <div>{renderGroup('simulationThree', weights.simulationThree)}</div>
          </div>
          {totalWeight !== 100 && (
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded shadow-md z-50">
              Values must add up to 100%
            </div>
          )}
        </main>
      </div>
      {thresholdModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-[#1e1e1e] text-white p-6 rounded-md shadow-md w-full max-w-md">
            <h2 className="text-xl font-semibold mb-2">Set Grading Thresholds for: {selectedMetric}</h2>
            <p className="text-sm text-gray-400 mb-4">
              {{
                irrCashFlow: 'IRR from cash flow only. Use a discount rate or typical return hurdle.',
                irrTotal: 'Total IRR including appreciation. Base on your target return.',
                irrSpread: 'IRR total minus IRR from cash flow. Measures impact of appreciation.',
                medianIrr: 'Median IRR across all simulation trials.',
                irr5PercentThreshold: 'Percent of simulations where IRR exceeded 5%. Higher is better.',
                irr5: 'IRR at year 5. Reflects early exit value.',
                irr10: 'IRR at year 10. Mid-term return view.',
                irr15: 'IRR at year 15.',
                irr20: 'IRR at year 20.',
                irr25: 'IRR at year 25.',
                totalCashFlow: 'Cumulative cash flow as a percent of purchase price (relative to value).',
                averageCashFlow: 'Average annual cash flow as a percent of purchase price (relative to value).',
                worstCashFlow: 'Worst annual cash flow as a percent of purchase price (relative to value). Thresholds should reflect downside tolerance.',
                negativeCashFlowYears: 'Number of years with negative cash flow.',
                sdCashFlow: 'Volatility of annual cash flow. Lower is better.',
                maxLtv: 'Highest loan-to-value ratio. Use lender risk tolerance.',
                averageLtv: 'Average loan-to-value across simulation.',
                finalLtv: 'Final loan-to-value at end of period.',
                debtYield: 'NOI divided by loan amount. Use lender’s minimum requirement.',
                interestCoverageRatio: 'NOI divided by interest expense. Use lender minimums.',
                maxDrawdownEquity: 'Largest equity loss during simulation (relative to property value).',
                maxDrawdownValue: 'Largest property value loss during simulation.',
                maxDrawdownSim: 'Combined max drawdown of property and equity.',
                breakEvenEquity: 'Year when equity and distributions match initial equity.',
                finalEquity: 'Final equity as a percent of property value (relative to value).',
                cumulativeEquityBuilt: 'Total equity built during hold (relative to value).',
                equityMultiple: 'Total return divided by equity invested.',
                annualizedReturn: 'Compound annual growth rate.',
                yearsDscrBelow1_2: 'Years with DSCR below 1.2 in projections.',
                yearsDscrBelow1_2_sim: 'Years with DSCR below 1.2 in simulations.',
                minDscr: 'Minimum DSCR during simulation.',
                finalValue: 'Ending property value as multiple of purchase price (relative to value).',
                appreciation: 'Total property appreciation over simulation (relative to value).',
                averageDscr: 'Average DSCR over simulation period.',
                sharpeRatio: 'Risk-adjusted return (higher is better).',
              }[selectedMetric] || 'Set thresholds for this metric based on your return goals or risk tolerance.'}
            </p>
            {/* Example grading form */}
            <div className="space-y-2">
              <div>
                <label className="block text-sm">A Grade: ≥</label>
                <input
                  className="w-full p-2 bg-[#2a2a2a] border border-gray-600 rounded"
                  type="number"
                  value={editingThresholds.grade_a}
                  onChange={(e) =>
                    setEditingThresholds({ ...editingThresholds, grade_a: parseFloat(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className="block text-sm">B Grade: ≥</label>
                <input
                  className="w-full p-2 bg-[#2a2a2a] border border-gray-600 rounded"
                  type="number"
                  value={editingThresholds.grade_b}
                  onChange={(e) =>
                    setEditingThresholds({ ...editingThresholds, grade_b: parseFloat(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className="block text-sm">C Grade: ≥</label>
                <input
                  className="w-full p-2 bg-[#2a2a2a] border border-gray-600 rounded"
                  type="number"
                  value={editingThresholds.grade_c}
                  onChange={(e) =>
                    setEditingThresholds({ ...editingThresholds, grade_c: parseFloat(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className="block text-sm">D Grade: ≥</label>
                <input
                  className="w-full p-2 bg-[#2a2a2a] border border-gray-600 rounded"
                  type="number"
                  value={editingThresholds.grade_d}
                  onChange={(e) =>
                    setEditingThresholds({ ...editingThresholds, grade_d: parseFloat(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400">F Grade:</label>
                <p className="text-sm text-gray-500">Automatically assigned to values below D threshold</p>
              </div>
            </div>

            <div className="flex justify-end mt-4 gap-2">
              <button
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                onClick={() => setThresholdModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
                onClick={() => {
                  saveThreshold(selectedMetric, editingThresholds);
                  setThresholdModalOpen(false);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}