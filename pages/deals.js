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

export default function Deals() {
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
    });
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

  return (
    <>
      <Navbar />
      <div
        className="flex min-h-screen relative"
        style={{
          backgroundColor: '#121212',
          color: '#e0e0e0',
        }}
      >
        {/* Main Sidebar (Deal Form) */}
        <aside
          className="p-6 z-30"
          style={{
            position: 'fixed',
            top: '4rem', 
            left: 0,
            width: '20rem',
            height: 'calc(100vh - 4rem)', 
            backgroundColor: '#1e1e1e',
            boxShadow: '4px 0px 6px rgba(0, 0, 0, 0.1)',
            paddingTop: 0,
            borderRight: '2px solid #333',
            zIndex: 50,
            overflowY: 'auto',
            paddingRight: '10px',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            color: '#e0e0e0'
          }}
        >
          <button
            onClick={handleToggleAssumptions}
            className="w-full bg-gray-700 text-white font-semibold py-3 rounded-md hover:bg-gray-600 transition mb-4"
            style={{
              position: 'relative',
              zIndex: 50,
              marginTop: '30px',   
              marginBottom: '30px', 
            }}
          >
            Assumptions and Deal Inputs
          </button>
          <h2 className="text-xl font-bold mb-6">{editIndex !== null ? 'Edit Deal' : 'Create New Deal'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label htmlFor="dealName" className="block font-semibold">Deal Name</label>
              <input
                type="text"
                id="dealName"
                name="dealName"
                value={formData.dealName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="Ex: Lincoln Park Duplex"
                required
              />
            </div>
            <div>
              <label htmlFor="purchasePrice" className="block font-semibold">Purchase Price ($)</label>
              <input
                type="number"
                id="purchasePrice"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="Ex: 450000"
                required
              />
            </div>
            <div>
              <label htmlFor="monthlyRent" className="block font-semibold">Monthly Rent ($)</label>
              <input
                type="number"
                id="monthlyRent"
                name="monthlyRent"
                value={formData.monthlyRent}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="Ex: 3500"
                required
              />
            </div>
            <div>
              <label htmlFor="monthlyExpenses" className="block font-semibold">Monthly Expenses ($)</label>
              <input
                type="number"
                id="monthlyExpenses"
                name="monthlyExpenses"
                value={formData.monthlyExpenses}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="Ex: 600"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gray-700 text-white font-semibold py-3 rounded-md hover:bg-gray-600 transition"
              disabled={loading}
            >
              {loading ? "Saving..." : editIndex !== null ? "Save Deal" : "Save New Deal"}
            </button>
          </form>
          <div
            className="deals-section"
            style={{
              position: 'relative',
              zIndex: 10,
              background: '#1e1e1e',
            }}
          >
            <h3 className="text-lg font-semibold mb-4">Your Deals</h3>
            <ul className="space-y-2">
              {savedDeals.map((deal) => (
                <li
                  key={deal.id}
                  className={`flex justify-between items-center p-3 bg-[#232323] rounded-md shadow-sm hover:bg-[#282828] cursor-pointer${selectedDeal && selectedDeal.id === deal.id ? ' ring-2 ring-gray-500' : ''}`}
                  onClick={() => handleSelectDeal(deal)}
                  tabIndex={0}
                  aria-label={`Select deal ${deal.deal_name}`}
                >
                  <span className="font-semibold text-sm truncate max-w-[8rem]" title={deal.deal_name}>{deal.deal_name}</span>
                  <div className="flex items-center ml-2 w-auto flex-shrink-0" style={{ minWidth: 0 }}>
                    <button
                      onClick={e => { e.stopPropagation(); handleEditDeal(deal); }}
                      className="text-gray-400 p-2 rounded-md hover:text-blue-400"
                      title="Edit Deal"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487a2.25 2.25 0 1 1 3.182 3.182L7.5 20.213l-4.182.455.455-4.182 12.089-12.089z" />
                      </svg>
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(deal.id); }}
                      className="text-gray-400 p-2 rounded-md hover:text-red-500 ml-1"
                      title="Delete Deal"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Assumptions Sidebar */}
        <div
          className={`assumptions-sidebar${showAssumptions ? ' open' : ''}`}
          style={{
            left: '20rem',
            width: '20rem',
            padding: '20px',
            zIndex: 40,
            top: '4rem',
            height: 'calc(100vh - 4rem)',
            overflowY: 'auto',
            backgroundColor: '#1e1e1e',
            color: '#e0e0e0',
            boxShadow: '4px 0px 6px rgba(0, 0, 0, 0.1)',
            borderLeft: '1px solid #343434',
            position: 'fixed',
            transition: 'transform 0.5s ease',
            transform: showAssumptions ? 'translateX(0)' : 'translateX(-100%)',
            display: 'block',
          }}
        >
          <h2 className="text-xl font-bold mb-6">Assumptions and Deal Inputs</h2>

          {/* Inputs for Assumptions */}
          <div className="space-y-4">
            <div>
              <label htmlFor="downPayment" className="block font-semibold">Down Payment (%)</label>
              <input
                type="number"
                id="downPayment"
                name="downPayment"
                value={assumptions.downPayment}
                onChange={handleAssumptionChange}
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="Ex: 20"
              />
            </div>
            <div>
              <label htmlFor="interestRate" className="block font-semibold">Interest Rate (%)</label>
              <input
                type="number"
                id="interestRate"
                name="interestRate"
                value={assumptions.interestRate}
                onChange={handleAssumptionChange}
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="Ex: 5"
              />
            </div>
            <div>
              <label htmlFor="loanTerm" className="block font-semibold">Loan Term (Years)</label>
              <input
                type="number"
                id="loanTerm"
                name="loanTerm"
                value={assumptions.loanTerm}
                onChange={handleAssumptionChange}
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="Ex: 30"
              />
            </div>
            <div>
              <label htmlFor="appreciationRate" className="block font-semibold">Appreciation Rate (%)</label>
              <input
                type="number"
                id="appreciationRate"
                name="appreciationRate"
                value={assumptions.appreciationRate}
                onChange={handleAssumptionChange}
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="Ex: 3"
              />
            </div>
            <div>
              <label htmlFor="vacancyRate" className="block font-semibold">Vacancy Rate (%)</label>
              <input
                type="number"
                id="vacancyRate"
                name="vacancyRate"
                value={assumptions.vacancyRate}
                onChange={handleAssumptionChange}
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="Ex: 5"
              />
            </div>
            <div>
              <label htmlFor="inflationRate" className="block font-semibold">Inflation Rate (%)</label>
              <input
                type="number"
                id="inflationRate"
                name="inflationRate"
                value={assumptions.inflationRate}
                onChange={handleAssumptionChange}
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="Ex: 2"
              />
            </div>
            <div>
  <label htmlFor="saleClosingCost" className="block font-semibold">Sale Closing Cost (%)</label>
  <input
    type="number"
    id="saleClosingCost"
    name="saleClosingCost"
    value={assumptions.saleClosingCost}
    onChange={handleAssumptionChange}
    className="w-full p-3 border border-gray-300 rounded-md"
    placeholder="Ex: 6"
  />
</div>
          </div>

          <div className="mt-4">
            <button
              onClick={handleToggleAssumptions}
              className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
            >
              Close Assumptions
            </button>
          </div>
        </div>

        {/* Main Content for Displaying Selected Deal */}
        <main
          className={`flex-1 p-10 pt-16${showAssumptions ? ' content-with-assumptions' : ''}`}
          style={{
            marginLeft: showAssumptions ? '40rem' : '20rem',
            transition: 'margin-left 0.3s ease',
            overflowY: 'auto',
            backgroundColor: '#121212',
            color: '#e0e0e0',
            minHeight: '100vh'
          }}
        >
          <div className="bg-[#2a2a2a] border border-gray-600 rounded-lg p-6 mb-10 text-center">
            <h2 className="text-3xl font-bold text-white">{selectedDeal?.deal_name || 'Selected Deal'}</h2>
          </div>
          {selectedDeal ? (
            <div>
              {/* Responsive card grid for deal metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
                <MetricCard title="Purchase Price" value={formatCurrency(selectedDeal.purchase_price)} />
                <MetricCard title="Down Payment" value={metrics.downPaymentAmount} />
                <MetricCard title="Monthly Rent" value={formatCurrency(selectedDeal.monthly_rent)} />
                <MetricCard title="Monthly Expenses" value={formatCurrency(selectedDeal.monthly_expenses)} />
                <MetricCard title="Monthly Payment" value={metrics.monthlyPayment} />
              </div>

              {/* Appreciation Metrics Section */}
              <h3 className="text-lg font-bold mt-8 mb-4">Appreciation Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
                <MetricCard title="Final Property Value" value={metrics.finalPropertyValue} />
                <MetricCard title="Appreciation ($)" value={metrics.appreciation} />
              </div>

              <hr className="my-8 border-gray-700" />

              {/* IRR Metrics Section */}
              <h3 className="text-lg font-bold mt-8 mb-4">IRR Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                <MetricCard title="IRR of Cash Flow" value={metrics.irrOfCashFlow !== undefined && metrics.irrOfCashFlow !== null && metrics.irrOfCashFlow !== 'N/A' ? `${metrics.irrOfCashFlow}%` : 'N/A'} />
                <MetricCard title="Total IRR (with Appreciation)" value={metrics.totalIRRWithAppreciation !== undefined && metrics.totalIRRWithAppreciation !== null && metrics.totalIRRWithAppreciation !== 'N/A' ? `${metrics.totalIRRWithAppreciation}%` : 'N/A'} />
                <MetricCard title="Equity Multiple" value={metrics.equityMultiple} />
              </div>

              {/* Divider */}
              <hr className="my-8 border-gray-700" />

              {/* Cash Flow Metrics Section */}
              <h3 className="text-lg font-bold mt-8 mb-4">Cash Flow Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                <MetricCard title="Total Cash Flow" value={metrics.totalCashFlow} />
                <MetricCard title="Average Cash Flow" value={metrics.averageCashFlow} />
                <MetricCard title="Years of Negative Cash Flow" value={metrics.yearsOfNegativeCashFlow} />
                <MetricCard title="Break Even Year" value={metrics.breakEvenYear !== null ? metrics.breakEvenYear : 'N/A'} />
              </div>



              {/* Divider */}
              <hr className="my-8 border-gray-700" />

              {/* Risk Metrics Section */}
              <h3 className="text-lg font-bold mt-8 mb-4">Risk Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                <MetricCard title="Average DSCR" value={metrics.averageDSCR !== undefined && metrics.averageDSCR !== null && metrics.averageDSCR !== 'N/A' ? metrics.averageDSCR : 'N/A'} />
                <MetricCard title="Years DSCR &lt; 1.2" value={metrics.yearsDSCRUnder1_2} />
                <MetricCard title="Sharpe Ratio" value={metrics.sharpeRatio !== undefined && metrics.sharpeRatio !== null && metrics.sharpeRatio !== 'N/A' ? metrics.sharpeRatio : 'N/A'} />
              </div>
            </div>
          ) : (
            <p className="text-gray-400">Select a deal from the list to see more details.</p>
          )}
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