import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);
// Reusable HistogramChart component
function HistogramChart({ data, label }) {
  if (!data || data.length === 0) return null;

  const minVal = Math.floor(Math.min(...data));
  const maxVal = Math.ceil(Math.max(...data));
  const numBins = 10;
  const binSize = (maxVal - minVal) / numBins;

  const histogramBins = Array(numBins).fill(0);
  data.forEach(val => {
    let idx = Math.floor((val - minVal) / binSize);
    if (idx >= numBins) idx = numBins - 1;
    if (idx < 0) idx = 0;
    histogramBins[idx]++;
  });

  // Determine if this histogram is value-based (dollars) or percent-based
  // If the label contains "Value ($)" or "Worst CF ($)", use dollar formatting, else percent
  let labels;
  if (
    label &&
    (
      label.toLowerCase().includes('value ($)') ||
      label.toLowerCase().includes('worst cf ($)')
    )
  ) {
    labels = histogramBins.map((_, i) => {
      const rangeStart = minVal + i * binSize;
      const rounded = Math.round(rangeStart);
      return rounded < 0
        ? `($${Math.abs(rounded).toLocaleString()})`
        : `$${rounded.toLocaleString()}`;
    });
  } else {
    labels = histogramBins.map((_, i) => {
      const rangeStart = minVal + i * binSize;
      return `${rangeStart.toFixed(1)}%`;
    });
  }

  const chartData = {
    labels,
    datasets: [{
      label,
      data: histogramBins,
      backgroundColor: '#475569',
      borderRadius: 4
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: label }
    },
    scales: {
      x: { ticks: { color: '#d1d5db' }, grid: { display: false } },
      y: {
        ticks: {
          color: '#d1d5db',
          stepSize: 1,
          callback: function(value) {
            return Number.isInteger(value) ? value : '';
          }
        },
        grid: { display: false }
      }
    }
  };

  return <Bar data={chartData} options={options} />;
}
const historicalData = [
  { year: 1976, inflation: 5.77, rentGrowth: 2.93, homePriceGrowth: 7.20, vacancyRate: 5.58 },
  { year: 1977, inflation: 6.47, rentGrowth: 6.01, homePriceGrowth: 12.15, vacancyRate: 5.42 },
  { year: 1978, inflation: 7.63, rentGrowth: 6.88, homePriceGrowth: 13.99, vacancyRate: 5.12 },
  { year: 1979, inflation: 11.25, rentGrowth: 7.31, homePriceGrowth: 13.64, vacancyRate: 5.01 },
  { year: 1980, inflation: 13.50, rentGrowth: 8.84, homePriceGrowth: 7.88, vacancyRate: 5.03 },
  { year: 1981, inflation: 10.38, rentGrowth: 8.68, homePriceGrowth: 4.46, vacancyRate: 5.23 },
  { year: 1982, inflation: 6.16, rentGrowth: 7.60, homePriceGrowth: 1.06, vacancyRate: 5.37 },
  { year: 1983, inflation: 3.16, rentGrowth: 5.78, homePriceGrowth: 7.24, vacancyRate: 5.56 },
  { year: 1984, inflation: 4.37, rentGrowth: 5.20, homePriceGrowth: 4.47, vacancyRate: 5.77 },
  { year: 1985, inflation: 3.53, rentGrowth: 6.14, homePriceGrowth: 5.11, vacancyRate: 6.06 },
  { year: 1986, inflation: 1.90, rentGrowth: 5.67, homePriceGrowth: 6.46, vacancyRate: 6.53 },
  { year: 1987, inflation: 3.66, rentGrowth: 5.89, homePriceGrowth: 2.69, vacancyRate: 7.11 },
  { year: 1988, inflation: 4.08, rentGrowth: 5.99, homePriceGrowth: 5.88, vacancyRate: 7.71 },
  { year: 1989, inflation: 4.83, rentGrowth: 5.75, homePriceGrowth: 5.11, vacancyRate: 7.71 },
  { year: 1990, inflation: 5.40, rentGrowth: 5.20, homePriceGrowth: 1.46, vacancyRate: 7.41 },
  { year: 1991, inflation: 4.23, rentGrowth: 4.59, homePriceGrowth: -0.30, vacancyRate: 7.41 },
  { year: 1992, inflation: 3.03, rentGrowth: 3.41, homePriceGrowth: 2.41, vacancyRate: 7.44 },
  { year: 1993, inflation: 2.95, rentGrowth: 2.89, homePriceGrowth: 2.81, vacancyRate: 7.40 },
  { year: 1994, inflation: 2.61, rentGrowth: 3.12, homePriceGrowth: 2.24, vacancyRate: 7.36 },
  { year: 1995, inflation: 2.81, rentGrowth: 3.16, homePriceGrowth: 2.56, vacancyRate: 7.45 },
  { year: 1996, inflation: 2.93, rentGrowth: 3.22, homePriceGrowth: 2.96, vacancyRate: 7.71 },
  { year: 1997, inflation: 2.34, rentGrowth: 2.91, homePriceGrowth: 3.59, vacancyRate: 7.92 },
  { year: 1998, inflation: 1.55, rentGrowth: 3.10, homePriceGrowth: 4.83, vacancyRate: 8.09 },
  { year: 1999, inflation: 2.19, rentGrowth: 2.78, homePriceGrowth: 5.53, vacancyRate: 8.04 },
  { year: 2000, inflation: 3.38, rentGrowth: 3.65, homePriceGrowth: 7.74, vacancyRate: 8.02 },
  { year: 2001, inflation: 2.83, rentGrowth: 3.76, homePriceGrowth: 8.18, vacancyRate: 8.19 },
  { year: 2002, inflation: 1.59, rentGrowth: 3.57, homePriceGrowth: 7.37, vacancyRate: 8.90 },
  { year: 2003, inflation: 2.27, rentGrowth: 2.99, homePriceGrowth: 7.00, vacancyRate: 9.70 },
  { year: 2004, inflation: 2.68, rentGrowth: 2.91, homePriceGrowth: 8.89, vacancyRate: 10.20 },
  { year: 2005, inflation: 3.39, rentGrowth: 3.16, homePriceGrowth: 12.65, vacancyRate: 9.57 },
  { year: 2006, inflation: 3.23, rentGrowth: 4.01, homePriceGrowth: 6.34, vacancyRate: 9.66 },
  { year: 2007, inflation: 2.85, rentGrowth: 4.46, homePriceGrowth: -1.70, vacancyRate: 9.69 },
  { year: 2008, inflation: 3.84, rentGrowth: 3.88, homePriceGrowth: -7.32, vacancyRate: 9.72 },
  { year: 2009, inflation: -0.36, rentGrowth: 1.25, homePriceGrowth: -4.98, vacancyRate: 10.61 },
  { year: 2010, inflation: 1.64, rentGrowth: 1.13, homePriceGrowth: -0.08, vacancyRate: 10.62 },
  { year: 2011, inflation: 3.16, rentGrowth: 2.24, homePriceGrowth: -2.47, vacancyRate: 9.47 },
  { year: 2012, inflation: 2.07, rentGrowth: 2.69, homePriceGrowth: 1.95, vacancyRate: 8.72 },
  { year: 2013, inflation: 1.47, rentGrowth: 2.82, homePriceGrowth: 7.11, vacancyRate: 8.29 },
  { year: 2014, inflation: 1.62, rentGrowth: 3.22, homePriceGrowth: 5.16, vacancyRate: 7.57 },
  { year: 2015, inflation: 0.12, rentGrowth: 3.36, homePriceGrowth: 4.96, vacancyRate: 7.01 },
  { year: 2016, inflation: 1.26, rentGrowth: 3.66, homePriceGrowth: 5.79, vacancyRate: 6.73 },
  { year: 2017, inflation: 2.13, rentGrowth: 3.65, homePriceGrowth: 6.30, vacancyRate: 6.87 },
  { year: 2018, inflation: 2.44, rentGrowth: 3.63, homePriceGrowth: 5.35, vacancyRate: 6.88 },
  { year: 2019, inflation: 1.81, rentGrowth: 3.42, homePriceGrowth: 3.94, vacancyRate: 6.82 },
  { year: 2020, inflation: 1.23, rentGrowth: 2.47, homePriceGrowth: 7.22, vacancyRate: 6.53 },
  { year: 2021, inflation: 4.70, rentGrowth: 2.37, homePriceGrowth: 18.43, vacancyRate: 5.76 },
  { year: 2022, inflation: 8.00, rentGrowth: 6.30, homePriceGrowth: 13.83, vacancyRate: 5.62 },
  { year: 2023, inflation: 4.13, rentGrowth: 6.01, homePriceGrowth: 5.23, vacancyRate: 6.12 },
  { year: 2024, inflation: 3.00, rentGrowth: 3.00, homePriceGrowth: 3.00, vacancyRate: 6.20 }
];
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/router';

// Reusable MetricCard component
function MetricCard({ title, value }) {
  return (
    <div className="bg-[#1e1e1e] shadow-md rounded-lg p-6 flex flex-col items-center justify-center hover:shadow-xl transition">
      <h3 className="text-md font-semibold text-gray-400 mb-2 text-center">{title}</h3>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

export default function Simulations() {
  // Stores yearly simulation results for each possible historical start year
  const [yearlySimulationResults, setYearlySimulationResults] = useState([]);
  const [formData, setFormData] = useState({
    dealName: '',
    purchasePrice: '',
    monthlyRent: '',
    monthlyExpenses: '',
  });
  const [showAssumptions, setShowAssumptions] = useState(false);  // State for toggling the assumptions sidebar
  const [assumptions, setAssumptions] = useState({
    downPayment: 20,        // Default 20%
    interestRate: 5,        // Default 5%
    loanTerm: 30,           // Default 30 years
    appreciationRate: 3,    // Default 3% appreciation rate
    vacancyRate: 5,         // Default 5% vacancy rate
    inflationRate: 2,       // Default 2% inflation rate
    saleClosingCost: 6,     // Default 6% sale closing cost
  });

  const [successMessage, setSuccessMessage] = useState('');

  const handleToggleAssumptions = () => {
    setShowAssumptions(!showAssumptions);
  };

  const handleAssumptionChange = (e) => {
    const { name, value } = e.target;
    setAssumptions(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const [savedDeals, setSavedDeals] = useState([]); // stores submitted deals
  const [editIndex, setEditIndex] = useState(null);
  const [editDealId, setEditDealId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [expiredSession, setExpiredSession] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [metrics, setMetrics] = useState({});

  // Simulation results state
  const [simulationResults, setSimulationResults] = useState([]);

  const router = useRouter();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setExpiredSession(true);
        router.push('/login');
      } else {
        setUserId(user.id);
        fetchDeals(user.id);
      }
    }
    checkUser();
  }, []);

  async function fetchDeals(userId) {
    setLoading(true);
    const { data, error } = await supabase
      .from('deals')
      .select('id, deal_name, purchase_price, monthly_rent, monthly_expenses, created_at, user_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching deals:", error.message);
    } else {
      setSavedDeals(data);
    }
    setLoading(false);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    if (!userId) {
      setLoading(false);
      return; // Safety check
    }

    if (editDealId !== null) {
      const { data, error } = await supabase
        .from('deals')
        .update({
          deal_name: formData.dealName,
          purchase_price: parseFloat(formData.purchasePrice),
          monthly_rent: parseFloat(formData.monthlyRent),
          monthly_expenses: parseFloat(formData.monthlyExpenses),
        })
        .eq('id', editDealId)
        .eq('user_id', userId)
        .select();

      if (error) {
        console.error('Error updating deal:', error.message);
      } else {
        console.log('Deal updated successfully:', data);
        fetchDeals(userId);
        setSuccessMessage('Deal Updated!');
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setSuccessMessage('');
        }, 2500);
        setEditDealId(null);
      }
    } else {
      const { error } = await supabase.from('deals').insert([
        {
          user_id: userId,
          deal_name: formData.dealName,
          purchase_price: parseFloat(formData.purchasePrice),
          monthly_rent: parseFloat(formData.monthlyRent),
          monthly_expenses: parseFloat(formData.monthlyExpenses),
        },
      ]);

      if (error) {
        console.error('Error saving new deal:', error.message);
      } else {
        fetchDeals(userId);
        setSuccessMessage('New Deal Created!');
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setSuccessMessage('');
        }, 2500);
      }
    }

    setFormData({
      dealName: '',
      purchasePrice: '',
      monthlyRent: '',
      monthlyExpenses: '',
    });
    setEditIndex(null);
    setSelectedDeal(null);
    setLoading(false);
  }

  async function handleDelete(dealId) {
    const { error } = await supabase
      .from('deals')
      .delete()
      .eq('id', dealId);

    if (error) {
      console.error('Error deleting deal:', error.message);
    } else {
      fetchDeals(userId);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
      if (selectedDeal && selectedDeal.id === dealId) {
        setSelectedDeal(null);
        setEditIndex(null);
        setFormData({
          dealName: '',
          purchasePrice: '',
          monthlyRent: '',
          monthlyExpenses: '',
        });
      }
    }
  }

  function handleEditDeal(deal) {
    const indexToEdit = savedDeals.findIndex(d => d.id === deal.id);
    setFormData({
      dealName: deal.deal_name,
      purchasePrice: deal.purchase_price,
      monthlyRent: deal.monthly_rent,
      monthlyExpenses: deal.monthly_expenses,
    });
    setEditIndex(indexToEdit);
    setSelectedDeal(deal);
    setEditDealId(deal.id);
  }

  function handleSelectDeal(deal) {
    setSelectedDeal(deal);
    calculateMetrics(deal);
  }

  function formatCurrency(val) {
    // Always $ and comma, rounded to nearest dollar
    if (val === null || val === undefined || isNaN(val)) return '$0';
    return '$' + Math.round(val).toLocaleString();
  }

  function calculateMetrics(deal) {
    // Historical Simulation
    function runHistoricalSimulation() {
      if (!selectedDeal) return;

      const initialValue = parseFloat(selectedDeal.purchase_price);
      const rent = parseFloat(selectedDeal.monthly_rent);
      const expenses = parseFloat(selectedDeal.monthly_expenses);
      const dp = parseFloat(assumptions.downPayment) / 100;
      const loanTerm = parseInt(assumptions.loanTerm);
      const initialLoan = initialValue * (1 - dp);
      const results = [];

      let value = initialValue;
      let balance = initialLoan;
      let annualRent = rent * 12;
      let annualExpenses = expenses * 12;

      for (let i = 0; i < historicalData.length; i++) {
        const yearData = historicalData[i];
        annualRent *= (1 + yearData.rentGrowth / 100);
        annualExpenses *= (1 + yearData.inflation / 100);
        const noi = annualRent - annualExpenses;
        const interestPayment = balance * (yearData.interestRate / 100);
        const cashFlow = noi - interestPayment;
        value *= (1 + yearData.inflation / 100);
        const equity = value - balance;

        results.push({
          year: yearData.year,
          cashFlow: Math.round(cashFlow),
          noi: Math.round(noi),
          value: Math.round(value),
          equity: Math.round(equity),
          interestRate: yearData.interestRate,
          inflation: yearData.inflation,
          rentGrowth: yearData.rentGrowth,
        });
      }

      setSimulationResults(results);
      console.log("Simulation Results:", results);
    }
    // Defensive: if no assumptions or missing values, don't calculate
    const loanTerm = parseFloat(assumptions.loanTerm);
    const inflationRate = parseFloat(assumptions.inflationRate); // Rent and expense inflation rate
    const appreciationRate = parseFloat(assumptions.appreciationRate); // Property appreciation rate
    const vacancyRate = parseFloat(assumptions.vacancyRate) / 100; // Vacancy rate as a percentage
    const purchasePrice = parseFloat(deal.purchase_price);
    const rent = parseFloat(deal.monthly_rent);
    const expenses = parseFloat(deal.monthly_expenses);
    const downPaymentPercent = parseFloat(assumptions.downPayment) / 100;
    const interestRate = parseFloat(assumptions.interestRate) / 100 / 12;
    let monthlyPayment = null;
    let formattedMonthlyPayment = "";
    let formattedMonthlyIncome = "";
    let formattedMonthlyExpenses = "";

    // Defensive for monthly payment calculation
    let downPayment = purchasePrice * downPaymentPercent;
    let principal = purchasePrice - downPayment;
    let n = loanTerm * 12;
    if (
      !isNaN(purchasePrice) &&
      !isNaN(downPaymentPercent) &&
      !isNaN(interestRate) &&
      !isNaN(loanTerm) &&
      isFinite(interestRate) &&
      interestRate > 0 &&
      loanTerm > 0
    ) {
      monthlyPayment = principal * (interestRate * Math.pow(1 + interestRate, n)) / (Math.pow(1 + interestRate, n) - 1);
      formattedMonthlyPayment = formatCurrency(monthlyPayment);
    }
    if (!isNaN(rent)) {
      formattedMonthlyIncome = formatCurrency(rent);
    }
    if (!isNaN(expenses)) {
      formattedMonthlyExpenses = formatCurrency(expenses);
    }
    if (
      isNaN(loanTerm) ||
      isNaN(appreciationRate) ||
      isNaN(purchasePrice) ||
      isNaN(rent) ||
      isNaN(expenses)
    ) {
      setMetrics({
        monthlyPayment: formattedMonthlyPayment,
        monthlyIncome: formattedMonthlyIncome,
        monthlyExpenses: formattedMonthlyExpenses,
      });
      return;
    }

    // Cash Flow and Profit Flow Calculation
    const cashFlows = [];
    const profitFlows = [];
    let totalCashFlow = 0;
    let negativeCashFlowYears = 0;
    let annualRent = rent;
    let annualExpenses = expenses;
    let propertyValue = purchasePrice;
    let loanBalance = principal;
    const debtService = monthlyPayment * 12;
    const equityEachYear = [];
    const cumulativeCashFlowEachYear = [];
    const dscrEachYear = [];
    let cumulativeCashFlow = 0;
    let breakEvenYear = null;
    // For loan amortization:
    let monthlyRate = parseFloat(assumptions.interestRate) / 100 / 12;
    let monthsLeft = loanTerm * 12;
    let balance = principal;

    // For standard deviation and Sharpe Ratio
    function stddev(arr) {
      if (!arr || arr.length === 0) return 0;
      const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
      const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
      return Math.sqrt(variance);
    }

    for (let year = 1; year <= loanTerm; year++) {
      // Adjust rent for inflation and account for vacancy
      annualRent = annualRent * (1 + inflationRate / 100);
      const adjustedRent = annualRent * (1 - vacancyRate);
      const NOI = adjustedRent * 12 - annualExpenses * 12;
      const cashFlow = NOI - debtService;
      cashFlows.push(cashFlow);
      // Compute appreciation gain for this year (before propertyValue grows below)
      const appreciationGain = propertyValue * (appreciationRate / 100);
      // Profit flow: cash flow plus appreciation gain each year, except last year is cashFlow + net sale proceeds
      if (year === loanTerm) {
        const netSaleProceeds = propertyValue * (1 - parseFloat(assumptions.saleClosingCost) / 100);
        profitFlows.push(cashFlow + netSaleProceeds);
      } else {
        profitFlows.push(cashFlow + appreciationGain);
      }
      totalCashFlow += cashFlow;
      if (cashFlow < 0) {
        negativeCashFlowYears++;
      }
      // Loan amortization for this year (12 months)
      for (let m = 0; m < 12; m++) {
        if (balance <= 0) break;
        const interest = balance * monthlyRate;
        const principalPaid = Math.min(monthlyPayment - interest, balance);
        balance -= principalPaid;
        if (balance < 0) balance = 0;
      }
      // Cumulative equity = property value - loan balance
      propertyValue = propertyValue * (1 + appreciationRate / 100);
      const equity = propertyValue - balance;
      equityEachYear.push(equity);
      // Cumulative cash flow up to this year
      cumulativeCashFlow += cashFlow;
      cumulativeCashFlowEachYear.push(cumulativeCashFlow);
      // DSCR (NOI / Debt Service)
      let dscr = debtService !== 0 ? NOI / debtService : 0;
      dscrEachYear.push(dscr);
      // Break Even Year: first year when cumulative cash flow >= initial down payment
      if (
        breakEvenYear === null &&
        cumulativeCashFlow >= downPayment
      ) {
        breakEvenYear = year;
      }
      annualExpenses = annualExpenses * (1 + inflationRate / 100);
    }

    // Final Property Value Calculation (compounded appreciation over the loan term)
    const finalPropertyValue = propertyValue;

    // Calculate IRR of Cash Flow (using a simple IRR calculation)
    const irr = calculateIRR([-purchasePrice * downPaymentPercent, ...cashFlows]);
    // Total IRR with Appreciation (cash flow plus appreciation counted annually, last year includes net sale)
    const totalIRR = calculateIRR([-purchasePrice * downPaymentPercent, ...profitFlows]);

    // Calculate Equity Multiple: Total Cash Flow / Initial Investment
    const equityMultiple = totalCashFlow / (purchasePrice * downPaymentPercent);
    // Calculate Average Cash Flow
    const averageCashFlow = totalCashFlow / loanTerm;

    // Standard deviation of cash flows
    const cashFlowStdDev = stddev(cashFlows);
    // Sharpe Ratio = average cash flow / stddev
    const sharpeRatio = cashFlowStdDev !== 0 ? averageCashFlow / cashFlowStdDev : null;
    // Average DSCR
    const averageDSCR = dscrEachYear.length > 0 ? dscrEachYear.reduce((a, b) => a + b, 0) / dscrEachYear.length : 0;
    // Years where DSCR < 1.2
    const yearsDSCRUnder1_2 = dscrEachYear.filter(x => x < 1.2).length;

    setMetrics({
      irrOfCashFlow: irr !== null ? irr.toFixed(2) : 'N/A',
      totalIRRWithAppreciation: totalIRR !== null ? totalIRR.toFixed(2) : 'N/A',
      equityMultiple: equityMultiple.toFixed(2),
      yearsOfNegativeCashFlow: negativeCashFlowYears,
      totalCashFlow: formatCurrency(totalCashFlow),
      averageCashFlow: formatCurrency(averageCashFlow),
      finalPropertyValue: formatCurrency(finalPropertyValue),
      monthlyPayment: formattedMonthlyPayment,
      monthlyIncome: formattedMonthlyIncome,
      monthlyExpenses: formattedMonthlyExpenses,
      // New metrics:
      breakEvenYear: breakEvenYear,
      averageDSCR: averageDSCR ? averageDSCR.toFixed(2) : 'N/A',
      yearsDSCRUnder1_2: yearsDSCRUnder1_2,
      sharpeRatio: sharpeRatio !== null && isFinite(sharpeRatio) ? sharpeRatio.toFixed(2) : 'N/A',
      downPaymentAmount: formatCurrency(downPayment),
      appreciation: finalPropertyValue && purchasePrice ? formatCurrency(finalPropertyValue - purchasePrice) : '$0',
      finalEquity: equityEachYear.length > 0 ? equityEachYear[equityEachYear.length - 1] : null,
    });

    // Save calculated metrics to Supabase
    (async () => {
      const metricsToSave = {
        irrCashFlow: irr,
        irrTotal: totalIRR,
        sharpeRatio,
        equityMultiple,
        finalValue: finalPropertyValue,
        appreciation: finalPropertyValue - purchasePrice,
        breakEvenYear,
        totalCashFlow,
        averageCashFlow,
        negativeCashFlowYears,
        averageDscr: averageDSCR,
        yearsDscrBelow1_2: yearsDSCRUnder1_2,
        finalEquity: equityEachYear.length > 0 ? equityEachYear[equityEachYear.length - 1] : null,
        worstCashFlow: Math.min(...cashFlows),
        maxDrawdownSim: Math.max(
          ...equityEachYear.map((e, i) =>
            i === 0 ? 0 : (equityEachYear[i - 1] - e) / equityEachYear[i - 1]
          )
        ),
        minDscr: Math.min(...dscrEachYear),
        maxLtv: Math.max(
          ...equityEachYear.map((e, i) => {
            const val =
              propertyValue /
              Math.pow(1 + appreciationRate / 100, loanTerm - 1 - i);
            // reverse back to earlier values
            return val ? 1 - e / val : 0;
          })
        ),
      };

      await supabase
        .from('deals')
        .update({ metrics: metricsToSave })
        .eq('id', deal.id);
    })();
  }

  // Simulate across all historical start years and compute summary metrics for each
  function simulateAcrossYears() {
    if (!selectedDeal) return;

    const resultsByYear = [];
    const loanTerm = parseInt(assumptions.loanTerm);
    const userInterestRate = parseFloat(assumptions.interestRate);
    const dp = parseFloat(assumptions.downPayment) / 100;

    const purchasePrice = parseFloat(selectedDeal.purchase_price);
    const rent = parseFloat(selectedDeal.monthly_rent);
    const expenses = parseFloat(selectedDeal.monthly_expenses);

    const initialLoan = purchasePrice * (1 - dp);
    const monthlyRate = userInterestRate / 100 / 12;
    const n = loanTerm * 12;

    const monthlyPayment = monthlyRate === 0
      ? initialLoan / n
      : initialLoan * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);

    for (let startIndex = 0; startIndex <= historicalData.length - loanTerm; startIndex++) {
      const sliced = historicalData.slice(startIndex, startIndex + loanTerm);
      const startYear = sliced[0].year;

      let value = purchasePrice;
      let balance = initialLoan;
      let annualRent = rent * 12;
      let annualExpenses = expenses * 12;
      let cashFlows = [];
      let totalCashFlow = 0;
      let negativeCFYears = 0;
      let worstCF = Infinity;
      // DSCR/LTV tracking
      let minDSCR = Infinity;
      let maxLTV = 0;
      // Track total DSCR for mean
      let totalDSCR = 0;
      // Advanced metrics tracking
      let peakValue = purchasePrice;
      let peakEquity = purchasePrice * dp;
      let maxDrawdownValue = 0;
      let maxDrawdownEquity = 0;
      let yearsDSCRUnder1_2 = 0;

      for (let i = 0; i < sliced.length; i++) {
        const yearData = sliced[i];
        annualRent *= (1 + yearData.rentGrowth / 100);
        annualExpenses *= (1 + yearData.inflation / 100);
        // Use historical vacancy rate for this year (fallback to 0 if missing)
        const adjustedRent = annualRent * (1 - (yearData.vacancyRate || 0) / 100);
        const noi = adjustedRent - annualExpenses;

        // Amortize loan over 12 months
        for (let m = 0; m < 12; m++) {
          if (balance <= 0) break;
          const interest = balance * monthlyRate;
          const principalPaid = Math.min(monthlyPayment - interest, balance);
          balance -= principalPaid;
        }

        const debtService = monthlyPayment * 12;
        const cashFlow = noi - debtService;
        cashFlows.push(cashFlow);
        totalCashFlow += cashFlow;
        if (cashFlow < 0) negativeCFYears++;
        if (cashFlow < worstCF) worstCF = cashFlow;

        // DSCR and LTV calculation
        const dscr = debtService !== 0 ? noi / debtService : 0;
        minDSCR = Math.min(minDSCR, dscr);
        totalDSCR += dscr;

        const ltv = value !== 0 ? balance / value : 0;
        maxLTV = Math.max(maxLTV, ltv);

        // Advanced metrics
        const equity = value - balance;
        if (value > peakValue) peakValue = value;
        if (equity > peakEquity) peakEquity = equity;
        const drawdownValue = (peakValue - value) / peakValue;
        maxDrawdownValue = Math.max(maxDrawdownValue, drawdownValue);
        const drawdownEquity = (peakEquity - equity) / peakEquity;
        maxDrawdownEquity = Math.max(maxDrawdownEquity, drawdownEquity);
        if (dscr < 1.2) yearsDSCRUnder1_2++;

        value *= (1 + yearData.inflation / 100);
      }

      const averageCF = totalCashFlow / loanTerm;
      const irr = calculateIRR([-initialLoan, ...cashFlows]);
      const irrTotal = calculateIRR([
        -purchasePrice * dp,
        ...cashFlows.slice(0, loanTerm - 1),
        cashFlows[loanTerm - 1] + value
      ]);
      const equityMultiple = (purchasePrice * dp) !== 0 ? totalCashFlow / (purchasePrice * dp) : null;

      const stddev = (arr) => {
        if (!arr || arr.length === 0) return 0;
        const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
        const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
        return Math.sqrt(variance);
      };
      const sharpe = stddev(cashFlows) > 0 ? averageCF / stddev(cashFlows) : null;
      // Compute mean DSCR
      const meanDSCR = (loanTerm !== 0) ? (totalDSCR / loanTerm).toFixed(2) : 'N/A';
      // After loop, calculate finalEquity
      const finalEquity = value - balance;

      resultsByYear.push({
        year: startYear,
        irrCF: irr !== null ? irr.toFixed(2) : 'N/A',
        irrTotal: irrTotal !== null ? irrTotal.toFixed(2) : 'N/A',
        equityMultiple: equityMultiple !== null ? equityMultiple.toFixed(2) : 'N/A',
        averageCF: isFinite(averageCF) ? Math.round(averageCF) : 0,
        totalCF: isFinite(totalCashFlow) ? Math.round(totalCashFlow) : 0,
        worstCF: isFinite(worstCF) ? Math.round(worstCF) : 0,
        negativeCFYears,
        sharpeRatio: sharpe !== null && isFinite(sharpe) ? sharpe.toFixed(2) : 'N/A',
        finalValue: isFinite(value) ? Math.round(value) : 0,
        minDSCR: minDSCR !== Infinity ? minDSCR.toFixed(2) : 'N/A',
        maxLTV: maxLTV !== 0 ? (maxLTV * 100).toFixed(1) : 'N/A',
        meanDSCR,
        // Advanced metrics:
        maxDrawdownValue: (maxDrawdownValue * 100).toFixed(2),
        maxDrawdownEquity: (maxDrawdownEquity * 100).toFixed(2),
        yearsDSCRUnder1_2,
        finalEquity: Math.round(finalEquity),
      });
    }

    setYearlySimulationResults(resultsByYear);
    console.log("Year-by-year simulations:", resultsByYear);
  }

  function calculateIRR(cashFlows) {
    // Newton-Raphson method for IRR
    const guess = 0.1;
    let rate = guess;
    const maxIterations = 1000;
    let tolerance = 1e-6;
    let iteration = 0;
    let npv;
    if (!cashFlows || cashFlows.length < 2) return null;
    do {
      npv = cashFlows.reduce((acc, curr, index) => {
        return acc + curr / Math.pow(1 + rate, index);
      }, 0);
      const derivative = cashFlows.reduce((acc, curr, index) => {
        return acc - index * curr / Math.pow(1 + rate, index + 1);
      }, 0);
      if (derivative === 0) return null;
      const newRate = rate - npv / derivative;
      if (isNaN(newRate) || !isFinite(newRate)) return null;
      rate = newRate;
      iteration++;
    } while (Math.abs(npv) > tolerance && iteration < maxIterations);
    return rate * 100;
  }

  // Run simulateAcrossYears whenever selectedDeal or assumptions change
  useEffect(() => {
    if (selectedDeal) {
      simulateAcrossYears();
    }
  }, [selectedDeal, assumptions]);

  // Run calculateMetrics(selectedDeal) whenever assumptions change (and a deal is selected)
  useEffect(() => {
    if (selectedDeal) {
      calculateMetrics(selectedDeal);
    }
  }, [assumptions]);

  return (
    <>
      <Navbar />
      <div
        className="flex min-h-screen overflow-hidden"
        style={{
          backgroundColor: '#121212',
          color: '#e0e0e0',
        }}
      >
        {/* Main Sidebar (Deal Form) */}
        <div className="h-screen sticky top-0 overflow-y-auto" style={{ flexShrink: 0 }}>
          <aside
            className="w-80 p-6 h-full overflow-y-auto space-y-4"
            style={{
              backgroundColor: '#1e1e1e',
              borderRight: '2px solid #333',
              color: '#e0e0e0',
            }}
          >
            {/* Assumptions input fields */}
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-semibold text-white">Assumptions</h3>
              <div>
                <label className="block text-sm font-medium text-gray-300">Loan Term (Years)</label>
                <input
                  type="number"
                  name="loanTerm"
                  value={assumptions.loanTerm}
                  onChange={handleAssumptionChange}
                  className="w-full p-2 mt-1 rounded-md bg-[#2a2a2a] text-white border border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Interest Rate (%)</label>
                <input
                  type="number"
                  name="interestRate"
                  value={assumptions.interestRate}
                  onChange={handleAssumptionChange}
                  className="w-full p-2 mt-1 rounded-md bg-[#2a2a2a] text-white border border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Down Payment (%)</label>
                <input
                  type="number"
                  name="downPayment"
                  value={assumptions.downPayment}
                  onChange={handleAssumptionChange}
                  className="w-full p-2 mt-1 rounded-md bg-[#2a2a2a] text-white border border-gray-600"
                />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-white mb-6">Your Deals</h2>
            {savedDeals.map((deal) => (
              <div
                key={deal.id}
                onClick={() => handleSelectDeal(deal)}
                className={`cursor-pointer p-4 border rounded-md transition-all duration-200 ${
                  selectedDeal?.id === deal.id
                    ? 'bg-blue-800 border-blue-400 ring-2 ring-blue-300'
                    : 'bg-[#232323] border-[#333] hover:bg-[#2c2c2c]'
                }`}
              >
                <p className="text-md font-semibold text-white truncate">{deal.deal_name}</p>
              </div>
            ))}
          </aside>
        </div>

        {/* Assumptions Sidebar removed */}

        <main
          className="flex-1 overflow-y-auto"
          style={{
            backgroundColor: '#121212',
            color: '#e0e0e0',
            height: '100vh',
          }}
        >
          <div className="max-w-screen-xl mx-auto w-full space-y-12 p-10 pt-16">
            {/* Selected Deal label at top center (now styled card) */}
            {selectedDeal && (
              <div className="mb-6">
                <div className="bg-[#475569] px-6 py-4 rounded-lg shadow-md text-2xl font-bold text-white text-center w-full">
                  {selectedDeal.deal_name}
                </div>
              </div>
            )}
            {/* Summary Card Row */}
            {selectedDeal && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 w-full mt-6">
                  <MetricCard title="Purchase Price" value={metrics?.monthlyIncome ? `$${parseFloat(selectedDeal.purchase_price).toLocaleString()}` : '$0'} />
                  <MetricCard title="Down Payment" value={metrics?.downPaymentAmount || '$0'} />
                  <MetricCard title="Monthly Rent" value={metrics?.monthlyIncome || '$0'} />
                  <MetricCard title="Monthly Expenses" value={metrics?.monthlyExpenses || '$0'} />
                  <MetricCard title="Monthly Payment" value={metrics?.monthlyPayment || '$0'} />
                </div>
                {/* Divider after top metrics row */}
                <hr className="border-t border-[#475569] my-8" />
              </>
            )}
            {/* IRR CF and IRR Total Histograms at top */}
            {selectedDeal && yearlySimulationResults.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="bg-[#1e1e1e] shadow-md rounded-lg p-6">
                    <HistogramChart
                      label="Distribution of IRR CF (%)"
                      data={yearlySimulationResults
                        .map(r => parseFloat(r.irrCF))
                        .filter(val => !isNaN(val))}
                    />
                  </div>
                  <div className="bg-[#1e1e1e] shadow-md rounded-lg p-6">
                    <HistogramChart
                      label="Distribution of IRR Total (%)"
                      data={yearlySimulationResults
                        .map(r => parseFloat(r.irrTotal))
                        .filter(val => !isNaN(val))}
                    />
                  </div>
                </div>
              </>
            )}
            {/* IRR/Sharpe Summary Cards */}
            {selectedDeal && yearlySimulationResults.length > 0 && (
              <>
                <div className="mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(() => {
                      // IRR Total
                      const irrTotalVals = yearlySimulationResults
                        .map(r => parseFloat(r.irrTotal))
                        .filter(v => !isNaN(v));
                      const avgIRRT = irrTotalVals.reduce((a, b) => a + b, 0) / irrTotalVals.length;
                      const minIRRT = Math.min(...irrTotalVals);
                      const maxIRRT = Math.max(...irrTotalVals);

                      // IRR CF
                      const irrCFVals = yearlySimulationResults
                        .map(r => parseFloat(r.irrCF))
                        .filter(v => !isNaN(v));
                      const avgIRRCF = irrCFVals.reduce((a, b) => a + b, 0) / irrCFVals.length;
                      const minIRRCF = Math.min(...irrCFVals);
                      const maxIRRCF = Math.max(...irrCFVals);

                      // Sharpe
                      const sharpeVals = yearlySimulationResults
                        .map(r => parseFloat(r.sharpeRatio))
                        .filter(v => !isNaN(v));
                      const avgSharpe = sharpeVals.reduce((a, b) => a + b, 0) / sharpeVals.length;
                      const minSharpe = Math.min(...sharpeVals);
                      const maxSharpe = Math.max(...sharpeVals);

                    return (
                      <>
                        {/* IRR CF */}
                        <div className="bg-[#1e1e1e] shadow-md rounded-lg p-6 flex flex-col items-center justify-center hover:shadow-xl transition w-full">
                          <h3 className="text-md font-semibold text-gray-400 mb-2 text-center">IRR CF</h3>
                          <p className="text-3xl font-bold text-white mb-2">{avgIRRCF.toFixed(2)}%</p>
                          <div className="flex gap-6 justify-center items-center w-full mt-2 text-sm">
                            <p>
                              <span className="text-gray-400 font-normal">Min:</span>{' '}
                              <span className="text-white font-bold">{minIRRCF.toFixed(2)}%</span>
                            </p>
                            <p>
                              <span className="text-gray-400 font-normal">Max:</span>{' '}
                              <span className="text-white font-bold">{maxIRRCF.toFixed(2)}%</span>
                            </p>
                          </div>
                        </div>

                        {/* IRR Total */}
                        <div className="bg-[#1e1e1e] shadow-md rounded-lg p-6 flex flex-col items-center justify-center hover:shadow-xl transition w-full">
                          <h3 className="text-md font-semibold text-gray-400 mb-2 text-center">IRR Total</h3>
                          <p className="text-3xl font-bold text-white mb-2">{avgIRRT.toFixed(2)}%</p>
                          <div className="flex gap-6 justify-center items-center w-full mt-2 text-sm">
                            <p>
                              <span className="text-gray-400 font-normal">Min:</span>{' '}
                              <span className="text-white font-bold">{minIRRT.toFixed(2)}%</span>
                            </p>
                            <p>
                              <span className="text-gray-400 font-normal">Max:</span>{' '}
                              <span className="text-white font-bold">{maxIRRT.toFixed(2)}%</span>
                            </p>
                          </div>
                        </div>

                        {/* Sharpe */}
                        <div className="bg-[#1e1e1e] shadow-md rounded-lg p-6 flex flex-col items-center justify-center hover:shadow-xl transition w-full">
                          <h3 className="text-md font-semibold text-gray-400 mb-2 text-center">Sharpe Ratio</h3>
                          <p className="text-3xl font-bold text-white mb-2">{avgSharpe.toFixed(2)}</p>
                          <div className="flex gap-6 justify-center items-center w-full mt-2 text-sm">
                            <p>
                              <span className="text-gray-400 font-normal">Min:</span>{' '}
                              <span className="text-white font-bold">{minSharpe.toFixed(2)}</span>
                            </p>
                            <p>
                              <span className="text-gray-400 font-normal">Max:</span>{' '}
                              <span className="text-white font-bold">{maxSharpe.toFixed(2)}</span>
                            </p>
                          </div>
                        </div>
                      </>
                    );
                    })()}
                  </div>
                </div>
                {/* Divider after IRR/Sharpe summary cards */}
                <hr className="border-t border-[#475569] my-8" />
              </>
            )}
            {/* Final Property Value Summary Cards (with Appreciation and Final Equity) */}
            {selectedDeal && yearlySimulationResults.length > 0 && (
              <div className="mb-8">
                {(() => {
                  // Final Property Value
                  const finalValues = yearlySimulationResults
                    .map(r => parseFloat(r.finalValue))
                    .filter(v => !isNaN(v));
                  const avg = finalValues.reduce((a, b) => a + b, 0) / finalValues.length;
                  const min = Math.min(...finalValues);
                  const max = Math.max(...finalValues);
                  // Appreciation
                  const purchasePrice = selectedDeal && selectedDeal.purchase_price ? parseFloat(selectedDeal.purchase_price) : 0;
                  const appreciationVals = finalValues.map(v => v - purchasePrice);
                  const avgApp = appreciationVals.reduce((a, b) => a + b, 0) / appreciationVals.length;
                  const minApp = Math.min(...appreciationVals);
                  const maxApp = Math.max(...appreciationVals);
                  // Down payment percent
                  const dp = selectedDeal && assumptions?.downPayment ? parseFloat(assumptions.downPayment) / 100 : 0;
                  // Correct Equity Added = Final Value - Down Payment (amount)
                  const downPaymentAmount = purchasePrice * dp;
                  const equityAddedVals = finalValues.map(v => v - downPaymentAmount);
                  const avgEquityAdded = equityAddedVals.reduce((a, b) => a + b, 0) / equityAddedVals.length;
                  const minEquityAdded = Math.min(...equityAddedVals);
                  const maxEquityAdded = Math.max(...equityAddedVals);
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Final Property Value Card */}
                      <div className="bg-[#1e1e1e] shadow-md rounded-lg p-6 flex flex-col items-center justify-center hover:shadow-xl transition w-full">
                        <h3 className="text-md font-semibold text-gray-400 mb-2 text-center">Final Property Value</h3>
                        <p className="text-3xl font-bold text-white mb-2">${Math.round(avg).toLocaleString()}</p>
                        <div className="flex gap-6 justify-center items-center w-full mt-2 text-sm">
                          <p>
                            <span className="text-gray-400 font-normal">Min:</span>{' '}
                            <span className="text-white font-bold">${Math.round(min).toLocaleString()}</span>
                          </p>
                          <p>
                            <span className="text-gray-400 font-normal">Max:</span>{' '}
                            <span className="text-white font-bold">${Math.round(max).toLocaleString()}</span>
                          </p>
                        </div>
                      </div>
                      {/* Appreciation Card */}
                      <div className="bg-[#1e1e1e] shadow-md rounded-lg p-6 flex flex-col items-center justify-center hover:shadow-xl transition w-full">
                        <h3 className="text-md font-semibold text-gray-400 mb-2 text-center">Appreciation</h3>
                        <p className="text-3xl font-bold text-white mb-2">${Math.round(avgApp).toLocaleString()}</p>
                        <div className="flex gap-6 justify-center items-center w-full mt-2 text-sm">
                          <p>
                            <span className="text-gray-400 font-normal">Min:</span>{' '}
                            <span className="text-white font-bold">${Math.round(minApp).toLocaleString()}</span>
                          </p>
                          <p>
                            <span className="text-gray-400 font-normal">Max:</span>{' '}
                            <span className="text-white font-bold">${Math.round(maxApp).toLocaleString()}</span>
                          </p>
                        </div>
                      </div>
                      {/* Equity Added Card */}
                      <div className="bg-[#1e1e1e] shadow-md rounded-lg p-6 flex flex-col items-center justify-center hover:shadow-xl transition w-full">
                        <h3 className="text-md font-semibold text-gray-400 mb-2 text-center">Equity Added</h3>
                        <p className="text-3xl font-bold text-white mb-2">${Math.round(avgEquityAdded).toLocaleString()}</p>
                        <div className="flex gap-6 justify-center items-center w-full mt-2 text-sm">
                          <p>
                            <span className="text-gray-400 font-normal">Min:</span>{' '}
                            <span className="text-white font-bold">${Math.round(minEquityAdded).toLocaleString()}</span>
                          </p>
                          <p>
                            <span className="text-gray-400 font-normal">Max:</span>{' '}
                            <span className="text-white font-bold">${Math.round(maxEquityAdded).toLocaleString()}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
            {/* Histogram of Final Property Value */}
            {selectedDeal && yearlySimulationResults.length > 0 && (
              <div className="mt-12">
                <div className="bg-[#1e1e1e] shadow-md rounded-lg p-6">
                  <HistogramChart
                    label="Distribution of Final Property Value ($)"
                    data={yearlySimulationResults
                      .map(r => parseFloat(r.finalValue))
                      .filter(val => !isNaN(val))}
                  />
                </div>
                {/* Divider before Risk Metrics */}
                <hr className="border-t border-[#475569] my-8" />
                {/* Worst CF and DSCR radial charts side-by-side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Worst CF Histogram */}
                  <div className="bg-[#1e1e1e] shadow-md rounded-lg p-6">
                    <HistogramChart
                      label="Distribution of Worst CF ($)"
                      data={yearlySimulationResults
                        .map(r => parseFloat(r.worstCF))
                        .filter(val => !isNaN(val))}
                    />
                  </div>

                  {/* DSCR Radial Chart */}
                  {Array.isArray(yearlySimulationResults) && yearlySimulationResults.length > 0 && (() => {
                    const dscrVals = yearlySimulationResults
                      .map(r => parseFloat(r.yearsDSCRUnder1_2))
                      .filter(v => !isNaN(v));
                    const avg = dscrVals.reduce((a, b) => a + b, 0) / dscrVals.length;
                    const safe = 30 - avg;
                    const chartData = {
                      labels: ['DSCR < 1.2', 'Safe Years'],
                      datasets: [{
                        data: [avg, safe],
                        backgroundColor: ['#d1d5db', '#475569'],
                        borderWidth: 0
                      }]
                    };

                    return (
                      <div
                        className="bg-[#1e1e1e] rounded-lg shadow-md p-6"
                        style={{ height: "360px", width: "100%" }}
                      >
                        <h3 className="text-md font-semibold text-gray-400 mb-4 text-center">
                          DSCR &lt; 1.2 (30 Year Span)
                        </h3>
                        <div className="w-full flex justify-between items-center h-full">
                          <div className="flex-1 flex justify-center items-center h-full">
                            <div className="w-56 h-56 flex items-center justify-center">
                              <Doughnut
                                data={chartData}
                                options={{
                                  plugins: {
                                    legend: {
                                      display: false
                                    }
                                  }
                                }}
                                className="mx-auto my-auto"
                              />
                            </div>
                          </div>
                          <div className="ml-6 text-sm text-gray-300 space-y-2 flex flex-col justify-center">
                            <div className="flex items-center">
                              <span className="w-4 h-4 bg-gray-300 inline-block mr-2"></span>
                              <span>DSCR &lt; 1.2</span>
                            </div>
                            <div className="flex items-center">
                              <span className="w-4 h-4 bg-[#475569] inline-block mr-2"></span>
                              <span>Safe Years</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
                {/* Risk Metrics Row 1 (DSCR + LTV) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {(() => {
                    const meanDSCRs = yearlySimulationResults.map(r => parseFloat(r.meanDSCR)).filter(v => !isNaN(v));
                    const minDSCRs = yearlySimulationResults.map(r => parseFloat(r.minDSCR)).filter(v => !isNaN(v));
                    const maxLTVs = yearlySimulationResults.map(r => parseFloat(r.maxLTV)).filter(v => !isNaN(v));
                    const dscrRisk = yearlySimulationResults.map(r => parseInt(r.yearsDSCRUnder1_2)).filter(v => !isNaN(v));

                    const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

                    return (
                      <>
                        <MetricCard title="Min DSCR" value={Math.min(...minDSCRs).toFixed(2)} />
                        <MetricCard title="Mean DSCR" value={avg(meanDSCRs).toFixed(2)} />
                        <MetricCard title="Max LTV" value={Math.max(...maxLTVs).toFixed(1) + '%'} />
                        <MetricCard title="Years DSCR < 1.2" value={avg(dscrRisk).toFixed(1)} />
                      </>
                    );
                  })()}
                </div>
                {/* Risk Metrics Row 2 (CF & Drawdowns) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {(() => {
                    const worstCFs = yearlySimulationResults.map(r => parseFloat(r.worstCF)).filter(v => !isNaN(v));
                    const maxDDValue = yearlySimulationResults.map(r => parseFloat(r.maxDrawdownValue)).filter(v => !isNaN(v));
                    const maxDDEquity = yearlySimulationResults.map(r => parseFloat(r.maxDrawdownEquity)).filter(v => !isNaN(v));

                    const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

                    return (
                      <>
                        <MetricCard title="Worst CF" value={`$${Math.round(avg(worstCFs)).toLocaleString()}`} />
                        <MetricCard title="Max DD (Value)" value={`${avg(maxDDValue).toFixed(2)}%`} />
                        <MetricCard title="Max DD (Equity)" value={`${avg(maxDDEquity).toFixed(2)}%`} />
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
            {/* Results Table */}
            {false && (
              <div className="mt-12 overflow-x-auto">
                <h3 className="text-xl font-semibold text-white mb-4">Simulation Results by Year</h3>
                <table className="min-w-full text-sm text-left text-gray-300 border border-gray-600">
                  <thead className="bg-[#1e1e1e] text-xs uppercase text-gray-400">
                    <tr>
                      <th className="px-4 py-3 border border-gray-600">Year</th>
                      <th className="px-4 py-3 border border-gray-600">IRR CF</th>
                      <th className="px-4 py-3 border border-gray-600">IRR Total</th>
                      <th className="px-4 py-3 border border-gray-600">Equity Multiple</th>
                      {/* Removed Sharpe Ratio column */}
                      <th className="px-4 py-3 border border-gray-600">Worst CF</th>
                      <th className="px-4 py-3 border border-gray-600">Negative CF Years</th>
                      <th className="px-4 py-3 border border-gray-600">Avg CF</th>
                      <th className="px-4 py-3 border border-gray-600">Total CF</th>
                      <th className="px-4 py-3 border border-gray-600">Final Value</th>
                      <th className="px-4 py-3 border border-gray-600">Min DSCR</th>
                      <th className="px-4 py-3 border border-gray-600">Max LTV</th>
                      <th className="px-4 py-3 border border-gray-600">Mean DSCR</th>
                      <th className="px-4 py-3 border border-gray-600">Max DD (Value)</th>
                      <th className="px-4 py-3 border border-gray-600">Max DD (Equity)</th>
                      <th className="px-4 py-3 border border-gray-600">Years DSCR &lt; 1.2</th>
                      <th className="px-4 py-3 border border-gray-600">Final Equity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearlySimulationResults.map((row, idx) => (
                      <tr
                        key={idx}
                        className={`${idx % 2 === 0 ? 'bg-[#2a2a2a]' : 'bg-[#1e1e1e]'} border-t border-gray-700 hover:bg-[#333]`}
                      >
                        <td className="px-4 py-2 text-right whitespace-nowrap">{row.year}</td>
                        <td className="px-4 py-2 text-right whitespace-nowrap">{row.irrCF}%</td>
                        <td className="px-4 py-2 text-right whitespace-nowrap">{row.irrTotal}%</td>
                        <td className="px-4 py-2 text-right whitespace-nowrap">{row.equityMultiple}</td>
                        {/* Removed Sharpe Ratio cell */}
                        <td className="px-4 py-2 text-right whitespace-nowrap">${row.worstCF.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right whitespace-nowrap">{row.negativeCFYears}</td>
                        <td className="px-4 py-2 text-right whitespace-nowrap">${row.averageCF.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right whitespace-nowrap">${row.totalCF.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right whitespace-nowrap">${row.finalValue.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right whitespace-nowrap">{row.minDSCR}</td>
                        <td className="px-4 py-2 text-right whitespace-nowrap">{row.maxLTV}%</td>
                        <td className="px-4 py-2 text-right whitespace-nowrap">{row.meanDSCR}</td>
                        <td className="px-4 py-2 text-right whitespace-nowrap">{row.maxDrawdownValue}%</td>
                        <td className="px-4 py-2 text-right whitespace-nowrap">{row.maxDrawdownEquity}%</td>
                        <td className="px-4 py-2 text-right whitespace-nowrap">{row.yearsDSCRUnder1_2}</td>
                        <td className="px-4 py-2 text-right whitespace-nowrap">
                          {row.finalEquity !== undefined && row.finalEquity !== null
                            ? `$${row.finalEquity.toLocaleString()}`
                            : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!selectedDeal && (
              <p className="text-gray-400">Select a deal from the list to see more details.</p>
            )}
          </div>
        </main>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white font-semibold px-6 py-3 rounded-md shadow-lg transition">
          {successMessage}
        </div>
      )}
    </>
  );
}