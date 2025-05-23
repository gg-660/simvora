import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

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
  totalSectionWeight,
  weights,
  thresholds
}) {
  const [userPresets, setUserPresets] = useState([]);
  const [userThresholds, setUserThresholds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [presetType, setPresetType] = useState(null); // 'weight' or 'threshold'
  const [presetName, setPresetName] = useState('');

  const refreshPresets = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setUserPresets([]); // Clear if no user
      setUserThresholds([]);
      return;
    }

    const { data: weights } = await supabase
      .from('weight_presets')
      .select('*')
      .eq('user_id', user.id);

    const { data: thresholds } = await supabase
      .from('threshold_presets')
      .select('*')
      .eq('user_id', user.id);

    setUserPresets(weights || []);
    setUserThresholds(thresholds || []);
  };

  useEffect(() => {
    refreshPresets();
  }, []);

  // Define static arrays of default preset names for weight and threshold presets
  const defaultWeightPresetNames = ['default'];
  const defaultThresholdPresetNames = ['default thresholds'];

  return (
    <div className="bg-[#1e1e1e] w-full md:w-80 flex-shrink-0 p-4 space-y-8 text-white">
      <div>
        <h2 className="text-lg font-semibold mb-2">Weight Presets</h2>
        <div className="space-y-2">
          {Array.from(new Map(
            [...weightPresets, ...userPresets].map(p => {
              try {
                const parsed = JSON.parse(p.name);
                const displayName = parsed.name || p.name;
                const key = `${displayName?.toLowerCase().trim()}-${JSON.stringify(p.data)}`;
                return [key, { ...p, name: displayName }];
              } catch {
                const displayName = p.name;
                const key = `${displayName?.toLowerCase().trim()}-${JSON.stringify(p.data)}`;
                return [key, { ...p, name: displayName }];
              }
            })
          ).values()).map((preset) => (
            <div key={preset.name} className="relative w-full">
              <button
                className={`w-full text-left pr-8 px-3 py-2 rounded text-sm font-medium ${
                  selectedWeightPreset?.toLowerCase() === preset.name?.toLowerCase()
                    ? 'bg-[#374151] text-white border border-gray-500'
                    : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#374151] border border-gray-600'
                }`}
                onClick={() => onSelectWeightPreset(preset)}
              >
                {preset.name}
              </button>
              {!defaultWeightPresetNames.includes(preset.name?.toLowerCase().trim()) && (
                <button
                  className="absolute right-2 top-2 text-gray-400 hover:text-red-500"
                  onClick={async (e) => {
                    e.stopPropagation();
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;
                    await supabase
                      .from('weight_presets')
                      .delete()
                      .eq('user_id', user.id)
                      .eq('name', preset.name);
                    await refreshPresets();
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        {totalSectionWeight !== 100 && (
          <div className="bg-red-800 text-red-200 text-sm px-3 py-2 rounded border border-red-500 mt-2">
            Warning: Weights add up to {totalSectionWeight ?? 'N/A'}%. Please adjust to total 100%.
          </div>
        )}
        <button
          className="mt-2 w-full px-3 py-2 rounded text-sm font-medium bg-[#374151] text-white hover:bg-[#475569] border border-gray-600"
          onClick={() => {
            setPresetType('weight');
            setIsModalOpen(true);
          }}
        >
          Save New Preset
        </button>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Threshold Presets</h2>
        <div className="space-y-2">
          {Array.from(new Map(
            [...thresholdPresets, ...userThresholds].map(p => {
              try {
                const parsed = JSON.parse(p.name);
                const displayName = parsed.name || p.name;
                const key = `${displayName?.toLowerCase().trim()}-${JSON.stringify(p.data)}`;
                return [key, { ...p, name: displayName }];
              } catch {
                const displayName = p.name;
                const key = `${displayName?.toLowerCase().trim()}-${JSON.stringify(p.data)}`;
                return [key, { ...p, name: displayName }];
              }
            })
          ).values()).map((preset) => (
            <div key={preset.name} className="relative w-full">
              <button
                className={`w-full text-left pr-8 px-3 py-2 rounded text-sm font-medium ${
                  selectedThresholdPreset?.toLowerCase() === preset.name?.toLowerCase()
                    ? 'bg-[#374151] text-white border border-gray-500'
                    : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#374151] border border-gray-600'
                }`}
                onClick={() => onSelectThresholdPreset(preset)}
              >
                {preset.name}
              </button>
              {!defaultThresholdPresetNames.includes(preset.name?.toLowerCase().trim()) && (
                <button
                  className="absolute right-2 top-2 text-gray-400 hover:text-red-500"
                  onClick={async (e) => {
                    e.stopPropagation();
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;
                    await supabase
                      .from('threshold_presets')
                      .delete()
                      .eq('user_id', user.id)
                      .eq('name', preset.name);
                    await refreshPresets();
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          className="mt-2 w-full px-3 py-2 rounded text-sm font-medium bg-[#374151] text-white hover:bg-[#475569] border border-gray-600"
          onClick={() => {
            setPresetType('threshold');
            setIsModalOpen(true);
          }}
        >
          Save New Preset
        </button>
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-[#1e1e1e] p-6 rounded shadow-lg border border-gray-700 w-80">
            <h3 className="text-white text-lg mb-2">Save New {presetType === 'weight' ? 'Weight' : 'Threshold'} Preset</h3>
            <input
              type="text"
              placeholder="Preset name"
              className="w-full bg-[#2a2a2a] text-white border border-gray-600 rounded px-3 py-2 text-sm mb-4"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-2 text-sm rounded bg-gray-600 text-white hover:bg-gray-500"
                onClick={() => {
                  setIsModalOpen(false);
                  setPresetName('');
                }}
              >
                Cancel
              </button>
              <button
                className="px-3 py-2 text-sm rounded bg-[#374151] hover:bg-[#475569] text-white border border-gray-600"
                onClick={async () => {
                  if (!presetName) return;
                  const { data: { user } } = await supabase.auth.getUser();
                  if (!user) return;

                  const payload = {
                    user_id: user.id,
                    name: presetName,
                    data: presetType === 'weight' ? weights : thresholds
                  };

                  const table = presetType === 'weight' ? 'weight_presets' : 'threshold_presets';
                  const { error } = await supabase.from(table).insert([payload]);

                  if (!error) {
                    await refreshPresets();
                    setIsModalOpen(false);
                    setPresetName('');
                  } else {
                    alert(`Error saving: ${error.message}`);
                  }
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
