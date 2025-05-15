import React from 'react';

export default function Sidebar({
  weightPresets,
  thresholdPresets,
  selectedWeightPreset,
  selectedThresholdPreset,
  onSelectWeightPreset,
  onSelectThresholdPreset,
  deals,
  selectedDealId,
  onSelectDeal,
  totalSectionWeight
}) {
  return (
    <div className="bg-[#1e1e1e] w-full md:w-64 flex-shrink-0 p-4 space-y-8 text-white">
      <div>
        <h2 className="text-lg font-semibold mb-2">Weight Presets</h2>
        <div className="space-y-2">
          {weightPresets.map((preset) => (
            <button
              key={preset.name}
              className={`block w-full text-left px-3 py-2 rounded text-sm font-medium border ${
                selectedWeightPreset?.name === preset.name
                  ? 'bg-[#374151] text-white border-gray-500'
                  : 'bg-[#2a2a2a] text-gray-300 border-gray-600 hover:bg-[#374151] hover:text-white'
              }`}
              onClick={() => onSelectWeightPreset(preset)}
            >
              {preset.name}
            </button>
          ))}
        </div>
        {totalSectionWeight !== 100 && (
          <div className="bg-red-800 text-red-200 text-sm px-3 py-2 rounded border border-red-500 mt-2">
            Warning: Weights add up to {totalSectionWeight ?? 'N/A'}%. Please adjust to total 100%.
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Threshold Presets</h2>
        <div className="space-y-2">
          {thresholdPresets.map((preset) => (
            <button
              key={preset.name}
              className={`block w-full text-left px-3 py-2 rounded text-sm font-medium border ${
                selectedThresholdPreset?.name === preset.name
                  ? 'bg-[#374151] text-white border-gray-500'
                  : 'bg-[#2a2a2a] text-gray-300 border-gray-600 hover:bg-[#374151] hover:text-white'
              }`}
              onClick={() => onSelectThresholdPreset(preset)}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Your Deals</h2>
        <div className="space-y-2">
          {deals.map((deal) => (
            <button
              key={deal.id}
              className={`block w-full text-left px-3 py-2 rounded text-sm font-medium ${
                selectedDealId === deal.id
                  ? 'bg-[#374151] text-white border border-gray-500'
                  : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#374151] border border-gray-600'
              }`}
              onClick={() => onSelectDeal(deal.id)}
            >
              {deal.deal_name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
