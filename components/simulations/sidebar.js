import React from 'react';

export default function Sidebar({
  assumptions,
  handleAssumptionChange,
  savedDeals,
  selectedDeal,
  handleSelectDeal,
  showFormOverlay,
  setShowFormOverlay,
}) {
  return (
    <div
      className={`bg-[#1e1e1e] border-r border-gray-700 p-4 flex-shrink-0 h-screen
        ${showFormOverlay ? 'fixed inset-0 z-50 w-full' : ''}
        md:static md:block md:w-[300px] transition-transform duration-300`}
    >
      {/* Close Button for Mobile */}
      <button
        type="button"
        aria-label="Close sidebar"
        onClick={() => setShowFormOverlay(false)}
        className="md:hidden absolute top-4 right-4 text-3xl text-gray-300 hover:text-white font-bold z-50"
      >
        &times;
      </button>

      <aside className="w-full max-w-md p-6 h-full overflow-y-auto space-y-8 mx-auto">
        {/* Assumptions Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Assumptions</h3>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Interest Rate (%)</label>
            <input
              type="number"
              step="0.01"
              name="interestRate"
              value={assumptions.interestRate}
              onChange={handleAssumptionChange}
              className="w-full px-3 py-2 bg-[#2a2a2a] text-white rounded-md border border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Loan Term (years)</label>
            <input
              type="number"
              name="loanTerm"
              value={assumptions.loanTerm}
              onChange={handleAssumptionChange}
              className="w-full px-3 py-2 bg-[#2a2a2a] text-white rounded-md border border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Down Payment (%)</label>
            <input
              type="number"
              step="0.01"
              name="downPayment"
              value={assumptions.downPayment}
              onChange={handleAssumptionChange}
              className="w-full px-3 py-2 bg-[#2a2a2a] text-white rounded-md border border-gray-600"
            />
          </div>
        </div>

        {/* Saved Deals List */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Your Deals</h2>
          <div className="space-y-3">
            {savedDeals.map((deal) => (
              <div
                key={deal.id}
                onClick={() => {
                  handleSelectDeal(deal);
                  if (window.innerWidth < 768) {
                    setShowFormOverlay(false);
                  }
                }}
                className={`cursor-pointer p-4 border rounded-md transition-all duration-200 ${
                  selectedDeal?.id === deal.id
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
    </div>
  );
}
