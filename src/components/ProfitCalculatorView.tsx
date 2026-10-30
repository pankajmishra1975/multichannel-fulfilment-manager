import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  HelpCircle, 
  Percent, 
  CheckCircle, 
  ArrowRight, 
  Info, 
  TrendingUp, 
  DollarSign, 
  AlertCircle,
  Package,
  FileText
} from 'lucide-react';
import { Product } from '../types';

interface ProfitCalculatorViewProps {
  products: Product[];
  currency: string;
}

export default function ProfitCalculatorView({ products, currency }: ProfitCalculatorViewProps) {
  // Option to pre-populate from an existing catalog product
  const [selectedProductSku, setSelectedProductSku] = useState('');
  
  // Custom item descriptors
  const [itemName, setItemName] = useState('New Product Trial');
  
  // Business VAT Registration Status
  const [isVatRegistered, setIsVatRegistered] = useState<boolean>(true);
  
  // Base Prices and Costs
  const [sellingPrice, setSellingPrice] = useState<number>(89.99);
  const [buyingPrice, setBuyingPrice] = useState<number>(45.00);
  const [fulfillmentPrice, setFulfillmentPrice] = useState<number>(4.50);
  const [storageFee, setStorageFee] = useState<number>(1.20);
  const [commissionPercent, setCommissionPercent] = useState<number>(15); // standard 15% marketplace commission
  const [commissionFlat, setCommissionFlat] = useState<number>(0);
  const [packagingCost, setPackagingCost] = useState<number>(1.50);
  const [labourCost, setLabourCost] = useState<number>(2.00);

  // Global Changeable VAT Rate
  const [vatRate, setVatRate] = useState<number>(20); // default 20% (e.g. UK standard)

  // Discretionary VAT controls per element
  const [vatOnSelling, setVatOnSelling] = useState(true);
  const [vatOnBuying, setVatOnBuying] = useState(true);
  const [vatOnFulfillment, setVatOnFulfillment] = useState(true); // Default to standard shipping VAT
  const [vatOnStorage, setVatOnStorage] = useState(false);
  const [vatOnCommission, setVatOnCommission] = useState(true);
  const [vatOnPackaging, setVatOnPackaging] = useState(false);
  const [vatOnLabour, setVatOnLabour] = useState(false);

  // Is Selling Price VAT-inclusive or exclusive
  const [sellingVatInclusive, setSellingVatInclusive] = useState(true);

  // Handle selected product changed
  const handleProductSelect = (sku: string) => {
    setSelectedProductSku(sku);
    if (!sku) return;
    const found = products.find(p => p.sku === sku);
    if (found) {
      setItemName(found.name);
      setSellingPrice(Number(found.sellingPrice || 0));
      setBuyingPrice(Number(found.buyingPrice || 0));
      // Pre-populate logical defaults
      setFulfillmentPrice(4.50);
      setStorageFee(1.20);
      setCommissionPercent(15);
      setCommissionFlat(0);
      setPackagingCost(1.50);
      setLabourCost(2.00);
      setVatOnSelling(found.vatType === 'VAT');
      setVatOnBuying(found.vatType === 'VAT');
    }
  };

  // Calculations
  const calcSellingVat = () => {
    if (!vatOnSelling) return 0;
    const rateDecimal = vatRate / 100;
    if (sellingVatInclusive) {
      // Selling price already includes VAT.
      // VAT Amount = Selling Price * (Rate / (1 + Rate))
      return sellingPrice * (rateDecimal / (1 + rateDecimal));
    } else {
      // Selling price is net.
      // VAT Amount = Selling Price * Rate
      return sellingPrice * rateDecimal;
    }
  };

  const calcSellingNet = () => {
    if (vatOnSelling && sellingVatInclusive) {
      return sellingPrice - calcSellingVat();
    }
    return sellingPrice; // Net is the full price because VAT is either not applied, or exclusive
  };

  const calcSellingGross = () => {
    if (vatOnSelling && !sellingVatInclusive) {
      return sellingPrice + calcSellingVat();
    }
    return sellingPrice; // Selling price is gross already
  };

  // Buying Net and VAT
  const calcBuyingVat = () => {
    if (!vatOnBuying) return 0;
    return buyingPrice * (vatRate / 100);
  };
  const calcBuyingTotal = () => buyingPrice + calcBuyingVat();

  // Fulfillment Net and VAT
  const calcFulfillmentVat = () => {
    if (!vatOnFulfillment) return 0;
    return fulfillmentPrice * (vatRate / 100);
  };
  const calcFulfillmentTotal = () => fulfillmentPrice + calcFulfillmentVat();

  // Storage Net and VAT
  const calcStorageVat = () => {
    if (!vatOnStorage) return 0;
    return storageFee * (vatRate / 100);
  };
  const calcStorageTotal = () => storageFee + calcStorageVat();

  // Commission Net and VAT
  const calcCommissionBase = () => {
    return (sellingPrice * (commissionPercent / 100)) + commissionFlat;
  };
  const calcCommissionVat = () => {
    if (!vatOnCommission) return 0;
    return calcCommissionBase() * (vatRate / 100);
  };
  const calcCommissionTotal = () => calcCommissionBase() + calcCommissionVat();

  // Packaging Net and VAT
  const calcPackagingVat = () => {
    if (!vatOnPackaging) return 0;
    return packagingCost * (vatRate / 100);
  };
  const calcPackagingTotal = () => packagingCost + calcPackagingVat();

  // Labour Net and VAT
  const calcLabourVat = () => {
    if (!vatOnLabour) return 0;
    return labourCost * (vatRate / 100);
  };
  const calcLabourTotal = () => labourCost + calcLabourVat();

  // Financial Summary Computations:
  // If registered: net costs exclude VAT because VAT paid is fully reclaimable.
  // If NOT registered: net costs MUST include the paid VAT as a non-reclaimable expense!
  const netRevenue = isVatRegistered ? calcSellingNet() : sellingPrice;
  const netBuying = buyingPrice + (isVatRegistered ? 0 : calcBuyingVat());
  const netFulfillment = fulfillmentPrice + (isVatRegistered ? 0 : calcFulfillmentVat());
  const netStorage = storageFee + (isVatRegistered ? 0 : calcStorageVat());
  const netCommission = calcCommissionBase() + (isVatRegistered ? 0 : calcCommissionVat());
  const netPackaging = packagingCost + (isVatRegistered ? 0 : calcPackagingVat());
  const netLabour = labourCost + (isVatRegistered ? 0 : calcLabourVat());

  const totalNetCosts = netBuying + netFulfillment + netStorage + netCommission + netPackaging + netLabour;
  const netProfit = netRevenue - totalNetCosts;
  const profitMarginPercent = netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0;
  const roiPercent = totalNetCosts > 0 ? (netProfit / totalNetCosts) * 100 : 0;

  // VAT Liability Reconciliation (Applicable only if VAT-registered)
  const vatCollected = isVatRegistered ? calcSellingVat() : 0;
  const vatPaidReclaimable = isVatRegistered 
    ? (calcBuyingVat() + 
       calcFulfillmentVat() + 
       calcStorageVat() + 
       calcCommissionVat() + 
       calcPackagingVat() + 
       calcLabourVat())
    : 0;
  const netVatLiability = isVatRegistered ? (vatCollected - vatPaidReclaimable) : 0;

  // Currency symbol mapper
  const getCurrencySymbol = (code: string) => {
    switch (code.toUpperCase()) {
      case 'GBP': return '£';
      case 'EUR': return '€';
      case 'JPY': return '¥';
      case 'CAD': return '$';
      default: return '$';
    }
  };

  const symbol = getCurrencySymbol(currency);

  return (
    <div className="space-y-6" id="profit-calculator-container">
      
      {/* Top Selector Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1 w-full sm:w-auto">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Calculator className="w-4.5 h-4.5 text-indigo-600" />
            Purchase Feasibility & Profit Margin Calculator
          </h3>
          <p className="text-[11px] text-slate-500">Analyze procurement viability, reclaimable VAT, and custom net courier charges before buying.</p>
        </div>
        
        {/* Quick Catalog Loader */}
        <div className="w-full sm:w-72 shrink-0 space-y-1">
          <label className="text-[9px] uppercase font-bold text-slate-400 block">Prepopulate from catalog SKU</label>
          <select
            value={selectedProductSku}
            onChange={(e) => handleProductSelect(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">-- Choose Existing Product (Optional) --</option>
            {products.map(p => (
              <option key={p.sku} value={p.sku}>[{p.sku}] {p.name.substring(0, 32)}...</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Inputs vs Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Inputs and Discretionary Toggles */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs lg:col-span-7 overflow-hidden">
          <div className="p-5 border-b border-slate-200 bg-slate-50/50">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Procurement & Tariff Components
            </h4>
            <p className="text-[11px] text-slate-500">Apply discretionary VAT percentages or toggle taxable elements individually</p>
          </div>

          <div className="p-6 space-y-6">
            
            {/* VAT Registration Status Banner */}
            <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-black text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
                  Merchant VAT Registration Scheme
                </span>
                <p className="text-[10.5px] text-slate-500 leading-normal max-w-md">
                  If <strong>Registered</strong>, you charge VAT on sales, reclaim VAT on buying/postage costs, and display net profitability. If <strong>Exempt (Not Registered)</strong>, you do not collect sales VAT, and input VAT paid to suppliers is treated as a non-reclaimable cost.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 select-none bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  checked={isVatRegistered}
                  onChange={(e) => setIsVatRegistered(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[8px] after:left-[14px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                <span className="ml-2 text-xs font-black text-slate-700 w-16">
                  {isVatRegistered ? 'Registered' : 'Exempt'}
                </span>
              </label>
            </div>

            {/* Custom Descriptor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Item Identifier</label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-indigo-500 font-semibold text-slate-800"
                  placeholder="e.g. Trial Batch Smartwatch v3"
                />
              </div>

              {/* VAT Rate setting */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  Global Standard VAT Rate (%)
                  <span className="text-[9px] text-indigo-600 bg-indigo-50 px-1 py-0.2 rounded font-black">Changeable</span>
                </label>
                <div className="relative">
                  <span className="absolute right-3.5 top-2.5 text-slate-400 text-xs font-bold">%</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={vatRate}
                    onChange={(e) => setVatRate(Number(e.target.value))}
                    className="w-full text-xs p-2 pr-8 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-indigo-500 font-bold text-slate-800"
                    placeholder="20"
                  />
                </div>
              </div>
            </div>

            {/* Elements Section */}
            <div className="space-y-4">
              <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block border-b border-slate-100 pb-1">
                Cost Breakdown & Discretionary VAT Matrix
              </span>

              {/* Element 1: Selling Price */}
              <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      1. Selling Price (List Price)
                    </span>
                    <p className="text-[10px] text-slate-400">Target retail sale price advertised on storefront</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-600">{symbol}</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(Number(e.target.value))}
                      className="w-32 text-xs p-1.5 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none text-right bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-dashed border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={vatOnSelling}
                      onChange={(e) => setVatOnSelling(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-[11px] font-bold text-slate-600">Apply VAT on this sale</span>
                  </label>

                  {vatOnSelling && (
                    <div className="flex items-center justify-end gap-3 text-[11px]">
                      <span className="text-slate-500">Tax inclusive?</span>
                      <div className="flex bg-slate-200 p-0.5 rounded-lg border border-slate-200">
                        <button title="Perform action" 
                          type="button"
                          onClick={() => setSellingVatInclusive(true)}
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${sellingVatInclusive ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                        >
                          Inclusive
                        </button>
                        <button title="Perform action" 
                          type="button"
                          onClick={() => setSellingVatInclusive(false)}
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${!sellingVatInclusive ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                        >
                          Exclusive
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Element 2: Buying Price */}
              <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                      2. Procurement Price (Excluding VAT)
                    </span>
                    <p className="text-[10px] text-slate-400">Net purchase cost from supplier without VAT. VAT will be added on top if charged.</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-600">{symbol}</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={buyingPrice}
                      onChange={(e) => setBuyingPrice(Number(e.target.value))}
                      className="w-32 text-xs p-1.5 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none text-right bg-white"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-dashed border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={vatOnBuying}
                      onChange={(e) => setVatOnBuying(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-[11px] font-bold text-slate-600">Supplier charges standard VAT (Reclaimable input VAT if registered)</span>
                  </label>
                </div>
              </div>

              {/* Element 3: Fulfillment Price */}
              <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      3. Fulfillment Postage Cost (Excluding VAT)
                    </span>
                    <p className="text-[10px] text-slate-400">Base courier postage service without VAT. VAT will be added on top if applicable.</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-600">{symbol}</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={fulfillmentPrice}
                      onChange={(e) => setFulfillmentPrice(Number(e.target.value))}
                      className="w-32 text-xs p-1.5 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none text-right bg-white"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-dashed border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={vatOnFulfillment}
                      onChange={(e) => setVatOnFulfillment(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-[11px] font-bold text-slate-600">Courier charges standard VAT on postage service</span>
                  </label>
                </div>
              </div>

              {/* Element 4: Storage Fee */}
              <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      4. Shelf storage fee
                    </span>
                    <p className="text-[10px] text-slate-400">Amazon FBA or local warehouse rent overheads per unit</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-600">{symbol}</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={storageFee}
                      onChange={(e) => setStorageFee(Number(e.target.value))}
                      className="w-32 text-xs p-1.5 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none text-right bg-white"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-dashed border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={vatOnStorage}
                      onChange={(e) => setVatOnStorage(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-[11px] font-bold text-slate-600">Apply VAT to warehousing rent (Taxable rent)</span>
                  </label>
                </div>
              </div>

              {/* Element 5: Selling Fee Commission */}
              <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                      5. Selling Fee Commission
                    </span>
                    <p className="text-[10px] text-slate-400">Marketplace referral/payment processing commission fee</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={commissionPercent}
                        onChange={(e) => setCommissionPercent(Number(e.target.value))}
                        className="w-16 text-xs p-1.5 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none text-right bg-white"
                      />
                      <span className="text-xs text-slate-500 font-bold">%</span>
                    </div>
                    <span className="text-xs text-slate-400 font-bold">+</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-600">{symbol}</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={commissionFlat}
                        onChange={(e) => setCommissionFlat(Number(e.target.value))}
                        className="w-20 text-xs p-1.5 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none text-right bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-dashed border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={vatOnCommission}
                      onChange={(e) => setVatOnCommission(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-[11px] font-bold text-slate-600">Apply VAT to commission (Reverse charge / Taxable invoice)</span>
                  </label>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Total: {symbol}{calcCommissionTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Element 6: Packaging Cost */}
              <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      6. Packaging Cost
                    </span>
                    <p className="text-[10px] text-slate-400">Cardboard boxes, polybags, bubble wrap, tape and labels per unit</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-600">{symbol}</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={packagingCost}
                      onChange={(e) => setPackagingCost(Number(e.target.value))}
                      className="w-32 text-xs p-1.5 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none text-right bg-white"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-dashed border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={vatOnPackaging}
                      onChange={(e) => setVatOnPackaging(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-[11px] font-bold text-slate-600">Apply VAT to packaging materials (Reclaimable Input Tax)</span>
                  </label>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Total: {symbol}{calcPackagingTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Element 7: Labour Cost */}
              <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                      7. Labour Cost
                    </span>
                    <p className="text-[10px] text-slate-400">Pick, pack, assembly and administrative labor per unit</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-600">{symbol}</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={labourCost}
                      onChange={(e) => setLabourCost(Number(e.target.value))}
                      className="w-32 text-xs p-1.5 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none text-right bg-white"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-dashed border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={vatOnLabour}
                      onChange={(e) => setVatOnLabour(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-[11px] font-bold text-slate-600">Apply VAT to outsourced labour (Reclaimable Input Tax)</span>
                  </label>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Total: {symbol}{calcLabourTotal().toFixed(2)}
                  </span>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Right Side: Profitability Dashboard Ledger */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Main Net Profit Card */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden text-white flex flex-col justify-between">
            <div className="p-5 border-b border-slate-800 bg-slate-950/40">
              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block">Financial Viability Audit</span>
              <h3 className="text-sm font-black uppercase text-white tracking-wide mt-1">Net profit ledger</h3>
            </div>

            <div className="p-6 space-y-5">
              
              {/* Massive Profit Metric */}
              <div className="text-center py-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Estimated Net Profit per item</span>
                <span className={`text-4xl font-black block tracking-tight my-1 ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                  {netProfit < 0 ? '-' : ''}{symbol}{Math.abs(netProfit).toFixed(2)}
                </span>
                <span className="text-[10px] bg-slate-800/60 px-2.5 py-1 rounded-full text-slate-300 border border-slate-700/50 font-semibold inline-block">
                  Net margin: <strong>{profitMarginPercent.toFixed(1)}%</strong>
                </span>
              </div>

              {/* VAT Duty / Refund added in Main Box */}
              <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                !isVatRegistered 
                  ? 'bg-slate-950/45 border-slate-800/60 text-slate-300'
                  : netVatLiability >= 0 
                    ? 'bg-amber-950/25 border-amber-800/40 text-amber-200' 
                    : 'bg-emerald-950/25 border-emerald-800/40 text-emerald-200'
              }`}>
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5 uppercase tracking-wide text-[10px]">
                    <span className={`w-2 h-2 rounded-full ${
                      !isVatRegistered 
                        ? 'bg-slate-400 animate-pulse' 
                        : netVatLiability >= 0 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}></span>
                    Main VAT Duty Status
                  </span>
                  <span className="font-mono text-[10px] uppercase font-black">
                    {!isVatRegistered ? 'Exempt' : netVatLiability >= 0 ? 'Payable' : 'Redeemable Refund'}
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-400 leading-normal">
                  {!isVatRegistered 
                    ? `Not registered. Input VAT paid on purchases (${symbol}${(calcBuyingVat() + calcFulfillmentVat() + calcStorageVat() + calcCommissionVat() + calcPackagingVat() + calcLabourVat()).toFixed(2)}) is non-reclaimable and fully added to procurement costs, directly reducing Net Profit.`
                    : netVatLiability >= 0 
                      ? `Output VAT collected on sales exceeds Input VAT reclaimable. Net VAT Duty of ${symbol}${netVatLiability.toFixed(2)} is payable to Custom Revenue.`
                      : `Input VAT paid on purchases exceeds Output VAT collected. Net VAT Refund of ${symbol}${Math.abs(netVatLiability).toFixed(2)} is redeemable and added back to your cash flow.`}
                </p>
                {isVatRegistered && (
                  <div className="flex justify-between items-center pt-1.5 border-t border-slate-800/60 text-slate-300 font-semibold">
                    <span>VAT Cash flow Adjustment:</span>
                    <span className={`font-mono font-black ${netVatLiability >= 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {netVatLiability >= 0 ? '-' : '+'}{symbol}{Math.abs(netVatLiability).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Financial Metrics Mini-grid */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-slate-950/30 p-3 rounded-xl border border-slate-800/40">
                  <span className="text-[9px] text-slate-400 uppercase block">Total Net Investment</span>
                  <span className="text-sm font-mono font-black text-slate-200 mt-1 block">
                    {symbol}{totalNetCosts.toFixed(2)}
                  </span>
                </div>
                <div className="bg-slate-950/30 p-3 rounded-xl border border-slate-800/40">
                  <span className="text-[9px] text-slate-400 uppercase block">Return on Investment (ROI)</span>
                  <span className={`text-sm font-mono font-black mt-1 block ${roiPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {roiPercent.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Detailed Breakdown Ledger */}
              <div className="space-y-2.5 text-xs pt-2">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">Line Item Audit Ledger</span>
                
                {/* Sale item */}
                <div className="flex justify-between items-center text-slate-300">
                  <span>Gross Sales price (Customer pays)</span>
                  <span className="font-mono">{symbol}{calcSellingGross().toFixed(2)}</span>
                </div>

                {/* VAT collected */}
                {vatOnSelling && isVatRegistered && (
                  <div className="flex justify-between items-center text-slate-400 text-[11px] pl-3 border-l border-slate-800">
                    <span>- Output VAT collected ({vatRate}%)</span>
                    <span className="font-mono text-rose-400">-{symbol}{calcSellingVat().toFixed(2)}</span>
                  </div>
                )}

                {/* Net revenue */}
                <div className="flex justify-between items-center text-emerald-400 font-bold border-b border-dashed border-slate-800 pb-2">
                  <span>Net Revenue (excluding VAT)</span>
                  <span className="font-mono">{symbol}{netRevenue.toFixed(2)}</span>
                </div>

                {/* Net Buying Cost */}
                <div className="flex justify-between items-center text-slate-300">
                  <span>Procurement Net Buying Cost</span>
                  <span className="font-mono">-{symbol}{buyingPrice.toFixed(2)}</span>
                </div>

                {/* Buying VAT reclaimable or cost */}
                {vatOnBuying && (
                  <div className="flex justify-between items-center text-slate-400 text-[11px] pl-3 border-l border-slate-800">
                    {isVatRegistered ? (
                      <>
                        <span>+ Input VAT reclaimable ({vatRate}%)</span>
                        <span className="font-mono text-emerald-500">+{symbol}{calcBuyingVat().toFixed(2)}</span>
                      </>
                    ) : (
                      <>
                        <span>- Non-reclaimable Input VAT ({vatRate}%)</span>
                        <span className="font-mono text-rose-400">-{symbol}{calcBuyingVat().toFixed(2)}</span>
                      </>
                    )}
                  </div>
                )}

                {/* Net Fulfillment */}
                <div className="flex justify-between items-center text-slate-300">
                  <span>Fulfillment Net Service Cost</span>
                  <span className="font-mono">-{symbol}{fulfillmentPrice.toFixed(2)}</span>
                </div>

                {/* Fulfillment VAT */}
                {vatOnFulfillment && (
                  <div className="flex justify-between items-center text-slate-400 text-[11px] pl-3 border-l border-slate-800">
                    {isVatRegistered ? (
                      <>
                        <span>+ Input VAT reclaimable ({vatRate}%)</span>
                        <span className="font-mono text-emerald-500">+{symbol}{calcFulfillmentVat().toFixed(2)}</span>
                      </>
                    ) : (
                      <>
                        <span>- Non-reclaimable Input VAT ({vatRate}%)</span>
                        <span className="font-mono text-rose-400">-{symbol}{calcFulfillmentVat().toFixed(2)}</span>
                      </>
                    )}
                  </div>
                )}

                {/* Shelf storage */}
                <div className="flex justify-between items-center text-slate-300">
                  <span>Net Storage Rental Overheads</span>
                  <span className="font-mono">-{symbol}{storageFee.toFixed(2)}</span>
                </div>

                {/* Storage VAT */}
                {vatOnStorage && (
                  <div className="flex justify-between items-center text-slate-400 text-[11px] pl-3 border-l border-slate-800">
                    {isVatRegistered ? (
                      <>
                        <span>+ Input VAT reclaimable ({vatRate}%)</span>
                        <span className="font-mono text-emerald-500">+{symbol}{calcStorageVat().toFixed(2)}</span>
                      </>
                    ) : (
                      <>
                        <span>- Non-reclaimable Input VAT ({vatRate}%)</span>
                        <span className="font-mono text-rose-400">-{symbol}{calcStorageVat().toFixed(2)}</span>
                      </>
                    )}
                  </div>
                )}

                {/* Selling Fee Commission */}
                <div className="flex justify-between items-center text-slate-300">
                  <span>Selling Fee Commission</span>
                  <span className="font-mono">-{symbol}{calcCommissionBase().toFixed(2)}</span>
                </div>

                {/* Commission VAT */}
                {vatOnCommission && (
                  <div className="flex justify-between items-center text-slate-400 text-[11px] pl-3 border-l border-slate-800">
                    {isVatRegistered ? (
                      <>
                        <span>+ Input VAT reclaimable ({vatRate}%)</span>
                        <span className="font-mono text-emerald-500">+{symbol}{calcCommissionVat().toFixed(2)}</span>
                      </>
                    ) : (
                      <>
                        <span>- Non-reclaimable Input VAT ({vatRate}%)</span>
                        <span className="font-mono text-rose-400">-{symbol}{calcCommissionVat().toFixed(2)}</span>
                      </>
                    )}
                  </div>
                )}

                {/* Packaging Cost */}
                <div className="flex justify-between items-center text-slate-300">
                  <span>Packaging materials cost</span>
                  <span className="font-mono">-{symbol}{packagingCost.toFixed(2)}</span>
                </div>

                {/* Packaging VAT */}
                {vatOnPackaging && (
                  <div className="flex justify-between items-center text-slate-400 text-[11px] pl-3 border-l border-slate-800">
                    {isVatRegistered ? (
                      <>
                        <span>+ Input VAT reclaimable ({vatRate}%)</span>
                        <span className="font-mono text-emerald-500">+{symbol}{calcPackagingVat().toFixed(2)}</span>
                      </>
                    ) : (
                      <>
                        <span>- Non-reclaimable Input VAT ({vatRate}%)</span>
                        <span className="font-mono text-rose-400">-{symbol}{calcPackagingVat().toFixed(2)}</span>
                      </>
                    )}
                  </div>
                )}

                {/* Labour Cost */}
                <div className="flex justify-between items-center text-slate-300">
                  <span>Pick, pack & assembly labour</span>
                  <span className="font-mono">-{symbol}{labourCost.toFixed(2)}</span>
                </div>

                {/* Labour VAT */}
                {vatOnLabour && (
                  <div className="flex justify-between items-center text-slate-400 text-[11px] pl-3 border-l border-slate-800">
                    {isVatRegistered ? (
                      <>
                        <span>+ Input VAT reclaimable ({vatRate}%)</span>
                        <span className="font-mono text-emerald-500">+{symbol}{calcLabourVat().toFixed(2)}</span>
                      </>
                    ) : (
                      <>
                        <span>- Non-reclaimable Input VAT ({vatRate}%)</span>
                        <span className="font-mono text-rose-400">-{symbol}{calcLabourVat().toFixed(2)}</span>
                      </>
                    )}
                  </div>
                )}

              </div>

            </div>
          </div>

          {/* Reclaimable VAT Summary Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-600" />
              VAT Reconciliation Report
            </h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Reconciles VAT collected on sales against purchase expenditures to identify quarterly tax obligations or refunds.
            </p>

            <div className="grid grid-cols-3 gap-3 text-center bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-400">Collected</span>
                <span className="text-xs font-mono font-black text-rose-600 block">
                  {symbol}{vatCollected.toFixed(2)}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-400">Reclaimable</span>
                <span className="text-xs font-mono font-black text-emerald-600 block">
                  {symbol}{vatPaidReclaimable.toFixed(2)}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-400">Net Duty</span>
                <span className={`text-xs font-mono font-black block ${netVatLiability >= 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {netVatLiability >= 0 ? '+' : '-'}{symbol}{Math.abs(netVatLiability).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl flex items-start gap-2 text-[10px] text-amber-800 leading-normal">
              <AlertCircle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
              <p>
                {netVatLiability >= 0 
                  ? `This purchase requires paying a net VAT duty of ${symbol}${netVatLiability.toFixed(2)} per item to custom revenues.`
                  : `This purchase generates a net tax credit of ${symbol}${Math.abs(netVatLiability).toFixed(2)} reclaimable upon quarterly filings.`}
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
