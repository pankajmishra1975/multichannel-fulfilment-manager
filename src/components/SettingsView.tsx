import React, { useState } from 'react';
import { 
  Settings, 
  MapPin, 
  Truck, 
  RefreshCw, 
  Check, 
  Info, 
  Trash2,
  Sliders
} from 'lucide-react';
import RulesEngineView from './RulesEngineView';

interface SettingsViewProps {
  onResetDemoOrders: () => void;
  inventoryThreshold: number;
  onUpdateThreshold: (threshold: number) => Promise<void>;
  bulkStrategy: 'cheapest' | 'fastest' | 'buy_shipping' | 'shipping_v2';
  setBulkStrategy: (val: 'cheapest' | 'fastest' | 'buy_shipping' | 'shipping_v2') => void;
  onRefreshOrders?: () => void;
  onRefreshLogs?: () => void;
  currency: string;
  onUpdateCurrency: (val: string) => Promise<void>;
  unitSystem: string;
  onUpdateUnitSystem: (val: string) => Promise<void>;
  originCountry: string;
  originCity: string;
  originState: string;
  originZip: string;
  onUpdateOrigin: (country: string, city: string, state: string, zip: string) => Promise<void>;
}

export default function SettingsView({
  onResetDemoOrders,
  inventoryThreshold,
  onUpdateThreshold,
  bulkStrategy,
  setBulkStrategy,
  onRefreshOrders,
  onRefreshLogs,
  currency,
  onUpdateCurrency,
  unitSystem,
  onUpdateUnitSystem,
  originCountry,
  originCity,
  originState,
  originZip,
  onUpdateOrigin
}: SettingsViewProps) {
  const [success, setSuccess] = useState<string | null>(null);

  // Localized states for settings to support explicit saving
  const [localStrategy, setLocalStrategy] = useState<any>(bulkStrategy);
  const [localCurrency, setLocalCurrency] = useState(currency);
  const [localUnitSystem, setLocalUnitSystem] = useState(unitSystem);

  const [localOriginZip, setLocalOriginZip] = useState(originZip);
  const [localOriginCity, setLocalOriginCity] = useState(originCity);
  const [localOriginState, setLocalOriginState] = useState(originState);
  const [localOriginCountry, setLocalOriginCountry] = useState(originCountry);

  const [activeSubTab, setActiveSubTab] = useState<'general' | 'rules'>('general');

  // Synchronize when parent props change (e.g. initial load)
  React.useEffect(() => {
    setLocalStrategy(bulkStrategy);
    setLocalCurrency(currency);
    setLocalUnitSystem(unitSystem);
  }, [bulkStrategy, currency, unitSystem]);

  React.useEffect(() => {
    setLocalOriginZip(originZip);
    setLocalOriginCity(originCity);
    setLocalOriginState(originState);
    setLocalOriginCountry(originCountry);
  }, [originZip, originCity, originState, originCountry]);

  // Helper for dynamic postcode label and placeholders per country
  const getPostcodeLabelAndPlaceholder = (country: string) => {
    switch (country) {
      case 'US':
        return { label: 'Origin ZIP Code', placeholder: 'e.g., 90210' };
      case 'GB':
        return { label: 'Origin Postcode', placeholder: 'e.g., SW1A 1AA' };
      case 'CA':
        return { label: 'Origin Postal Code', placeholder: 'e.g., K1A 0B1' };
      case 'AU':
        return { label: 'Origin Postcode', placeholder: 'e.g., 2000' };
      case 'DE':
        return { label: 'Origin Postcode (PLZ)', placeholder: 'e.g., 10117' };
      case 'FR':
        return { label: 'Origin Code Postal', placeholder: 'e.g., 75001' };
      case 'IT':
        return { label: 'Origin CAP', placeholder: 'e.g., 00100' };
      case 'ES':
        return { label: 'Origin Código Postal', placeholder: 'e.g., 28001' };
      case 'NL':
        return { label: 'Origin Postcode', placeholder: 'e.g., 1012 JS' };
      case 'JP':
        return { label: 'Origin Postal Code', placeholder: 'e.g., 100-0001' };
      case 'CN':
        return { label: 'Origin Postal Code', placeholder: 'e.g., 100000' };
      case 'IN':
        return { label: 'Origin PIN Code', placeholder: 'e.g., 110001' };
      default:
        return { label: 'Origin Postcode / ZIP Code', placeholder: 'e.g., 12345' };
    }
  };

  const dynamicPostcode = getPostcodeLabelAndPlaceholder(localOriginCountry);

  const handleSavePreferences = async () => {
    try {
      setBulkStrategy(localStrategy);
      await onUpdateCurrency(localCurrency);
      await onUpdateUnitSystem(localUnitSystem);
      setSuccess('Merchant preferences and system currency updated successfully.');
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveOrigin = async () => {
    try {
      await onUpdateOrigin(localOriginCountry, localOriginCity, localOriginState, localOriginZip);
      if (localOriginCountry === 'GB') {
        await onUpdateCurrency('GBP');
        await onUpdateUnitSystem('metric');
        setLocalCurrency('GBP');
        setLocalUnitSystem('metric');
        setSuccess('Warehouse origin coordinates saved! Auto-configured system currency to GBP (£) and units to Metric (g/cm) for United Kingdom.');
      } else {
        setSuccess('Warehouse origin coordinates updated successfully.');
      }
      setTimeout(() => {
        setSuccess(null);
      }, 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetClick = () => {
    onResetDemoOrders();
    setSuccess('Fulfillment database successfully reset to default demo records.');
    setTimeout(() => {
      setSuccess(null);
    }, 3000);
  };

  return (
    <div className="space-y-6" id="settings-view-container">
      {/* Settings Sub-Tab Switcher */}
      <div className="flex border-b border-slate-200" id="settings-sub-tab-bar">
        <button title="Perform action" 
          onClick={() => setActiveSubTab('general')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'general'
              ? 'border-indigo-600 text-indigo-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          id="general-settings-subtab-btn"
        >
          <Settings className="w-4 h-4" />
          General Settings
        </button>
        <button title="Perform action" 
          onClick={() => setActiveSubTab('rules')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'rules'
              ? 'border-indigo-600 text-indigo-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          id="rules-engine-subtab-btn"
        >
          <Sliders className="w-4 h-4" />
          Automated Rules Engine
        </button>
      </div>

      {/* Success Notifications */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs animate-fade-in">
          <Check className="w-4.5 h-4.5 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {activeSubTab === 'rules' ? (
        <RulesEngineView onRefreshOrders={onRefreshOrders} onRefreshLogs={onRefreshLogs} unitSystem={unitSystem} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Core preferences - 8 cols */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs lg:col-span-8 overflow-hidden">
            
            <div className="p-5 border-b border-slate-200 bg-slate-50/50">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-indigo-600" />
                Merchant Portal Preferences & Rules
              </h3>
              <p className="text-[11px] text-slate-500">Global fulfillment rules, routing weights, and default postage calculations</p>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Strategy preference */}
              <div className="space-y-1.5 border-b border-slate-50 pb-5">
                <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Default Postage Strategy</span>
                <p className="text-xs text-slate-400">Specify the fallback mechanism used when buying shipping in bulk batches</p>
                
                <div className="pt-2 w-full max-w-md">
                  <select
                    value={localStrategy}
                    onChange={(e: any) => setLocalStrategy(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full"
                    id="settings-strategy-select"
                  >
                    <option value="cheapest">Cheapest Carrier Rate (Optimized Cost)</option>
                    <option value="fastest">Fastest Delivery (Express Courier Overnight)</option>
                    <option value="buy_shipping">Amazon Buy Shipping Priority</option>
                    <option value="shipping_v2">Amazon Ground Shipping v2</option>
                  </select>
                </div>
              </div>

              {/* Currency preference */}
              <div className="space-y-1.5 border-b border-slate-50 pb-5">
                <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">System Global Currency</span>
                <p className="text-xs text-slate-400">Control the base currency rendered across capital valuations and profit sheets</p>
                
                <div className="pt-2 w-full max-w-md">
                  <select
                    value={localCurrency}
                    onChange={async (e: any) => {
                      const val = e.target.value;
                      setLocalCurrency(val);
                      try {
                        await onUpdateCurrency(val);
                        setSuccess(`System base currency updated to ${val} successfully.`);
                        setTimeout(() => setSuccess(null), 3000);
                      } catch (err) {
                        console.error("Failed to update currency:", err);
                      }
                    }}
                    className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full"
                    id="settings-currency-select"
                  >
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="GBP">GBP (£) - British Pound</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="JPY">JPY (¥) - Japanese Yen</option>
                    <option value="CAD">CAD ($) - Canadian Dollar</option>
                  </select>
                </div>
              </div>

              {/* Unit System preference */}
              <div className="space-y-1.5 border-b border-slate-50 pb-5">
                <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">System Measurement Units</span>
                <p className="text-xs text-slate-400">Control the base unit system used for packages dimensions and weights</p>
                
                <div className="pt-2 w-full max-w-md">
                  <select
                    value={localUnitSystem}
                    onChange={async (e: any) => {
                      const val = e.target.value;
                      setLocalUnitSystem(val);
                      try {
                        await onUpdateUnitSystem(val);
                        setSuccess(`System unit preference updated to ${val === 'metric' ? 'Metric (Centimeters / Kg)' : 'Imperial (Inches / Lbs)'} successfully.`);
                        setTimeout(() => setSuccess(null), 3000);
                      } catch (err) {
                        console.error("Failed to update unit system:", err);
                      }
                    }}
                    className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full"
                    id="settings-unit-select"
                  >
                    <option value="imperial">Imperial (Inches / Lbs)</option>
                    <option value="metric">Metric (Centimeters / Kg)</option>
                  </select>
                </div>
              </div>

              {/* Save preferences button */}
              <div className="pt-2 border-b border-slate-50 pb-5">
                <button title="Save changes"
                  onClick={handleSavePreferences}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px] px-5 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save General Settings
                </button>
              </div>

              {/* Warehouse Origin details */}
              <div className="space-y-4 pt-1 border-b border-slate-50 pb-5">
                <div>
                  <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    Warehouse Dispatch Origin Coordinates
                  </span>
                  <p className="text-xs text-slate-400 mt-1">Calculates carrier zone ratings and postage rates from this origin</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-2xl">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-slate-400">Origin Country</label>
                    <select
                      value={localOriginCountry}
                      onChange={(e) => setLocalOriginCountry(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="US">United States (US)</option>
                      <option value="GB">United Kingdom (GB)</option>
                      <option value="CA">Canada (CA)</option>
                      <option value="AU">Australia (AU)</option>
                      <option value="DE">Germany (DE)</option>
                      <option value="FR">France (FR)</option>
                      <option value="IT">Italy (IT)</option>
                      <option value="ES">Spain (ES)</option>
                      <option value="NL">Netherlands (NL)</option>
                      <option value="JP">Japan (JP)</option>
                      <option value="CN">China (CN)</option>
                      <option value="IN">India (IN)</option>
                      <option value="BR">Brazil (BR)</option>
                      <option value="MX">Mexico (MX)</option>
                      <option value="SG">Singapore (SG)</option>
                      <option value="AE">United Arab Emirates (AE)</option>
                      <option value="ZA">South Africa (ZA)</option>
                      <option value="NZ">New Zealand (NZ)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-slate-400">Origin City</label>
                    <input
                      type="text"
                      value={localOriginCity}
                      onChange={(e) => setLocalOriginCity(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-slate-400">Origin State / Region</label>
                    <input
                      type="text"
                      value={localOriginState}
                      onChange={(e) => setLocalOriginState(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-slate-400">{dynamicPostcode.label}</label>
                    <input
                      type="text"
                      value={localOriginZip}
                      placeholder={dynamicPostcode.placeholder}
                      onChange={(e) => setLocalOriginZip(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <button title="Save changes"
                  onClick={handleSaveOrigin}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px] px-5 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save Dispatch Coordinates
                </button>
              </div>

              {/* API Sandbox Details */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-indigo-600" />
                  Integration Status info
                </span>
                <p className="text-xs text-slate-600 leading-normal">
                  Sellershub Shipping Gateway operates under <strong>Sandbox Mode guidelines</strong>. Real carrier requests are logged and returns simulated 200 labels responses.
                </p>
              </div>

            </div>
          </div>

          {/* Database Control deck - 4 cols */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Reset simulator database */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-slate-800">
                <Trash2 className="w-4.5 h-4.5 text-rose-600" />
                <h3 className="text-xs font-black uppercase tracking-wider">Fulfillment Simulator Controls</h3>
              </div>
              
              <p className="text-xs text-slate-500 leading-normal">
                Reset all order channels, custom SKU specifications, printed labels, and log histories back to default pristine setup.
              </p>

              <button title="Change settings or filter"
                onClick={handleResetClick}
                className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/60 text-xs font-extrabold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                id="settings-reset-database-btn"
              >
                <RefreshCw className="w-4 h-4 text-rose-500" />
                Reset All Simulator Records
              </button>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
