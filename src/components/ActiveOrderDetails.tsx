import React, { useState, useEffect } from 'react';
import { Order, CarrierRate } from '../types';
import { useCrm } from '../hooks/useCrm';
import { 
  User, 
  MapPin, 
  Package, 
  Sparkles, 
  Truck, 
  AlertTriangle, 
  CheckCircle, 
  Layers, 
  Printer, 
  FileText, 
  TrendingUp, 
  Loader2, 
  ChevronRight,
  Bookmark,
  Activity,
  Maximize2,
  Split
} from 'lucide-react';
import SplitOrderModal from './SplitOrderModal';

interface ActiveOrderDetailsProps {
  unitSystem?: string;
  order: Order | null;
  onBuyLabel: (orderId: string, rateId: string) => void;
  onRefreshRates: (orderId: string) => Promise<CarrierRate[]>;
  onUpdateSpecs: (id: string, weightOz: number, dimensions: { length: number; width: number; height: number }) => Promise<void>;
  onUpdateOrder: (id: string, updates: Partial<Order>) => Promise<void>;
}

export default function ActiveOrderDetails({
  unitSystem, order, onBuyLabel, onRefreshRates, onUpdateSpecs, onUpdateOrder }: ActiveOrderDetailsProps) {
  const [rates, setRates] = useState<CarrierRate[]>([]);
  const [loadingRates, setLoadingRates] = useState(false);
  const [selectedRateId, setSelectedRateId] = useState<string>('');
  
  // Gemini Address analysis state
  const [analyzingAddress, setAnalyzingAddress] = useState(false);
  const [addressAnalysis, setAddressAnalysis] = useState<{
    isValid: boolean;
    issuesDetected: string[];
    riskLevel: 'low' | 'medium' | 'high';
    suggestedFormat?: any;
    explanation?: string;
  } | null>(null);

  const { customers, tickets, updateCustomer } = useCrm();
  const customerEmail = order?.buyerEmail || order?.buyerName || '';
  const customerProfile = customers[customerEmail] || {};
  

  // Gemini Packaging advice state
  const [advisingPackaging, setAdvisingPackaging] = useState(false);
  const [packagingAdvice, setPackagingAdvice] = useState<{
    boxType: string;
    dimensions: { length: number; width: number; height: number };
    unit: string;
    fragile: boolean;
    packagingMaterials: string[];
    estimatedDimensionalWeightOz: number;
    optimizationTip: string;
  } | null>(null);

  const [localWeight, setLocalWeight] = useState<number>(0);
  const [localDimensions, setLocalDimensions] = useState({ length: 0, width: 0, height: 0 });
  const [savingSpecs, setSavingSpecs] = useState(false);

  // Notes, shippingDate, and carrier states
  const [localNotes, setLocalNotes] = useState<string>('');
  const [localShippingDate, setLocalShippingDate] = useState<string>('');
  const [localCarrier, setLocalCarrier] = useState<string>('');
  const [savingSettings, setSavingSettings] = useState(false);

  const [packagePresets, setPackagePresets] = useState<any[]>([]);

  const loadPresets = () => {
    try {
      const saved = localStorage.getItem('appPackagePresets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          setPackagePresets(parsed);
          return;
        }
      }
    } catch(e){}
    setPackagePresets([
      { id: '1', name: 'Env (56g)', weight: 56, length: 15, width: 10, height: 1 },
      { id: '2', name: 'Small Box (225g)', weight: 225, length: 20, width: 15, height: 10 },
      { id: '3', name: 'Med Box (450g)', weight: 450, length: 30, width: 25, height: 15 },
      { id: '4', name: 'Large Box (900g)', weight: 900, length: 45, width: 35, height: 25 }
    ]);
  };

  useEffect(() => {
    loadPresets();
    window.addEventListener('presets_updated', loadPresets);
    return () => window.removeEventListener('presets_updated', loadPresets);
  }, []);

  // Reset analysis when order changes
  useEffect(() => {
    setAddressAnalysis(null);
    setPackagingAdvice(null);
    setRates([]);
    setSelectedRateId('');
    if (order) {
      setLocalWeight(order.weightOz || 0);
      if (order.dimensions) {
        setLocalDimensions(order.dimensions);
      } else {
        setLocalDimensions({ length: 0, width: 0, height: 0 });
      }
      setLocalNotes(order.notes || '');
      setLocalShippingDate(order.shippingDate || '');
      setLocalCarrier(order.carrier || '');
      fetchRatesForOrder();
    }
  }, [order]);

  const handleSaveSettings = async () => {
    if (!order) return;
    setSavingSettings(true);
    try {
      await onUpdateOrder(order.id, {
        notes: localNotes,
        shippingDate: localShippingDate,
        carrier: localCarrier,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSavingSettings(false);
    }
  };

  const [splittingOrder, setSplittingOrder] = useState(false);
  const [showManualSplitModal, setShowManualSplitModal] = useState(false);

  const handleManualSplitConfirm = async (shipments: any[][]) => {
    if (!order) return;
    try {
      const res = await fetch(`/api/orders/${order.id}/manual-split`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipments })
      });
      const data = await res.json();
      if (res.ok) {
        setShowManualSplitModal(false);
        window.location.reload();
      } else {
        alert(data.error || 'Failed to split order');
      }
    } catch (e) {
      console.error(e);
      alert('Error splitting order manually');
    }
  };

  const handleSplitOrder = async () => {
    if (!order) return;
    setSplittingOrder(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/split`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        window.location.reload();
      } else {
        alert(data.error || 'Failed to split order');
      }
    } catch (e) {
      console.error(e);
      alert('Error splitting order');
    } finally {
      setSplittingOrder(false);
    }
  };

  const handleSaveSpecs = async () => {
    if (!order) return;
    setSavingSpecs(true);
    try {
      await onUpdateSpecs(order.id, localWeight, localDimensions);
      await fetchRatesForOrder();
    } catch (e) {
      console.error(e);
    } finally {
      setSavingSpecs(false);
    }
  };

  const fetchRatesForOrder = async () => {
    if (!order) return;
    setLoadingRates(true);
    try {
      const data = await onRefreshRates(order.id);
      setRates(data);
      if (data.length > 0) {
        // Auto select cheapest or existing
        const defaultRate = order.selectedRate 
          ? data.find(r => r.serviceName === order.selectedRate?.serviceName) || data[0]
          : data[0];
        setSelectedRateId(defaultRate.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRates(false);
    }
  };

  const runAddressAnalysis = async () => {
    if (!order) return;
    setAnalyzingAddress(true);
    try {
      const response = await fetch('/api/ai/analyze-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: order.shippingAddress })
      });
      const data = await response.json();
      setAddressAnalysis(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzingAddress(false);
    }
  };

  const runPackagingAdvice = async () => {
    if (!order) return;
    setAdvisingPackaging(true);
    try {
      const response = await fetch('/api/ai/packaging-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderItems: order.items, weightOz: localWeight })
      });
      const data = await response.json();
      setPackagingAdvice(data);
      if (data.dimensions) {
        setLocalDimensions(data.dimensions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdvisingPackaging(false);
    }
  };

  if (!order) {
    return (
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 flex flex-col items-center justify-center text-center h-full" id="empty-details">
        <Package className="w-16 h-16 stroke-[1] text-slate-300 mb-4 animate-bounce" />
        <h3 className="text-base font-semibold text-slate-800">No Sales Order Selected</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
          Select an Amazon or eBay pending merchant sales order from the list to manage addresses, calculate live shipping rates, and print carrier labels.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md flex flex-col overflow-hidden h-full" id="active-order-details-pane">
      {/* Title Header */}
      <div className="px-5 py-4 bg-slate-950 text-white flex justify-between items-center shrink-0">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">Selected Order Details</span>
          <h2 className="text-sm font-bold font-mono text-white flex items-center gap-2">
            {order.id} 
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
              order.source === 'amazon' ? 'bg-amber-500 text-slate-950' : 'bg-blue-600 text-white'
            }`}>
              {order.source.toUpperCase()}
            </span>
          </h2>
        </div>
        <div className="text-right">
          <span className="text-sm font-black text-white">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency }).format(order.totalAmount)}
          </span>
          <span className="block text-[10px] text-slate-400">Order Value</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5" id="details-inner-scroll">
        {/* Order Items & Splitting */}
        <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-4 h-4 text-slate-500" /> Order Items ({order.items.length})
            </h4>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowManualSplitModal(true)}
                disabled={order.items.length <= 1 && order.items[0]?.quantity === 1}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed px-2.5 py-1 rounded-md transition-all shrink-0"
                title="Manually split order into multiple shipments"
              >
                <Split className="w-3.5 h-3.5" />
                Split Shipment
              </button>
              <button
                onClick={handleSplitOrder}
                disabled={splittingOrder || (order.items.length <= 1 && order.items[0]?.quantity === 1)}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed px-2.5 py-1 rounded-md transition-all shrink-0 hidden lg:inline-flex"
                title="Split Hazmat/Heavy items or divide order into multiple shipments"
              >
                {splittingOrder ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                Auto-Split
              </button>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-100 divide-y divide-slate-100 max-h-48 overflow-y-auto">
            {order.items.map((item, idx) => (
              <div key={idx} className="p-3 flex items-start gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center text-slate-400 shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h5 className="text-[11px] font-bold text-slate-800 line-clamp-1">{item.title}</h5>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] font-mono text-slate-500">SKU: {item.sku}</span>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 rounded">Qty: {item.quantity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* CRM Customer Profile Sync */}
        <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-500" /> Customer Profile & CRM
            </h4>
          </div>
          <div className="bg-white rounded-lg border border-slate-100 p-3 space-y-3">
            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">CRM Tags</label>
              <div className="flex flex-wrap gap-1.5 items-center">
                {(customerProfile.tags || []).map((tag: string, i: number) => (
                  <span key={i} className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                    {tag}
                    <button title="Perform action"  onClick={() => {
                      const newTags = (customerProfile.tags || []).filter((t: string) => t !== tag);
                      updateCustomer(customerEmail, { tags: newTags });
                    }} className="hover:text-rose-500 font-bold">×</button>
                  </span>
                ))}
                <button title="Perform action"  
                  onClick={() => {
                    const tag = prompt("Enter new CRM tag:");
                    if (tag && !(customerProfile.tags || []).includes(tag)) {
                      updateCustomer(customerEmail, { tags: [...(customerProfile.tags || []), tag] });
                    }
                  }}
                  className="text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md border border-indigo-200 transition-colors"
                >
                  + Add Tag
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">CRM Notes</label>
              <textarea
                value={customerProfile.notes || ''}
                onChange={(e) => updateCustomer(customerEmail, { notes: e.target.value })}
                placeholder="Private notes synced with CRM..."
                className="w-full text-xs p-2 border border-slate-200 rounded bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-400 font-sans h-16 resize-none"
              />
            </div>
            {/* Communication Logs */}
            <div className="border-t border-slate-100 pt-3 mt-3">
              <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-2">Communication Logs (Tickets)</label>
              <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                {(() => {
                  
                  const customerTickets = tickets.filter(t => t.customerId === customerEmail);
                  if (customerTickets.length === 0) return <p className="text-xs text-slate-400 italic">No communication history</p>;
                  return customerTickets.map(t => (
                    <div key={t.id} className="bg-slate-50 p-2 rounded border border-slate-100">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-slate-700">{t.subject}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${t.status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'}`}>{t.status}</span>
                      </div>
                      {t.messages.length > 0 && (
                        <p className="text-[10px] text-slate-600 line-clamp-1">{t.messages[t.messages.length - 1].content}</p>
                      )}
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Destination Address Verification */}
        <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-500" /> Destination Address
            </h4>
            <button title="Add new item"
              onClick={runAddressAnalysis}
              disabled={analyzingAddress}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md transition-all shrink-0"
              id="analyze-address-btn"
            >
              {analyzingAddress ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Auditing Address...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Audit with Gemini AI
                </>
              )}
            </button>
          </div>

          <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-100 space-y-1">
            <p className="font-semibold text-slate-900">{order.shippingAddress.name}</p>
            <p>{order.shippingAddress.addressLine1}</p>
            {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
            <p>{order.shippingAddress.city}, {order.shippingAddress.stateOrRegion} {order.shippingAddress.postalCode}</p>
            <p className="text-[10px] text-slate-500 font-medium">Country: {order.shippingAddress.countryCode} {order.shippingAddress.phone && `• Tel: ${order.shippingAddress.phone}`}</p>
          </div>

          {/* Gemini Address Analysis Results */}
          {addressAnalysis && (
            <div className={`p-3 rounded-lg border text-xs space-y-2 ${
              addressAnalysis.isValid && addressAnalysis.riskLevel === 'low'
                ? 'bg-emerald-50/70 border-emerald-100 text-emerald-900'
                : addressAnalysis.riskLevel === 'high'
                  ? 'bg-rose-50 border-rose-100 text-rose-900'
                  : 'bg-amber-50/70 border-amber-100 text-amber-900'
            }`} id="address-analysis-result">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  Gemini Delivery Deliverability Analysis:
                </span>
                <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-black ${
                  addressAnalysis.riskLevel === 'low' ? 'bg-emerald-200/60' : addressAnalysis.riskLevel === 'high' ? 'bg-rose-200' : 'bg-amber-200'
                }`}>
                  {addressAnalysis.riskLevel} Risk
                </span>
              </div>
              <p className="text-[11px] leading-relaxed italic">{addressAnalysis.explanation}</p>
              
              {addressAnalysis.issuesDetected.length > 0 && (
                <div className="space-y-1 bg-white/60 p-2 rounded text-[11px]">
                  <p className="font-bold text-slate-700">Flagged Anomalies:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {addressAnalysis.issuesDetected.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {addressAnalysis.suggestedFormat && (
                <div className="bg-white/80 p-2 rounded text-[11px] space-y-1 border border-slate-200/50">
                  <p className="font-bold text-slate-700">Recommended Standardized Address:</p>
                  <div className="font-mono text-[10px] leading-tight text-slate-800">
                    <p>{addressAnalysis.suggestedFormat.name}</p>
                    <p>{addressAnalysis.suggestedFormat.addressLine1} {addressAnalysis.suggestedFormat.addressLine2 || ''}</p>
                    <p>{addressAnalysis.suggestedFormat.city}, {addressAnalysis.suggestedFormat.stateOrRegion} {addressAnalysis.suggestedFormat.postalCode}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 2: Parcel Dimensions & Gemini Weight Optimization */}
        <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-4 h-4 text-slate-500" /> Package & Box Estimations
            </h4>
            <button title="Perform action"
              onClick={runPackagingAdvice}
              disabled={advisingPackaging}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md transition-all shrink-0"
              id="ai-packaging-btn"
            >
              {advisingPackaging ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Calculating optimal box...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  AI Packaging Advisor
                </>
              )}
            </button>
          </div>

          {packagePresets.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {packagePresets.map(preset => (
                <button 
                  key={preset.id}
                  onClick={() => {
                    setLocalWeight(unitSystem === 'metric' ? preset.weight / 28.3495 : preset.weight);
                    setLocalDimensions({
                      length: unitSystem === 'metric' ? preset.length / 2.54 : preset.length,
                      width: unitSystem === 'metric' ? preset.width / 2.54 : preset.width,
                      height: unitSystem === 'metric' ? preset.height / 2.54 : preset.height
                    });
                  }}
                  className="bg-slate-200 hover:bg-indigo-100 text-slate-700 hover:text-indigo-800 text-[10px] px-2 py-1 rounded border border-slate-300 font-medium transition-colors"
                  title={`${preset.weight}${unitSystem === 'metric' ? 'g' : 'oz'} | ${preset.length}x${preset.width}x${preset.height}${unitSystem === 'metric' ? 'cm' : 'in'}`}
                >
                  📦 {preset.name}
                </button>
              ))}
            </div>
          )}

          {/* Edit dimensions fields */}
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-0.5">Weight ({unitSystem === 'metric' ? 'g' : 'oz'})</label>
                <input
                  type="number"
                  value={localWeight ? (unitSystem === 'metric' ? Math.round(localWeight * 28.3495) : localWeight) : ''}
                  placeholder={unitSystem === 'metric' ? 'g' : 'oz'}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setLocalWeight(unitSystem === 'metric' ? val / 28.3495 : val);
                  }}
                  className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white text-center font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-0.5">L ({unitSystem === 'metric' ? 'cm' : 'in'})</label>
                <input
                  type="number"
                  value={localDimensions.length ? (unitSystem === 'metric' ? Math.round(localDimensions.length * 2.54) : localDimensions.length) : ''}
                  placeholder="L"
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setLocalDimensions({ ...localDimensions, length: unitSystem === 'metric' ? val / 2.54 : val });
                  }}
                  className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white text-center font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-0.5">W ({unitSystem === 'metric' ? 'cm' : 'in'})</label>
                <input
                  type="number"
                  value={localDimensions.width ? (unitSystem === 'metric' ? Math.round(localDimensions.width * 2.54) : localDimensions.width) : ''}
                  placeholder="W"
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setLocalDimensions({ ...localDimensions, width: unitSystem === 'metric' ? val / 2.54 : val });
                  }}
                  className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white text-center font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-0.5">H ({unitSystem === 'metric' ? 'cm' : 'in'})</label>
                <input
                  type="number"
                  value={localDimensions.height ? (unitSystem === 'metric' ? Math.round(localDimensions.height * 2.54) : localDimensions.height) : ''}
                  placeholder="H"
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setLocalDimensions({ ...localDimensions, height: unitSystem === 'metric' ? val / 2.54 : val });
                  }}
                  className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white text-center font-mono font-bold"
                />
              </div>
            </div>

            {/* Amazon Shipping API requirements auto-checking checklist */}
            <div className="p-2 rounded-lg border text-[11px] space-y-1 bg-slate-50 border-slate-200">
              <div className="font-bold text-slate-700 flex items-center justify-between">
                <span>Amazon Shipping API Auto-Checker:</span>
                {localWeight > 0 && localDimensions.length > 0 && localDimensions.width > 0 && localDimensions.height > 0 ? (
                  <span className="text-emerald-700 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">✓ Meets Physical Constraints</span>
                ) : (
                  <span className="text-rose-700 font-extrabold bg-rose-50 px-1.5 py-0.5 rounded text-[10px]">⚠️ Incomplete Specs</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500">
                <div className="flex items-center gap-1">
                  <span className={localWeight > 0 ? "text-emerald-600 font-bold" : "text-slate-400"}>
                    {localWeight > 0 ? "✓" : "○"} Weight specified ({localWeight || 0} {unitSystem === "metric" ? "g" : "oz"})
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={(localDimensions.length > 0 && localDimensions.width > 0 && localDimensions.height > 0) ? "text-emerald-600 font-bold" : "text-slate-400"}>
                    {(localDimensions.length > 0 && localDimensions.width > 0 && localDimensions.height > 0) ? "✓" : "○"} Dimensions specified
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons to update local and save */}
            <button title="Save changes"
              type="button"
              onClick={handleSaveSpecs}
              disabled={savingSpecs}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white disabled:bg-slate-300 transition-all font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 shadow-sm mt-1"
              id="save-specs-btn"
            >
              {savingSpecs ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving dimensions to server...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Apply & Save Physical Specs to Order
                </>
              )}
            </button>
          </div>

          {/* Packaging advice panel */}
          {packagingAdvice && (
            <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg text-xs space-y-2" id="packaging-advice-box">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Gemini Recommended Shipping Configuration:</span>
              </div>
              <div className="bg-white/75 p-2 rounded space-y-1 text-[11px]">
                <p><strong className="text-slate-600">Container Type:</strong> {packagingAdvice.boxType}</p>
                <p><strong className="text-slate-600">Calculated Size:</strong> {packagingAdvice.dimensions.length} × {packagingAdvice.dimensions.width} × {packagingAdvice.dimensions.height} {packagingAdvice.unit}</p>
                <p><strong className="text-slate-600">Dimensional Weight Estimate:</strong> {unitSystem === "metric" ? Math.round(packagingAdvice.estimatedDimensionalWeightOz * 28.3495) : packagingAdvice.estimatedDimensionalWeightOz} {unitSystem === "metric" ? "g" : "oz"}</p>
                <p><strong className="text-slate-600 font-bold">Fragile Rating:</strong> {packagingAdvice.fragile ? '⚠️ Yes - Pack with cushioning!' : 'Standard Handle'}</p>
              </div>

              {packagingAdvice.packagingMaterials.length > 0 && (
                <div className="text-[10px] leading-relaxed">
                  <strong className="text-slate-600 block">Dunnage & Protection:</strong>
                  <span className="text-slate-800">{packagingAdvice.packagingMaterials.join(', ')}</span>
                </div>
              )}

              <p className="text-[10px] leading-relaxed text-indigo-900 italic font-medium bg-indigo-100/40 p-1.5 rounded border border-indigo-200/50">
                💡 {packagingAdvice.optimizationTip}
              </p>
            </div>
          )}
        </div>

        {/* Step 2.5: Order Notes, Required Shipping Date & Manual Carrier Override */}
        <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-3" id="fulfillment-settings-notes-block">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-slate-500" /> Fulfillment Settings & Notes
          </h4>

          <div className="space-y-3">
            {/* Notes field */}
            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">Order Notes (Auto & Manual)</label>
              <textarea
                value={localNotes}
                onChange={(e) => setLocalNotes(e.target.value)}
                placeholder="Enter special shipping instructions, order notes, etc..."
                className="w-full text-xs p-2 border border-slate-200 rounded bg-white font-sans h-16 resize-none focus:outline-none focus:border-slate-400"
                id="order-notes-textarea"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Shipping Date */}
              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">Required Shipping Date</label>
                <input
                  type="date"
                  value={localShippingDate}
                  onChange={(e) => setLocalShippingDate(e.target.value)}
                  className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white text-slate-700 font-semibold"
                  id="order-shipping-date-input"
                />
              </div>

              {/* Carrier Selection */}
              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">Preferred Carrier / Override</label>
                <select
                  value={localCarrier}
                  onChange={(e) => setLocalCarrier(e.target.value)}
                  className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white text-slate-700 font-semibold"
                  id="order-carrier-select"
                >
                  <option value="">No Carrier Assigned</option>
                  <option value="USPS">USPS (United States Postal Service)</option>
                  <option value="UPS">UPS (United Parcel Service)</option>
                  <option value="FedEx">FedEx (Federal Express)</option>
                  <option value="DHL">DHL Express</option>
                  <option value="Amazon Shipping">Amazon Shipping Carrier</option>
                </select>
              </div>
            </div>

            {/* Actions button */}
            <button title="Save changes"
              type="button"
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white disabled:bg-slate-300 transition-all font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 shadow-sm"
              id="save-fulfillment-settings-btn"
            >
              {savingSettings ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving updates...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Update Fulfillment Settings & Notes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Step 3: Rates Calculation */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-slate-500" /> Carrier Shipping Rates
            </h4>
            <button title="Perform action"
              type="button"
              onClick={fetchRatesForOrder}
              disabled={loadingRates}
              className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold"
            >
              {loadingRates ? 'Quoting Rates...' : 'Recalculate Quotes'}
            </button>
          </div>

          {loadingRates ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
              <p className="text-xs text-slate-500">Contacting Amazon Carrier Service Gateway...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {rates.map((rate) => {
                const isSelected = selectedRateId === rate.id;
                const isBuyShipping = rate.shippingType === 'buy_shipping';

                return (
                  <label
                    key={rate.id}
                    onClick={() => setSelectedRateId(rate.id)}
                    className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' 
                        : 'border-slate-100 bg-white hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="radio"
                        name="carrier_rate"
                        checked={isSelected}
                        onChange={() => setSelectedRateId(rate.id)}
                        className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900">{rate.carrierName}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                            isBuyShipping ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isBuyShipping ? 'Buy Shipping API' : 'Shipping v2 API'}
                          </span>
                        </div>
                        <span className="block text-[11px] text-slate-600 font-medium">{rate.serviceName}</span>
                        <span className="block text-[10px] text-slate-400">Delivery timeframe: {rate.deliveryDays} {rate.deliveryDays === 1 ? 'day' : 'days'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: rate.currency }).format(rate.amount)}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
        <div>
          {order.status === 'shipped' ? (
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Tracking Code</span>
              <span className="text-xs font-mono font-bold text-slate-800">{order.trackingNumber}</span>
            </div>
          ) : (
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Selected Rate</span>
              <span className="text-xs font-bold text-slate-800">
                {rates.find(r => r.id === selectedRateId)?.carrierName || 'Amazon Carrier Service'}
              </span>
            </div>
          )}
        </div>

        <div>
          {order.status === 'shipped' ? (
            <button title="Print document" 
              type="button"
              onClick={() => {
                // Open mock PDF Label in separate window with true 4x6 thermal printer size
                const labelWindow = window.open('', '_blank');
                if (labelWindow) {
                  const rate = order.selectedRate || { carrierName: 'Amazon Buy Shipping', serviceName: 'Priority Mail' };
                  labelWindow.document.write(`
                    <html>
                    <head>
                      <title>6x4 Thermal Label - Order ${order.id}</title>
                      <style>
                        @page {
                          size: 4in 6in;
                          margin: 0;
                        }
                        @media print {
                          body {
                            margin: 0;
                            padding: 0;
                            background: white;
                          }
                          .print-btn {
                            display: none !important;
                          }
                          .label-container {
                            border: 2px solid black !important;
                            box-shadow: none !important;
                            margin: 0 !important;
                          }
                        }
                        body {
                          margin: 0;
                          padding: 20px;
                          background: #f1f5f9;
                          display: flex;
                          flex-direction: column;
                          align-items: center;
                          justify-content: center;
                          font-family: 'Courier New', Courier, monospace;
                        }
                        .print-btn {
                          background: #1e293b;
                          color: white;
                          border: none;
                          padding: 10px 20px;
                          border-radius: 6px;
                          font-family: sans-serif;
                          font-weight: bold;
                          cursor: pointer;
                          margin-bottom: 15px;
                          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        }
                        .label-container {
                          width: 4in;
                          height: 6in;
                          background: white;
                          border: 3px solid black;
                          padding: 0.25in;
                          box-sizing: border-box;
                          display: flex;
                          flex-direction: column;
                          justify-content: space-between;
                          color: black;
                          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                        }
                        .section-divider {
                          border-top: 2px solid black;
                          margin: 6px 0;
                        }
                        .carrier-header {
                          display: flex;
                          justify-content: space-between;
                          align-items: center;
                          font-size: 14px;
                          font-weight: 900;
                        }
                        .service-pill {
                          background: black;
                          color: white;
                          padding: 2px 6px;
                          font-size: 11px;
                          font-weight: bold;
                        }
                        .address-block {
                          font-size: 11px;
                          line-height: 1.3;
                        }
                        .tracking-section {
                          text-align: center;
                        }
                        .barcode-area {
                          background: black;
                          height: 50px;
                          width: 100%;
                          margin: 8px 0;
                          display: flex;
                          align-items: center;
                          justify-content: space-between;
                          padding: 0 4px;
                        }
                        /* Mimic high contrast barcode lines */
                        .barcode-bar {
                          background: white;
                          height: 100%;
                        }
                        .tracking-text {
                          font-size: 12px;
                          font-weight: bold;
                          letter-spacing: 1.5px;
                          font-family: monospace;
                        }
                        .tag-indicator {
                          border: 1px solid black;
                          padding: 1px 3px;
                          font-size: 8px;
                          font-weight: bold;
                          display: inline-block;
                        }
                      </style>
                    </head>
                    <body>
                      <button title="Print document" class="print-btn" onclick="window.print()">Print Label (Direct 6x4 / 4x6)</button>
                      
                      <div class="label-container">
                        <div class="carrier-header">
                          <div>
                            <span class="service-pill">AMZN</span>
                            <span style="margin-left:5px;">${rate.carrierName.toUpperCase()}</span>
                          </div>
                          <span style="font-size: 12px; font-weight:bold;">${rate.serviceName.toUpperCase()}</span>
                        </div>
                        
                        <div class="section-divider"></div>
                        
                        <div class="address-block">
                          <strong>SHIP FROM:</strong><br/>
                          Multi-Channel Logistics Dept 3B<br/>
                          1200 Logistics Pkwy<br/>
                          Pasadena, CA 91101
                        </div>
                        
                        <div class="section-divider"></div>
                        
                        <div class="address-block">
                          <strong>SHIP TO:</strong><br/>
                          <span style="font-size: 13px; font-weight: bold;">${order.shippingAddress.name}</span><br/>
                          ${order.shippingAddress.addressLine1}<br/>
                          ${order.shippingAddress.city}, ${order.shippingAddress.stateOrRegion} ${order.shippingAddress.postalCode}
                        </div>
                        
                        <div class="section-divider"></div>
                        
                        <div style="display:flex; justify-content:space-between; font-size:10px;">
                          <div>
                            <strong>WT:</strong> ${unitSystem === 'metric' ? `${Math.round((order.weightOz || 16) * 28.3495)} g (${Math.round((order.weightOz || 16) * 28.3495 / 1000 * 10) / 10} kg)` : `${order.weightOz || 16} OZ (${Math.round((order.weightOz || 16)/16*10)/10} LBS)`}
                          </div>
                          <div>
                            <strong>DIMS:</strong> ${order.dimensions ? (unitSystem === 'metric' ? `${Math.round(order.dimensions.length * 2.54)}x${Math.round(order.dimensions.width * 2.54)}x${Math.round(order.dimensions.height * 2.54)} cm` : `${order.dimensions.length}x${order.dimensions.width}x${order.dimensions.height} in`) : 'Standard'}
                          </div>
                        </div>

                        {/* Render active tags on label for direct printer identification */}
                        ${order.tags && order.tags.length > 0 ? `
                          <div style="margin-top: 3px;">
                            ${order.tags.map((t: string) => `<span class="tag-indicator">${t.toUpperCase()}</span>`).join(' ')}
                          </div>
                        ` : ''}
                        
                        <div class="section-divider"></div>
                        
                        <div class="tracking-section">
                          <div class="barcode-area">
                            ${Array.from({length: 45}).map((_, i) => `
                              <div class="barcode-bar" style="width: ${Math.random() > 0.45 ? '2px' : '4px'}; opacity: ${Math.random() > 0.15 ? '1' : '0'}"></div>
                            `).join('')}
                          </div>
                          <div class="tracking-text">${order.trackingNumber}</div>
                          <div style="font-size: 8px; margin-top: 3px;">Order: ${order.id} | Source: ${order.source.toUpperCase()}</div>
                        </div>
                      </div>
                    </body>
                    </html>
                  `);
                  labelWindow.document.close();
                } else {
                  alert('Popup blocked. Please check permissions to print label.');
                }
              }}
              className="flex items-center gap-2 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
              id="print-single-label-btn"
            >
              <Printer className="w-4 h-4" /> Print PDF Label (6x4)
            </button>
          ) : (
            <button title="Perform action" 
              type="button"
              onClick={() => {
                if (selectedRateId) {
                  onBuyLabel(order.id, selectedRateId);
                }
              }}
              disabled={loadingRates || !selectedRateId}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-100"
              id="buy-label-btn"
            >
              <CheckCircle className="w-4 h-4" /> Buy Label & Ship
            </button>
          )}
        </div>
      </div>
      
      {showManualSplitModal && order && (
        <SplitOrderModal 
          order={order}
          onClose={() => setShowManualSplitModal(false)}
          onSplitConfirm={handleManualSplitConfirm}
        />
      )}
    </div>
  );
}
