import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/scorecard/sidebar';
import ScoreSection from '@/components/scorecard/score_section';
import OverallScoreCard from '@/components/scorecard/overall_scorecard.js';
import MetricSettingsModal from '@/components/scorecard/metric_setting_modal';
import SectionWeightModal from '@/components/scorecard/section_weight_modal';

// Default grade thresholds for metrics
const defaultThresholdMap = {
  irrCashFlow: { grade_a: 12, grade_b: 9, grade_c: 6, grade_d: 3 },
  irrTotal: { grade_a: 15, grade_b: 12, grade_c: 9, grade_d: 6 },
  appreciation: { grade_a: 1.5, grade_b: 1.0, grade_c: 0.5, grade_d: 0.25 },
  finalValue: { grade_a: 3.5, grade_b: 3.0, grade_c: 2.0, grade_d: 1.5 },
  irrCFSim: { grade_a: 12, grade_b: 9, grade_c: 6, grade_d: 3 },
  irrTotalSim: { grade_a: 15, grade_b: 12, grade_c: 9, grade_d: 6 },
  totalCashFlow: { grade_a: 1.25, grade_b: 1.0, grade_c: 0.75, grade_d: 0.5 },
  averageCashFlow: { grade_a: 0.05, grade_b: 0.0375, grade_c: 0.025, grade_d: 0.0125 },
  equityMultiple: { grade_a: 2.0, grade_b: 1.8, grade_c: 1.5, grade_d: 1.2 },
  averageCFSim: { grade_a: 0.045, grade_b: 0.035, grade_c: 0.025, grade_d: 0.01 },
  totalCFSim: { grade_a: 1.0, grade_b: 0.8, grade_c: 0.6, grade_d: 0.4 },
  breakEvenYear: { grade_a: 5, grade_b: 8, grade_c: 12, grade_d: 18 },
  finalEquity: { grade_a: 1.0, grade_b: 0.8, grade_c: 0.6, grade_d: 0.4 },
  finalEquitySim: { grade_a: 1.0, grade_b: 0.8, grade_c: 0.6, grade_d: 0.4 },
  maxLtv: { grade_a: 0.5, grade_b: 0.6, grade_c: 0.75, grade_d: 0.9 },
  maxLtvSim: { grade_a: 0.5, grade_b: 0.6, grade_c: 0.75, grade_d: 0.9 },
  averageDscr: { grade_a: 1.5, grade_b: 1.3, grade_c: 1.15, grade_d: 1.05 },
  minDscr: { grade_a: 1.2, grade_b: 1.0, grade_c: 0.9, grade_d: 0.8 },
  yearsDscrBelow1_2: { grade_a: 0, grade_b: 2, grade_c: 4, grade_d: 6 },
  minDSCRSim: { grade_a: 1.2, grade_b: 1.0, grade_c: 0.9, grade_d: 0.8 },
  yearsDSCRUnder1_2Sim: { grade_a: 0, grade_b: 2, grade_c: 4, grade_d: 6 },
  sharpeRatio: { grade_a: 2, grade_b: 1.5, grade_c: 1, grade_d: 0.5 },
  sharpeRatioSim: { grade_a: 2, grade_b: 1.5, grade_c: 1, grade_d: 0.5 },
  maxDrawdownValueSim: { grade_a: 0.05, grade_b: 0.1, grade_c: 0.2, grade_d: 0.3 },
  maxDrawdownEquitySim: { grade_a: 0.05, grade_b: 0.1, grade_c: 0.2, grade_d: 0.3 },
  worstCashFlow: { grade_a: 0.05, grade_b: 0.0, grade_c: -0.03, grade_d: -0.07 },
  worstCFSim: { grade_a: 0.05, grade_b: 0.0, grade_c: -0.03, grade_d: -0.07 },
  negativeCashFlowYears: { grade_a: 0, grade_b: 1, grade_c: 3, grade_d: 5 },
  negativeCFYearsSim: { grade_a: 0, grade_b: 1, grade_c: 3, grade_d: 5 },
};

// Section weights for scorecard groups
const sectionWeights = {
  'IRR & Appreciation': 1,
  'Cash Flow': 1,
  'Leverage & Liquidity': 1,
  'DSCR Stability': 1,
  'Risk: Volatility & Return Efficiency': 1,
  'Tail Risk & Extremes': 1,
};

export default function Scorecard() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [userId, setUserId] = useState(null);
  // Helper to compute numeric score for a given metric value and thresholds
  const getNumericScore = (value, thresholds, invert = false) => {
    if (value === 'N/A') return null;
    const num = parseFloat(value);
    if (isNaN(num)) return null;

    // More explicit debug log for score calculation
    console.log(`DEBUG getNumericScore: num=${num}, invert=${invert}, thresholds=`, thresholds);

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

  // Helper to convert numeric score to base letter grade (A, B, C, D, F)
  const getLetterGrade = (score) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  // Helper to get Tailwind color class for a given letter grade, with background and text color
  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A': return 'text-green-300 bg-green-500/20';
      case 'B': return 'text-yellow-300 bg-yellow-400/20';
      case 'C': return 'text-orange-300 bg-orange-400/20';
      case 'D': return 'text-red-300 bg-red-500/20';
      case 'F': return 'text-red-500 bg-red-700/30';
      default: return 'text-gray-300 bg-gray-700';
    }
  };
  const router = useRouter();
  // Calculate section score given an array of metric keys
  const calculateSectionScore = (keys) => {
    let total = 0;
    let weightSum = 0;

    keys.forEach((key) => {
      const value = getMetricValue(key);
      const thresholdsForMetric = thresholds[key] ?? defaultThresholdMap[key];
      const invert = [
        'breakEvenYear', 'maxLtv', 'maxLtvSim',
        'yearsDscrBelow1_2', 'yearsDSCRUnder1_2Sim',
        'maxDrawdownValueSim', 'maxDrawdownEquitySim',
        'worstCashFlow', 'worstCFSim',
        'negativeCashFlowYears', 'negativeCFYearsSim'
      ].includes(key);

      // Normalize dollar-based metrics by dividing by selectedDeal.purchase_price when applicable
      let metricValue = value;
      const normalizeByInvestment = [
        'appreciation', 'finalValue', 'totalCashFlow', 'averageCashFlow',
        'finalEquity', 'totalCFSim', 'averageCFSim', 'finalEquitySim',
        'worstCashFlow', 'worstCFSim'
      ].includes(key);

      if (normalizeByInvestment && selectedDeal?.purchase_price) {
        metricValue = Number(value) / Number(selectedDeal.purchase_price);
      }

      const score = getNumericScore(metricValue, thresholdsForMetric, invert);
      const weight = weights[key] ?? 0;

      if (score !== null) {
        total += score * weight;
        weightSum += weight;
      }
    });

    return weightSum > 0 ? (total / weightSum) : null;
  };

  // Section metric keys
  const sectionMetrics = {
    'IRR & Appreciation': ['irrCashFlow', 'irrTotal', 'irrCFSim', 'irrTotalSim', 'appreciation'],
    'Cash Flow': ['totalCashFlow', 'averageCashFlow', 'equityMultiple', 'averageCFSim', 'totalCFSim'],
    'Leverage & Liquidity': ['breakEvenYear', 'finalEquity', 'finalEquitySim', 'maxLtv', 'maxLtvSim'],
    'DSCR Stability': ['averageDscr', 'minDscr', 'yearsDscrBelow1_2', 'minDSCRSim', 'yearsDSCRUnder1_2Sim'],
    'Risk & Return': ['sharpeRatio', 'sharpeRatioSim', 'maxDrawdownValueSim', 'maxDrawdownEquitySim'],
    'Tail Risk': ['worstCashFlow', 'worstCFSim', 'negativeCFYearsSim', 'negativeCashFlowYears']
  };
  const [loading, setLoading] = useState(true);
  const [userDeals, setUserDeals] = useState([]);
  const [dealIdFromQuery, setDealIdFromQuery] = useState(null);

  const [weights, setWeights] = useState({
    irrCashFlow: 5,
    irrTotal: 5,
    appreciation: 5,
    finalValue: 5,
    irrCFSim: 4,
    irrTotalSim: 4,
    totalCashFlow: 4,
    averageCashFlow: 5,
    equityMultiple: 2,
    averageCFSim: 5,
    totalCFSim: 4,
    breakEvenYear: 4,
    finalEquity: 2,
    finalEquitySim: 2,
    maxLtv: 3,
    maxLtvSim: 3,
    averageDscr: 3,
    minDscr: 3,
    yearsDscrBelow1_2: 3,
    minDSCRSim: 3,
    yearsDSCRUnder1_2Sim: 3,
    sharpeRatio: 5,
    sharpeRatioSim: 5,
    maxDrawdownValueSim: 1,
    maxDrawdownEquitySim: 1,
    worstCashFlow: 4,
    worstCFSim: 4,
    negativeCFYearsSim: 4,
    negativeCashFlowYears: 4
  });
  // Track selected preset for Weight Presets and Threshold Presets independently
  const [selectedWeightPreset, setSelectedWeightPreset] = useState('Default');
  const [selectedThresholdPreset, setSelectedThresholdPreset] = useState('Default Thresholds');

  // State for user presets
  const [userWeightPresets, setUserWeightPresets] = useState([]);
  const [userThresholdPresets, setUserThresholdPresets] = useState([]);
  // State for expanded section edit overlay
  const [expandedSection, setExpandedSection] = useState(null);
  // Add thresholds state, initialized with default grade bands for each metric
  const [thresholds, setThresholds] = useState(() => {
    const initial = {};
    for (const key in defaultThresholdMap) {
      initial[key] = { ...defaultThresholdMap[key] };
    }
    return initial;
  });
  // State for expanded metric controls
  const [expandedMetric, setExpandedMetric] = useState(null);

  const renderGroup = (groupName, group) => (
    <div className="bg-[#1e1e1e] p-4 rounded-md shadow-md h-full">
      <h2 className="text-white text-xl font-semibold mb-2 capitalize">{groupName}</h2>
      {Object.entries(group).map(([key, val]) => (
        <div key={key} className="mb-4">
          <label className="block text-sm mb-1 text-gray-400">{key}</label>
          <input
            type="number"
            className="w-full p-2 bg-[#2a2a2a] text-white rounded border border-gray-600"
            value={val}
            onChange={(e) => {
              const newWeights = {
                ...weights,
                [groupName]: {
                  ...weights[groupName],
                  [key]: Number(e.target.value),
                },
              };
              setWeights(newWeights);
            }}
          />
        </div>
      ))}
    </div>
  );

  useEffect(() => {
    if (router.isReady) {
      setDealIdFromQuery(router.query.dealId);
    }
  }, [router.isReady, router.query]);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        setLoading(false);
      } else {
        router.replace('/login');
      }
    };
    checkSession();
  }, []);

  // Fetch user weight and threshold presets from Supabase, removing duplicates and normalizing names
  useEffect(() => {
    const fetchPresets = async () => {
      if (!userId) return;

      const { data: weightPresets } = await supabase
        .from('weight_presets')
        .select('*')
        .eq('user_id', userId);

      const { data: thresholdPresets } = await supabase
        .from('threshold_presets')
        .select('*')
        .eq('user_id', userId);

      // Deduplicate and normalize names, and filter out exact duplicate (name + data) entries
      const deduplicate = (presets) => {
        const seen = new Map();

        return presets.filter(preset => {
          let name = preset.name;

          // Parse JSON-encoded names if needed
          try {
            const parsed = JSON.parse(name);
            if (parsed?.name) name = parsed.name;
          } catch {}

          name = String(name).trim().toLowerCase();

          const key = name + JSON.stringify(preset.data);

          if (seen.has(key)) return false;
          seen.set(key, true);

          preset.name = name;
          return true;
        });
      };

      if (weightPresets) setUserWeightPresets(deduplicate(weightPresets));
      if (thresholdPresets) setUserThresholdPresets(deduplicate(thresholdPresets));
    };
    fetchPresets();
  }, [userId]);

  // Save weights to Supabase presets table when weights change, but only if "Default" is selected
  useEffect(() => {
    if (!userId || selectedWeightPreset !== 'Default') return;
    supabase.from('presets')
      .upsert([{ user_id: userId, preset_type: 'weights', data: weights }], { onConflict: ['user_id', 'preset_type'] });
  }, [weights, userId, selectedWeightPreset]);

  // Save thresholds to Supabase presets table when thresholds change
  useEffect(() => {
    if (!userId) return;
    supabase.from('presets')
      .upsert([{ user_id: userId, preset_type: 'thresholds', data: thresholds }], { onConflict: ['user_id', 'preset_type'] });
  }, [thresholds]);

  useEffect(() => {
    const fetchDeals = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (!userId) return;

      const { data: deals, error } = await supabase
        .from('deals')
        .select('*, simulation_metrics')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && deals) {
        setUserDeals(deals);
        // Validate simulation_metrics presence and type for each deal
        if (deals && Array.isArray(deals)) {
          deals.forEach((deal) => {
            const sim = deal.simulation_metrics;
            if (!sim || typeof sim !== 'object') {
              console.warn('SIM METRICS MISSING OR INVALID FOR DEAL:', {
                id: deal.id,
                name: deal.deal_name,
                type: typeof sim,
                value: sim
              });
            }
          });
        }
      }
    };
    fetchDeals();
  }, []);

  const selectedDeal = useMemo(() => {
    return userDeals.find(deal => deal.id?.toString() === dealIdFromQuery);
  }, [userDeals, dealIdFromQuery]);

  const getMetricValue = (key) => {
    // Map all simulation metric keys used across the scorecard to their simulation_metrics property names
    const simKeyMap = {
      irrCFSim: 'irrCFSim',
      irrTotalSim: 'irrTotalSim',
      averageCFSim: 'averageCFSim',
      totalCFSim: 'totalCFSim',
      equityMultipleSim: 'equityMultipleSim',
      finalValueSim: 'finalValueSim',
      finalEquitySim: 'finalEquitySim',
      sharpeRatioSim: 'sharpeRatioSim',
      minDSCRSim: 'minDSCRSim',
      meanDSCRSim: 'meanDSCRSim',
      maxLtvSim: 'maxLTVSim',
      worstCFSim: 'worstCFSim',
      maxDrawdownValueSim: 'maxDrawdownValueSim',
      maxDrawdownEquitySim: 'maxDrawdownEquitySim',
      yearsDSCRUnder1_2Sim: 'yearsDSCRUnder1_2Sim',
      negativeCFYearsSim: 'negativeCFYearsSim'
    };

    // Special case: convert maxLtvSim from percentage to decimal
    if (key === 'maxLtvSim') {
      const raw = selectedDeal?.simulation_metrics?.['maxLTVSim'];
      return raw ? Number(raw) / 100 : 'N/A';
    }

    if (key in simKeyMap) {
      return selectedDeal?.simulation_metrics?.[simKeyMap[key]] ?? 'N/A';
    }

    // For base (non-simulation) metrics, check both metrics and root-level fields
    return selectedDeal?.metrics?.[key] ?? selectedDeal?.[key] ?? 'N/A';
  };

  // Helper to format metric values
  const formatMetricValue = (key, value) => {
    if (value === 'N/A') return value;

    const dollarKeys = [
      'totalCashFlow', 'averageCashFlow', 'appreciation', 'finalValue',
      'finalEquity', 'totalCF', 'averageCF', 'worstCashFlow', 'worstCF',
      'totalCFSim', 'averageCFSim', 'finalValueSim', 'finalEquitySim', 'worstCFSim'
    ];
    const decimalPercentKeys = [
      'irrCashFlow', 'irrCF', 'irrTotal',
      'irrCFSim', 'irrTotalSim'
    ];
    const percentKeys = [
      'maxDrawdownValue', 'maxDrawdownEquity', 'maxDrawdownValueSim', 'maxDrawdownEquitySim'
    ];
    const intKeys = [
      'breakEvenYear', 'negativeCashFlowYears', 'negativeCFYears',
      'yearsDscrBelow1_2', 'yearsDSCRUnder1_2', 'yearsDSCRUnder1_2Sim', 'negativeCFYearsSim'
    ];
    const decimalKeys = ['maxLtvSim'];

    if (dollarKeys.includes(key)) {
      return `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    }
    if (decimalPercentKeys.includes(key)) {
      const raw = Number(value);
      const percent = raw > 1 ? raw : raw * 100;
      return `${percent.toFixed(2)}%`;
    }
    if (percentKeys.includes(key)) {
      return `${Number(value).toFixed(2)}%`;
    }
    if (intKeys.includes(key)) {
      return `${Math.round(Number(value))} yrs`;
    }
    if (decimalKeys.includes(key)) {
      return Number(value).toFixed(2);
    }

    return Number(value).toFixed(2);
  };

  // Calculate all section scores and overall score
  const sectionScores = Object.entries(sectionMetrics).reduce((acc, [section, keys]) => {
    acc[section] = calculateSectionScore(keys);
    return acc;
  }, {});
  const overallScore = Object.values(sectionScores).reduce((sum, score) => sum + (score ?? 0), 0) / Object.keys(sectionScores).length;
  const overallGrade = getLetterGrade(overallScore);

  if (loading) {
    return <div className="min-h-screen bg-[#121212] text-white p-6">Loading...</div>;
  }


  return (
    <>
      <Navbar />
      {/* Mobile toggle button */}
      {!sidebarVisible && (
        <div className="md:hidden fixed bottom-6 left-4 z-50">
          <button
            onClick={() => setSidebarVisible(!sidebarVisible)}
            className="bg-[#475569] hover:bg-[#334155] text-white w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-lg"
            aria-label={sidebarVisible ? "Close Sidebar" : "Open Sidebar"}
          >
            <span
              className={`transform transition-transform duration-300 ${
                sidebarVisible ? 'rotate-135' : 'rotate-0'
              }`}
            >
              +
            </span>
          </button>
        </div>
      )}
      <div className="flex flex-col md:flex-row min-h-screen bg-[#121212] text-white">
        {/* Sidebar */}
        {/* Mobile toggle button */}
        {/* (Redundant, already rendered above) */}
        {/* Desktop sidebar: always visible */}
        <div className="hidden md:block md:w-1/3 lg:w-1/4 max-w-[320px] md:max-w-none">
          <Sidebar
            weightPresets={[
              { name: 'Default', data: weights },
              ...userWeightPresets
            ]}
            thresholdPresets={[
              { name: 'Default Thresholds', data: defaultThresholdMap },
              ...userThresholdPresets
            ]}
            selectedWeightPreset={selectedWeightPreset}
            selectedThresholdPreset={selectedThresholdPreset}
            onSelectWeightPreset={(preset) => {
              setSelectedWeightPreset(preset.name);
              if (preset.name === 'Default') {
                setWeights({
                  irrCashFlow: 5, irrTotal: 5, appreciation: 5, finalValue: 5,
                  irrCFSim: 4, irrTotalSim: 4, totalCashFlow: 4, averageCashFlow: 5,
                  equityMultiple: 2, averageCFSim: 5, totalCFSim: 4, breakEvenYear: 4,
                  finalEquity: 2, finalEquitySim: 2, maxLtv: 3, maxLtvSim: 3,
                  averageDscr: 3, minDscr: 3, yearsDscrBelow1_2: 3, minDSCRSim: 3,
                  yearsDSCRUnder1_2Sim: 3, sharpeRatio: 5, sharpeRatioSim: 5,
                  maxDrawdownValueSim: 1, maxDrawdownEquitySim: 1,
                  worstCashFlow: 4, worstCFSim: 4, negativeCFYearsSim: 4, negativeCashFlowYears: 4
                });
              } else {
                setWeights(preset.data);
              }
            }}
            onSelectThresholdPreset={(preset) => {
              setSelectedThresholdPreset(preset.name);
              if (preset.name === 'Default Thresholds') {
                setThresholds(defaultThresholdMap);
              } else {
                setThresholds(preset.data);
              }
            }}
            deals={userDeals}
            selectedDealId={dealIdFromQuery}
            onSelectDeal={(id) => router.replace({ pathname: router.pathname, query: { dealId: id } }, undefined, { shallow: true })}
            totalSectionWeight={Object.entries(sectionMetrics).reduce(
              (sum, [section, keys]) => sum + keys.reduce((acc, key) => acc + (weights[key] ?? 0), 0),
              0
            )}
            setUserWeightPresets={setUserWeightPresets}
            setUserThresholdPresets={setUserThresholdPresets}
            weights={weights}
            thresholds={thresholds}
          />
        </div>
        {/* Mobile sidebar: toggleable */}
        {sidebarVisible && (
          <div className="fixed inset-0 z-40 bg-[#1e1e1e] w-full h-full overflow-y-auto md:hidden pt-20 pb-32">
            <Sidebar
              weightPresets={[
                { name: 'Default', data: weights },
                ...userWeightPresets
              ]}
              thresholdPresets={[
                { name: 'Default Thresholds', data: defaultThresholdMap },
                ...userThresholdPresets
              ]}
              selectedWeightPreset={selectedWeightPreset}
              selectedThresholdPreset={selectedThresholdPreset}
              onSelectWeightPreset={(preset) => {
                setSelectedWeightPreset(preset.name);
                if (preset.name === 'Default') {
                  setWeights({
                    irrCashFlow: 5, irrTotal: 5, appreciation: 5, finalValue: 5,
                    irrCFSim: 4, irrTotalSim: 4, totalCashFlow: 4, averageCashFlow: 5,
                    equityMultiple: 2, averageCFSim: 5, totalCFSim: 4, breakEvenYear: 4,
                    finalEquity: 2, finalEquitySim: 2, maxLtv: 3, maxLtvSim: 3,
                    averageDscr: 3, minDscr: 3, yearsDscrBelow1_2: 3, minDSCRSim: 3,
                    yearsDSCRUnder1_2Sim: 3, sharpeRatio: 5, sharpeRatioSim: 5,
                    maxDrawdownValueSim: 1, maxDrawdownEquitySim: 1,
                    worstCashFlow: 4, worstCFSim: 4, negativeCFYearsSim: 4, negativeCashFlowYears: 4
                  });
                } else {
                  setWeights(preset.data);
                }
              }}
              onSelectThresholdPreset={(preset) => {
                setSelectedThresholdPreset(preset.name);
                if (preset.name === 'Default Thresholds') {
                  setThresholds(defaultThresholdMap);
                } else {
                  setThresholds(preset.data);
                }
              }}
              deals={userDeals}
              selectedDealId={dealIdFromQuery}
              onSelectDeal={(id) => {
                router.replace({ pathname: router.pathname, query: { dealId: id } }, undefined, { shallow: true });
                setSidebarVisible(false);
              }}
              totalSectionWeight={Object.entries(sectionMetrics).reduce(
                (sum, [section, keys]) => sum + keys.reduce((acc, key) => acc + (weights[key] ?? 0), 0),
                0
              )}
              setUserWeightPresets={setUserWeightPresets}
              setUserThresholdPresets={setUserThresholdPresets}
              weights={weights}
              thresholds={thresholds}
            />
            <div className="fixed bottom-6 left-4 z-50">
              <button
                onClick={() => setSidebarVisible(false)}
                className="bg-[#475569] hover:bg-[#334155] text-white w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-lg"
                aria-label="Close Sidebar"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 w-full mt-6 md:mt-0 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white">Scorecard</h1>
            <p className="text-gray-400 mt-1">Evaluate this deal across performance, cash flow, risk, and return.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            {/* Overall Grade Card */}
            <OverallScoreCard overallScore={overallScore} overallGrade={overallGrade} />
            {/* Section Cards */}
            {Object.entries(sectionMetrics).map(([sectionName, keys]) => (
              <div key={sectionName} className="bg-[#1e1e1e] p-4 rounded-lg text-center h-full flex flex-col justify-between">
                <h2 className="text-sm font-semibold text-white mb-1">{sectionName}</h2>
                <div className={`inline-block px-3 py-2 rounded border border-gray-600 text-center font-semibold ${
                  getGradeColor(getLetterGrade(sectionScores[sectionName]))
                } bg-opacity-20`}>
                  <p className="text-xl font-bold">{sectionScores[sectionName]?.toFixed(0) ?? 'N/A'}%</p>
                  <p className="text-sm font-semibold">{getLetterGrade(sectionScores[sectionName])}</p>
                </div>
                <button
                  onClick={() => setExpandedSection(sectionName)}
                  className="mt-2 inline-block text-gray-300 border border-gray-600 hover:bg-[#475569] hover:text-white hover:border-white text-xs font-medium py-1 px-2 rounded transition-colors"
                >
                  Weight: {keys.reduce((sum, key) => sum + (weights[key] ?? 0), 0).toFixed(1)}%
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-[#1e1e1e] p-6 rounded-lg">
              <p className="text-gray-400">
                This scorecard evaluates your deal across IRR, cash flow, leverage, risk, and volatility using custom thresholds and weights. It displays both deal-based and simulation-based performance.
              </p>
            </div>
            <div className="bg-[#1e1e1e] p-6 rounded-lg">
              <p className="text-gray-400">
                Click the grade button on any metric to edit the thresholds for letter grades. You can also edit section weights by clicking the “Weight” button under each section scorecard above.
              </p>
            </div>
            <div className="bg-[#1e1e1e] p-6 rounded-lg">
              <p className="text-gray-400">
                You can switch between saved presets or load new ones using the sidebar. Simulation metrics are normalized against the original investment when applicable.
              </p>
            </div>
          </div>

          {selectedDeal ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    title: 'IRR & Appreciation',
                    metrics: [
                      { key: 'irrCashFlow', label: 'Internal Rate of Return – Cash Flow (Deals)', value: '12.4%', grade: 'A' },
                      { key: 'irrTotal', label: 'Internal Rate of Return – Total (Deals)', value: '16.7%', grade: 'A' },
                      { key: 'irrCFSim', label: 'Internal Rate of Return – Cash Flow (Simulations)', value: '14.2%', grade: 'A' },
                      { key: 'irrTotalSim', label: 'Internal Rate of Return – Total (Simulations)', value: '17.5%', grade: 'A' },
                      { key: 'appreciation', label: 'Appreciation (Deals)', value: '$350K', grade: 'B' }
                    ]
                  },
                  {
                    title: 'Cash Flow',
                    metrics: [
                      { key: 'totalCashFlow', label: 'Total Cash Flow (Deals)', value: '$284,000', grade: 'A' },
                      { key: 'averageCashFlow', label: 'Average Cash Flow (Deals)', value: '$9,467', grade: 'A' },
                      { key: 'equityMultiple', label: 'Equity Multiple (Deals)', value: '2.2x', grade: 'B' },
                      { key: 'averageCFSim', label: 'Average Cash Flow (Simulations)', value: '$8,900', grade: 'B' },
                      { key: 'totalCFSim', label: 'Total Cash Flow (Simulations)', value: '$267,000', grade: 'B' }
                    ]
                  },
                  {
                    title: 'Leverage & Liquidity',
                    metrics: [
                      { key: 'breakEvenYear', label: 'Break Even Year (Deals)', value: 'Year 9', grade: 'B' },
                      { key: 'finalEquity', label: 'Final Equity (Deals)', value: '$890K', grade: 'A' },
                      { key: 'finalEquitySim', label: 'Final Equity (Simulations)', value: '$860K', grade: 'A' },
                      { key: 'maxLtv', label: 'Maximum Loan-to-Value Ratio (Deals)', value: '76%', grade: 'B' },
                      { key: 'maxLtvSim', label: 'Maximum Loan-to-Value Ratio (Simulations)', value: '78%', grade: 'B' }
                    ]
                  },
                  {
                    title: 'DSCR Stability',
                    metrics: [
                      { key: 'averageDscr', label: 'Average DSCR (Deals)', value: '1.45', grade: 'B' },
                      { key: 'minDscr', label: 'Minimum DSCR (Deals)', value: '1.11', grade: 'C' },
                      { key: 'yearsDscrBelow1_2', label: 'Years with DSCR < 1.2 (Deals)', value: '2 yrs', grade: 'B' },
                      { key: 'minDSCRSim', label: 'Minimum DSCR (Simulations)', value: '1.08', grade: 'C' },
                      { key: 'yearsDSCRUnder1_2Sim', label: 'Years with DSCR < 1.2 (Simulations)', value: '3 yrs', grade: 'C' }
                    ]
                  },
                  {
                    title: 'Risk: Volatility & Return Efficiency',
                    metrics: [
                      { key: 'sharpeRatio', label: 'Sharpe Ratio (Deals)', value: '1.3', grade: 'C' },
                      { key: 'sharpeRatioSim', label: 'Sharpe Ratio (Simulations)', value: '1.1', grade: 'C' },
                      { key: 'maxDrawdownValueSim', label: 'Maximum Drawdown – Property Value (Simulations)', value: '-15%', grade: 'C' },
                      { key: 'maxDrawdownEquitySim', label: 'Maximum Drawdown – Equity (Simulations)', value: '-20%', grade: 'D' }
                    ]
                  },
                  {
                    title: 'Tail Risk & Extremes',
                    metrics: [
                      { key: 'worstCashFlow', label: 'Worst Annual Cash Flow (Deals)', value: '-$3,400', grade: 'C' },
                      { key: 'worstCFSim', label: 'Worst Annual Cash Flow (Simulations)', value: '-$5,100', grade: 'D' },
                      { key: 'negativeCFYearsSim', label: 'Years with Negative Cash Flow (Simulations)', value: '5 yrs', grade: 'C' },
                      { key: 'negativeCashFlowYears', label: 'Years with Negative Cash Flow (Deals)', value: '2 yrs', grade: 'B' }
                    ]
                  }
                ].map(group => (
                  <div key={group.title} className="bg-[#1e1e1e] p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">{group.title}</h3>
                    <div className="space-y-3">
                      {group.metrics.map(metric => {
                        const rawValue = getMetricValue(metric.key);
                        const thresholdsForMetric = thresholds[metric.key] ?? defaultThresholdMap[metric.key];
                        // Unified invert logic for low-is-better metrics
                        const invert = [
                          'breakEvenYear',
                          'maxLtv',
                          'maxLtvSim',
                          'yearsDscrBelow1_2',
                          'yearsDSCRUnder1_2Sim',
                          'maxDrawdownValueSim',
                          'maxDrawdownEquitySim',
                          'worstCashFlow',
                          'worstCFSim',
                          'negativeCashFlowYears',
                          'negativeCFYearsSim'
                        ].includes(metric.key);

                        // Normalize dollar-based metrics by dividing by selectedDeal.purchase_price when applicable
                        let metricValue = rawValue;
                        const normalizeByInvestment = [
                          'appreciation', 'finalValue', 'totalCashFlow', 'averageCashFlow',
                          'finalEquity', 'totalCFSim', 'averageCFSim', 'finalEquitySim',
                          'worstCashFlow', 'worstCFSim'
                        ].includes(metric.key);
                        if (normalizeByInvestment) {
                          const base = Number(selectedDeal?.purchase_price);
                          if (!isNaN(base) && base > 0) {
                            metricValue = Number(rawValue) / base;
                          } else {
                            metricValue = 'N/A';
                          }
                        }

                        const numericScore = metricValue === 'N/A'
                          ? null
                          : getNumericScore(metricValue, thresholdsForMetric, invert);
                        const letter = numericScore !== null ? getLetterGrade(numericScore) : 'N/A';
                        return (
                          <div key={metric.key} className="bg-[#2a2a2a] p-3 rounded text-gray-200">
                            <div className="text-sm text-gray-400">{metric.label}</div>
                            <div className="text-lg font-bold">
                              {formatMetricValue(metric.key, metricValue)}
                            </div>
                            <button
                              onClick={() =>
                                setExpandedMetric(expandedMetric === metric.key ? null : metric.key)
                              }
                              className={`mt-2 inline-block border border-gray-600 hover:border-white text-sm font-medium py-1 px-2 rounded transition-colors ${
                                letter === 'A' ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30' :
                                letter === 'B' ? 'bg-yellow-400/20 text-yellow-300 hover:bg-yellow-400/30' :
                                letter === 'C' ? 'bg-orange-400/20 text-orange-300 hover:bg-orange-400/30' :
                                letter === 'D' ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' :
                                letter === 'F' ? 'bg-red-700/30 text-red-500 hover:bg-red-700/40' :
                                'bg-gray-700 text-white'
                              }`}
                            >
                              Grade: {letter}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p>No deal selected.</p>
          )}
        </div>
      </div>
      {/* Expanded Metric Modal */}
      {expandedMetric && (
        <MetricSettingsModal
          metricKey={expandedMetric}
          thresholds={thresholds}
          onUpdate={(key, updated) => setThresholds({ ...thresholds, [key]: updated })}
          onClose={() => setExpandedMetric(null)}
        />
      )}

      {/* Expanded Section Weight Modal */}
      {expandedSection && (
        <SectionWeightModal
          weights={Object.fromEntries(sectionMetrics[expandedSection].map(k => [k, weights[k]]))}
          onUpdate={(updated) => setWeights({ ...weights, ...updated })}
          onClose={() => setExpandedSection(null)}
        />
      )}
    </>
  );
}
