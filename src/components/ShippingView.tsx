import PackagePresetsManager from "./PackagePresetsManager";
import React, { useState } from 'react';
import { 
  Truck, 
  HelpCircle, 
  ChevronRight, 
  Activity, 
  Layers, 
  ArrowRight,
  Calculator,
  Compass,
  Zap,
  CheckCircle
} from 'lucide-react';

export default function ShippingView({ unitSystem = 'imperial' }: { unitSystem?: string }) {
  const [zipCode, setZipCode] = useState<string>('90210');
  const [weight, setWeight] = useState<string>('12');
  const [length, setLength] = useState<string>('8');
  const [width, setWidth] = useState<string>('6');
  const [height, setHeight] = useState<string>('4');
  
  const [rates, setRates] = useState<any[] | null>(null);
  const [calculating, setCalculating] = useState<boolean>(false);
  const [advice, setAdvice] = useState<string | null>(null);

  const handleCalculate = () => {
    setCalculating(true);
    setTimeout(() => {
      const wOz = parseFloat(weight) || 8;
      const l = parseFloat(length) || 6;
      const w = parseFloat(width) || 4;
      const h = parseFloat(height) || 3;

      // Simulate rates calculation
      const baseUSPS = 3.99 + (wOz * 0.12) + (l * w * h * 0.02);
      const baseUPS = 6.50 + (wOz * 0.08) + (l * w * h * 0.01);
      const baseFedEx = 7.99 + (wOz * 0.09) + (l * w * h * 0.015);
      const baseAmz = 3.20 + (wOz * 0.10) + (l * w * h * 0.018);

      const computed = [
        { id: 'usps_ground', carrier: 'USPS', name: 'Ground Advantage', amount: Math.round(baseUSPS * 100) / 100, days: 3, tracking: 'Full' },
        { id: 'usps_priority', carrier: 'USPS', name: 'Priority Mail Flat Rate', amount: Math.round((baseUSPS + 4.5) * 100) / 100, days: 2, tracking: 'Full' },
        { id: 'ups_ground', carrier: 'UPS', name: 'Ground Professional', amount: Math.round(baseUPS * 100) / 100, days: 4, tracking: 'Full' },
        { id: 'fedex_express', carrier: 'FedEx', name: 'Express Overnight Saver', amount: Math.round((baseFedEx + 15) * 100) / 100, days: 1, tracking: 'Full' },
        { id: 'amazon_ground', carrier: 'Amazon Shipping', name: 'Ground Shipping v2', amount: Math.round(baseAmz * 100) / 100, days: 3, tracking: 'Full' },
      ].sort((a, b) => a.amount - b.amount);

      setRates(computed);

      // Package Advice calculation
      if (wOz < 16 && l < 10 && w < 8 && h < 2) {
        setAdvice("Optimal Package: Standard Poly Mailer (under 1 lb / 450g). Excellent candidate for Economy Shipping to minimize postage cost.");
      } else if (wOz > 48) {
        setAdvice("Optimal Package: Double-walled Corrugated Box. Weighted exceeds 3 lbs / 1.3kg. Consider Courier Standard for commercial discounts.");
      } else {
        setAdvice("Optimal Package: Custom 8x6x4 Cardboard Box. Eligible for USPS Flat Rate Envelopes if item fits, otherwise standard ground.");
      }
      setCalculating(false);
    }, 800);
  };

  return (
    <div className="space-y-6" id="shipping-view-pane">
      
      {/* Grid Layout: Calculator on Left, Packaging tips on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Rate Calculator form - 7 cols */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs lg:col-span-7 space-y-5">
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-indigo-600" />
              Manual Courier Rate Simulator
            </h3>
            <p className="text-[11px] text-slate-500">Calculate simulated postal carrier rates by changing the box parameters below</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500">Destination Zip Code</label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="90210"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500">Item Weight (Ounces)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="16"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-slate-400">Length ({unitSystem === 'metric' ? 'cm' : 'in'})</label>
              <input
                type="number"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 font-bold text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="8"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-slate-400">Width ({unitSystem === 'metric' ? 'cm' : 'in'})</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 font-bold text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="6"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-slate-400">Height ({unitSystem === 'metric' ? 'cm' : 'in'})</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 font-bold text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="4"
              />
            </div>
          </div>

          <button title="Execute Calculate"
            onClick={handleCalculate}
            disabled={calculating}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-extrabold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            {calculating ? 'Fetching carrier rate options...' : 'Simulate Postal Rates'}
          </button>

          {rates && (
            <div className="space-y-3.5 pt-3 border-t border-slate-200 animate-fade-in">
              <h4 className="text-[10px] uppercase font-black text-slate-700 tracking-wider">Estimated Carrier Rate Sheets</h4>
              
              <div className="space-y-2">
                {rates.map((rate) => {
                  const isCheapest = rates[0].id === rate.id;
                  return (
                    <div 
                      key={rate.id}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                        isCheapest 
                          ? 'bg-emerald-50 border-emerald-100 shadow-xs' 
                          : 'bg-slate-50/50 border-slate-200/50 hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-black uppercase text-[10px] ${
                            rate.carrier === 'USPS' ? 'text-blue-600' : rate.carrier === 'UPS' ? 'text-amber-800' : 'text-indigo-600'
                          }`}>
                            {rate.carrier}
                          </span>
                          <span className="text-slate-700 font-extrabold">{rate.name}</span>
                          {isCheapest && (
                            <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                              Cheapest
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">Delivery in <strong className="text-slate-600">{rate.days} business days</strong> • Tracking: {rate.tracking}</p>
                      </div>

                      <span className="font-mono text-sm font-black text-slate-800">
                        ${rate.amount.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Packaging tips / status - 5 cols */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Packaging Optimization box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-slate-800">
              <Compass className="w-4.5 h-4.5 text-indigo-600" />
              <h3 className="text-xs font-black uppercase tracking-wider">Fulfillment Expert Advice</h3>
            </div>
            
            {advice ? (
              <div className="p-4 bg-indigo-50 border border-indigo-100/70 rounded-xl space-y-2 text-xs">
                <span className="font-black text-indigo-800 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
                  Packaging Optimization Advice
                </span>
                <p className="text-slate-600 leading-normal">{advice}</p>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-400 italic">
                Input weight/dimension data on the left to activate instant Gemini/rules-based optimal packaging suggestions.
              </div>
            )}

            <div className="space-y-3">
              <span className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">Supported Box Strategies</span>
              
              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-600 font-medium">USPS Priority Flat Rate Envelope</span>
                  <span className="font-mono font-bold text-slate-800">{unitSystem === 'metric' ? 'Up to 31 kg' : 'Up to 70 lbs'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-600 font-medium">Amazon Ground Package v2</span>
                  <span className="font-mono font-bold text-slate-800">{unitSystem === 'metric' ? 'Up to 68 kg' : 'Up to 150 lbs'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-600 font-medium">Standard Padded Bubble Mailer</span>
                  <span className="font-mono font-bold text-slate-800">{unitSystem === 'metric' ? 'Max 453 g' : 'Max 16 oz'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Carrier Latencies & API Status */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-slate-800">
              <Activity className="w-4.5 h-4.5 text-emerald-600" />
              <h3 className="text-xs font-black uppercase tracking-wider">Carrier API Connection Gateways</h3>
            </div>
            
            <div className="space-y-3 text-xs">
              {/* USPS */}
              <div className="flex items-center justify-between border-b border-slate-50 pb-2.5 last:border-b-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block"></span>
                  <span className="font-extrabold text-slate-700">USPS WebTools API</span>
                </div>
                <span className="font-mono text-[10px] text-slate-400">Ping: 34ms (Normal)</span>
              </div>

              {/* UPS */}
              <div className="flex items-center justify-between border-b border-slate-50 pb-2.5 last:border-b-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block"></span>
                  <span className="font-extrabold text-slate-700">UPS Developer Portal v2</span>
                </div>
                <span className="font-mono text-[10px] text-slate-400">Ping: 42ms (Normal)</span>
              </div>

              {/* FedEx */}
              <div className="flex items-center justify-between border-b border-slate-50 pb-2.5 last:border-b-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block"></span>
                  <span className="font-extrabold text-slate-700">FedEx Web Services</span>
                </div>
                <span className="font-mono text-[10px] text-slate-400">Ping: 51ms (Normal)</span>
              </div>

              {/* Amazon Buy Shipping API */}
              <div className="flex items-center justify-between border-b border-slate-50 pb-2.5 last:border-b-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block animate-pulse"></span>
                  <span className="font-extrabold text-slate-700">Amazon Shipping SP-API</span>
                </div>
                <span className="font-mono text-[10px] text-slate-400">Ping: 18ms (Optimal)</span>
              </div>
            </div>
          </div>

        </div>

      </div>
      
      <div className="mt-8">
        <PackagePresetsManager unitSystem={unitSystem} />
      </div>

    </div>
  );
}
