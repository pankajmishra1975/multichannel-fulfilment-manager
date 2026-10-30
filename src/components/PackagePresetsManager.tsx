import React, { useState, useEffect } from 'react';
import { Package, Plus, Trash2, Save } from 'lucide-react';

export interface PackagePreset {
  id: string;
  name: string;
  weight: number;
  length: number;
  width: number;
  height: number;
}

const defaultPresets: PackagePreset[] = [
  { id: '1', name: 'Env (56g)', weight: 56, length: 15, width: 10, height: 1 },
  { id: '2', name: 'Small Box (225g)', weight: 225, length: 20, width: 15, height: 10 },
  { id: '3', name: 'Med Box (450g)', weight: 450, length: 30, width: 25, height: 15 },
  { id: '4', name: 'Large Box (900g)', weight: 900, length: 45, width: 35, height: 25 }
];

export default function PackagePresetsManager({ unitSystem }: { unitSystem: string }) {
  const [presets, setPresets] = useState<PackagePreset[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('appPackagePresets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          setPresets(parsed);
          return;
        }
      } catch(e) {}
    }
    setPresets(defaultPresets);
  }, []);

  const savePresets = (newPresets: PackagePreset[]) => {
    setPresets(newPresets);
    localStorage.setItem('appPackagePresets', JSON.stringify(newPresets));
    window.dispatchEvent(new Event('presets_updated'));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const addPreset = () => {
    const newPresets = [...presets, {
      id: Date.now().toString(),
      name: 'New Preset',
      weight: unitSystem === 'metric' ? 100 : 4,
      length: unitSystem === 'metric' ? 10 : 4,
      width: unitSystem === 'metric' ? 10 : 4,
      height: unitSystem === 'metric' ? 10 : 4
    }];
    savePresets(newPresets);
  };

  const removePreset = (id: string) => {
    savePresets(presets.filter(p => p.id !== id));
  };

  const updatePreset = (id: string, field: keyof PackagePreset, value: string | number) => {
    savePresets(presets.map(p => {
      if (p.id === id) {
        return { ...p, [field]: value };
      }
      return p;
    }));
  };

  const weightUnit = unitSystem === 'metric' ? 'g' : 'oz';
  const dimUnit = unitSystem === 'metric' ? 'cm' : 'in';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-100 text-indigo-700 p-2 rounded-xl">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-black text-slate-800 tracking-tight">Package Presets</h2>
            <p className="text-xs text-slate-500 font-medium">Manage default package dimensions for quick assignment</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saveSuccess && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Saved!</span>}
          <button title="Change settings or filter" onClick={addPreset} className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Preset
          </button>
        </div>
      </div>
      
      <div className="p-4 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="text-[10px] uppercase font-black tracking-wider text-slate-400 border-b border-slate-200">
              <th className="pb-3 pl-2">Preset Name</th>
              <th className="pb-3">Weight ({weightUnit})</th>
              <th className="pb-3">Length ({dimUnit})</th>
              <th className="pb-3">Width ({dimUnit})</th>
              <th className="pb-3">Height ({dimUnit})</th>
              <th className="pb-3 text-right pr-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {presets.map(preset => (
              <tr key={preset.id} className="group">
                <td className="py-2 pl-2">
                  <input type="text" value={preset.name} onChange={e => updatePreset(preset.id, 'name', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500" />
                </td>
                <td className="py-2 pr-2">
                  <input type="number" value={preset.weight} onChange={e => updatePreset(preset.id, 'weight', Number(e.target.value))} className="w-16 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-mono text-slate-700 focus:outline-none focus:border-indigo-500" />
                </td>
                <td className="py-2 pr-2">
                  <input type="number" value={preset.length} onChange={e => updatePreset(preset.id, 'length', Number(e.target.value))} className="w-16 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-mono text-slate-700 focus:outline-none focus:border-indigo-500" />
                </td>
                <td className="py-2 pr-2">
                  <input type="number" value={preset.width} onChange={e => updatePreset(preset.id, 'width', Number(e.target.value))} className="w-16 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-mono text-slate-700 focus:outline-none focus:border-indigo-500" />
                </td>
                <td className="py-2 pr-2">
                  <input type="number" value={preset.height} onChange={e => updatePreset(preset.id, 'height', Number(e.target.value))} className="w-16 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-mono text-slate-700 focus:outline-none focus:border-indigo-500" />
                </td>
                <td className="py-2 pr-2 text-right">
                  <button title="Delete item"  onClick={() => removePreset(preset.id)} className="text-slate-300 hover:text-rose-500 transition-colors p-1 rounded hover:bg-rose-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {presets.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500 text-sm">No presets found. Create one above.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
