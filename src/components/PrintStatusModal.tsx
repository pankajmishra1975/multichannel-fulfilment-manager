import React from 'react';
import { 
  Printer, 
  CheckCircle, 
  ExternalLink, 
  Layers, 
  X, 
  TrendingUp, 
  DollarSign, 
  Check, 
  Copy,
  Info
} from 'lucide-react';
import { Order } from '../types';

interface PrintStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  processedCount: number;
  processedOrders: any[];
  preferredStrategy: string;
  onOpenSpool: () => void;
  currency?: string;
  unitSystem?: string;
}

export default function PrintStatusModal({
  isOpen,
  onClose,
  processedCount,
  processedOrders,
  preferredStrategy,
  onOpenSpool,
  currency = "USD",
  unitSystem = "imperial"
}: PrintStatusModalProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [templates, setTemplates] = React.useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = React.useState<string>('shipping_label_4x6');
  const [selectedPrinter, setSelectedPrinter] = React.useState<string>(() => {
    return localStorage.getItem('orders_deck_preferred_printer') || 'thermal-zt411';
  });
  const [isPrinting, setIsPrinting] = React.useState<boolean>(false);

  React.useEffect(() => {
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => {
        if(data && data.length > 0) {
          setTemplates(data);
          setSelectedTemplate(data[0].id);
        }
      })
      .catch(err => console.error(err));
  }, []);

  if (!isOpen) return null;

  // Native Browser Print spooler using a hidden iframe
  const handleNativePrint = () => {
    setIsPrinting(true);
    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
      if (!iframeDoc) {
        setIsPrinting(false);
        return;
      }

      const printerNameMap: Record<string, string> = {
        'thermal-zt411': 'Zebra ZT411 (300dpi)',
        'dymo-4xl': 'Dymo LabelWriter 4XL',
        'laserjet-m404': 'LaserJet Pro M404',
        'microsoft-pdf': 'Save as PDF Queue'
      };

      const labelsHtml = processedOrders.map((o: any) => `
        <div class="label-card">
          <div class="carrier-header">
            <div>
              <span class="service-pill">AMZN</span>
              <span style="margin-left:5px;">${(o.selectedRate?.carrierName || 'CARRIER').toUpperCase()}</span>
            </div>
            <span style="font-size: 12px; font-weight:bold;">${(o.selectedRate?.serviceName || 'SERVICE').toUpperCase()}</span>
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
            <span style="font-size: 13px; font-weight: bold;">${o.shippingAddress?.name || o.buyerName || 'Valued Customer'}</span><br/>
            ${o.shippingAddress?.addressLine1 || ''}<br/>
            ${o.shippingAddress?.city || ''}, ${o.shippingAddress?.stateOrRegion || ''} ${o.shippingAddress?.postalCode || ''}
          </div>
          
          <div class="section-divider"></div>
          
          <div style="display:flex; justify-content:space-between; font-size:10px;">
            <div>
              <strong>WT:</strong> ${unitSystem === "metric" ? `${Math.round((o.weightOz || 16) * 28.3495)} g (${Math.round((o.weightOz || 16) * 28.3495 / 1000 * 10) / 10} kg)` : `${o.weightOz || 16} OZ (${Math.round((o.weightOz || 16)/16*10)/10} LBS)`}
            </div>
            <div>
              <strong>DIMS:</strong> ${o.dimensions ? (unitSystem === "metric" ? `${Math.round(o.dimensions.length * 2.54)}x${Math.round(o.dimensions.width * 2.54)}x${Math.round(o.dimensions.height * 2.54)} cm` : `${o.dimensions.length}x${o.dimensions.width}x${o.dimensions.height} in`) : 'Standard'}
            </div>
          </div>

          ${o.tags && o.tags.length > 0 ? `
            <div style="margin-top: 3px;">
              ${o.tags.map((t: string) => `<span class="tag-indicator">${t.toUpperCase()}</span>`).join(' ')}
            </div>
          ` : ''}
          
          <div class="section-divider"></div>
          
          <div class="tracking-section">
            <div class="barcode-area">
              ${Array.from({length: 45}).map((_, i) => `
                <div class="barcode-bar" style="width: ${Math.random() > 0.45 ? '2px' : '4px'}; opacity: ${Math.random() > 0.15 ? '1' : '0'}"></div>
              `).join('')}
            </div>
            <div class="tracking-text">${o.trackingNumber || 'TRK-PENDING'}</div>
            <div style="font-size: 8px; margin-top: 3px;">Order: ${o.id} | Source: ${(o.source || '').toUpperCase()}</div>
          </div>
        </div>
      `).join('');

      iframeDoc.write(`
        <html>
        <head>
          <title>Bulk Spool - ${printerNameMap[selectedPrinter] || 'Direct Spool'}</title>
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
              .label-card {
                border: 2px solid black !important;
                box-shadow: none !important;
                margin: 0 !important;
                page-break-after: always;
              }
            }
            body {
              font-family: 'Courier New', Courier, monospace;
              margin: 0;
              padding: 20px;
              background: white;
              display: flex;
              flex-direction: column;
              align-items: center;
              color: black;
            }
            .label-card {
              background: white;
              width: 4in;
              height: 6in;
              border: 3px solid black;
              padding: 0.25in;
              margin-bottom: 20px;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              box-shadow: none;
              page-break-after: always;
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
              font-family: sans-serif;
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
          ${labelsHtml}
        </body>
        </html>
      `);
      iframeDoc.close();

      setTimeout(() => {
        if (iframe.contentWindow) {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        }
      }, 500);

      setTimeout(() => {
        document.body.removeChild(iframe);
        setIsPrinting(false);
      }, 6000);
    } catch (e) {
      console.error(e);
      setIsPrinting(false);
    }
  };

  // Calculate total postage cost
  const totalCost = processedOrders.reduce((sum, order) => {
    return sum + (order.selectedRate?.amount || 0);
  }, 0);

  // Group by carrier for the summary badge breakdown
  const carrierBreakdown = processedOrders.reduce((acc: { [key: string]: number }, order) => {
    const carrier = order.selectedRate?.carrierName || 'Unknown Carrier';
    acc[carrier] = (acc[carrier] || 0) + 1;
    return acc;
  }, {});

  const handleCopyTracking = (tracking: string, id: string) => {
    navigator.clipboard.writeText(tracking);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getStrategyLabel = (strategy: string) => {
    switch (strategy) {
      case 'cheapest': return 'Cheapest Rate (Optimized Cost)';
      case 'fastest': return 'Fastest Delivery (Express Courier)';
      case 'buy_shipping': return 'Amazon Buy Shipping Priority';
      case 'shipping_v2': return 'Amazon Ground Shipping v2';
      default: return strategy;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto" id="print-status-modal-backdrop">
      <div 
        className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl flex flex-col my-8 animate-scale-up"
        id="print-status-modal-container"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-5 border-b border-slate-100 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 text-white p-2 rounded-xl shadow-sm">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 tracking-tight flex items-center gap-2">
                Print Spooler dispatched
                <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse uppercase tracking-wider leading-none">
                  Dispatched
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">Bulk shipping labels successfully compiled for thermal printing</p>
            </div>
          </div>
          <button title="Close" 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 hover:bg-slate-100 rounded-lg"
            id="close-print-status-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh] text-slate-700">
          
          {/* Quick Metrics Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="print-status-bento-grid">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center gap-3.5">
              <div className="bg-emerald-500/10 text-emerald-600 p-2.5 rounded-lg shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Labels Generated</span>
                <span className="text-xl font-black text-slate-900 font-mono block">
                  {processedCount} / {processedCount} <span className="text-xs text-emerald-500 font-bold">(100%)</span>
                </span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center gap-3.5">
              <div className="bg-indigo-50/80 text-indigo-600 p-2.5 rounded-lg shrink-0 border border-indigo-100/30">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Active Print Jobs</span>
                <span className="text-xl font-black text-slate-900 font-mono block">
                  {processedCount} <span className="text-xs text-slate-500 font-semibold">Pending Spool</span>
                </span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center gap-3.5">
              <div className="bg-amber-500/10 text-amber-700 p-2.5 rounded-lg shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Total Postage Cost</span>
                <span className="text-xl font-black text-slate-900 font-mono block">
                  {totalCost.toFixed(2)} <span className="text-[10px] text-slate-500 font-sans font-medium uppercase">{currency}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Strategy & Carrier Breakdown */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[9px] uppercase font-extrabold tracking-wider text-slate-400 block">Optimization Strategy</span>
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                {getStrategyLabel(preferredStrategy)}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[9px] uppercase font-extrabold tracking-wider text-slate-400 block mr-1 sm:block md:inline-block">Carriers:</span>
              {Object.entries(carrierBreakdown).map(([carrier, count]) => (
                <span 
                  key={carrier} 
                  className="bg-white border border-slate-200 text-slate-700 text-[10px] font-bold px-2 py-1 rounded-md shadow-xs flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {carrier}: <strong>{count}</strong>
                </span>
              ))}
            </div>
          </div>

          {/* Printer Configuration & Direct Spooling Control */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 space-y-3.5 animate-fade-in" id="printer-config-section">
            <div className="flex items-center justify-between border-b border-slate-200/40 pb-2.5">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-indigo-500 animate-pulse" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Printer Destination & Direct Spool</h4>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                Active Queue Online
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Printer Select */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Select Active Printer Target</label>
                <div className="relative">
                  <select
                    value={selectedPrinter}
                    onChange={(e) => {
                      setSelectedPrinter(e.target.value);
                      localStorage.setItem('orders_deck_preferred_printer', e.target.value);
                    }}
                    className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl py-2.5 pl-3.5 pr-8 appearance-none font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                    id="printer-select-dropdown"
                  >
                    <option value="thermal-zt411">Thermal Label Printer (Zebra ZT411 - 300dpi)</option>
                    <option value="dymo-4xl">Dymo LabelWriter 4XL (Direct Thermal)</option>
                    <option value="laserjet-m404">LaserJet Pro M404 (Warehouse LaserJet)</option>
                    <option value="microsoft-pdf">Adobe PDF / Save to Local Spool</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <span className="text-[8px]">▼</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-end">
                <button title="Print document"
                  onClick={handleNativePrint}
                  disabled={isPrinting}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:from-indigo-400 disabled:to-indigo-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                  id="direct-browser-print-btn"
                >
                  <Printer className="w-4 h-4" />
                  {isPrinting ? 'Spooling Direct Print...' : `Native Browser Print (${processedCount} Labels)`}
                </button>
              </div>
            </div>
          </div>

          {/* Processed Labels Detailed Feed */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <span>Dispatched Labels Registry ({processedOrders.length})</span>
            </h4>
            
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-extrabold border-b border-slate-100">
                      <th className="py-3 px-4">Order Details</th>
                      <th className="py-3 px-4">Shipping Destination</th>
                      <th className="py-3 px-4">Carrier Service</th>
                      <th className="py-3 px-4">Tracking Number</th>
                      <th className="py-3 px-4 text-right">Label Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                    {processedOrders.map((order) => {
                      const isAmz = order.source === 'amazon';
                      return (
                        <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded leading-none shrink-0 ${
                                isAmz 
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                  : 'bg-blue-100 text-blue-800 border border-blue-200'
                              }`}>
                                {order.source === 'amazon' ? 'AMZN' : 'EBAY'}
                              </span>
                              <span className="font-mono text-[11px] font-bold text-slate-900">{order.id}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{order.buyerName}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-slate-800 block text-[11px] truncate max-w-[130px]">
                              {order.shippingAddress.city}, {order.shippingAddress.stateOrRegion}
                            </span>
                            <span className="text-[9px] text-slate-400 block font-mono">
                              {order.shippingAddress.postalCode}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-slate-900 block text-[11px] font-semibold truncate max-w-[130px]">
                              {order.selectedRate?.carrierName}
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              {order.selectedRate?.serviceName}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-700 font-bold">{order.trackingNumber}</span>
                              <button 
                                onClick={() => handleCopyTracking(order.trackingNumber || '', order.id)}
                                className="text-slate-400 hover:text-slate-600 p-0.5 hover:bg-slate-100 rounded transition-colors shrink-0"
                                title="Copy tracking"
                              >
                                {copiedId === order.id ? (
                                  <Check className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-[11px] font-bold text-slate-900">
                            ${(order.selectedRate?.amount || 0).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Spool / System Notification */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-bounce" />
            <div className="text-xs text-amber-800 space-y-1">
              <p className="font-bold">System Thermal Spooler Alert:</p>
              <p className="leading-relaxed">
                A separate 4"x6" paper size direct-thermal print window was dispatched automatically. If your browser blocked the print pop-up, you can safely force re-trigger the printer spool window using the green button below.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between rounded-b-2xl">
          <p className="text-[10px] text-slate-400 font-semibold font-mono uppercase">
            Dispatched on {new Date().toLocaleTimeString()} • Printer ID: THERMAL-M604-QUEUE
          </p>
          <div className="flex items-center gap-3">
            <button title="Close"
              onClick={onClose}
              className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs"
              id="close-print-status-modal-footer-btn"
            >
              Done & Return
            </button>
            <button title="Print document"
              onClick={onOpenSpool}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
              id="retrigger-print-spool-modal-btn"
            >
              <ExternalLink className="w-4 h-4" />
              Open Thermal Print Spool
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
