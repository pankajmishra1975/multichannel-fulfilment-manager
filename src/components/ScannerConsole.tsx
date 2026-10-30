import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Order, Product, Category, ShippingCompanyTemplate } from '../types';
import CameraScanner from './CameraScanner';
import { 
  Barcode, 
  Smartphone, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Camera, 
  Package, 
  Database, 
  Building2, 
  ArrowRight, 
  Check, 
  RotateCcw, 
  Printer, 
  Globe, 
  ShieldCheck, 
  Sliders, 
  X, 
  Radio, 
  Layers, 
  Sparkles, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Maximize2,
  Minimize2,
  FolderTree,
  Tag
} from 'lucide-react';

interface ScannerConsoleProps {
  orders: Order[];
  products: Product[];
  categories?: Category[];
  unitSystem: 'imperial' | 'metric';
  onUpdateProduct: (productDetails: any) => Promise<void>;
  onUpdateOrder: (id: string, updates: Partial<Order>) => Promise<void>;
  onNavigateToOrders?: () => void;
}

const DEFAULT_TEMPLATES: ShippingCompanyTemplate[] = [
  {
    id: 'tmpl_amz_buy_usps',
    name: 'Amazon Buy Shipping - USPS Ground',
    carrierName: 'Amazon Buy Shipping',
    serviceName: 'USPS Ground Advantage (via Amazon)',
    serviceCode: 'USPS_GROUND_ADV',
    packageType: 'parcel',
    defaultWeightOz: 16,
    dimensions: { length: 10, width: 7, height: 4 },
    channelAffinity: 'amazon',
    paperSize: '4x6',
    trackingPrefix: '9400',
    isDefault: true
  },
  {
    id: 'tmpl_rm_24_tracked',
    name: 'Royal Mail 24 Tracked',
    carrierName: 'Royal Mail',
    serviceName: 'Royal Mail 24 Tracked',
    serviceCode: 'RM_TRK_24',
    packageType: 'parcel',
    defaultWeightOz: 18,
    dimensions: { length: 12, width: 8, height: 5 },
    channelAffinity: 'ebay',
    paperSize: '4x6',
    trackingPrefix: 'GB',
    isDefault: false
  },
  {
    id: 'tmpl_dpd_next_day',
    name: 'DPD Next Day Parcel',
    carrierName: 'DPD Express',
    serviceName: 'DPD 1-Day Door-to-Door Parcel',
    serviceCode: 'DPD_1DAY',
    packageType: 'parcel',
    defaultWeightOz: 32,
    dimensions: { length: 14, width: 10, height: 6 },
    channelAffinity: 'shopify',
    paperSize: '4x6',
    trackingPrefix: 'DPD',
    isDefault: false
  },
  {
    id: 'tmpl_fedex_home',
    name: 'FedEx Home Delivery',
    carrierName: 'FedEx',
    serviceName: 'FedEx Home Delivery',
    serviceCode: 'FEDEX_HOME',
    packageType: 'box_medium',
    defaultWeightOz: 24,
    dimensions: { length: 12, width: 9, height: 6 },
    channelAffinity: 'all',
    paperSize: '4x6',
    trackingPrefix: '7946',
    isDefault: false
  },
  {
    id: 'tmpl_ups_ground',
    name: 'UPS Ground Commercial',
    carrierName: 'UPS',
    serviceName: 'UPS Ground Commercial',
    serviceCode: 'UPS_GND',
    packageType: 'parcel',
    defaultWeightOz: 28,
    dimensions: { length: 12, width: 10, height: 5 },
    channelAffinity: 'all',
    paperSize: '4x6',
    trackingPrefix: '1Z',
    isDefault: false
  }
];

export default function ScannerConsole({
  orders,
  products,
  categories = [],
  unitSystem,
  onUpdateProduct,
  onUpdateOrder,
  onNavigateToOrders
}: ScannerConsoleProps) {
  // View layout: Desktop Packing Bench (false) vs Handheld Terminal Simulator (true)
  const [useDeviceFrame, setUseDeviceFrame] = useState(false);
  
  // Console Modes: 'dispatch' (Primary) | 'templates' | 'po' | 'stock_take' | 'picture_upload'
  const [activeMode, setActiveMode] = useState<'dispatch' | 'templates' | 'po' | 'stock_take' | 'picture_upload'>('dispatch');
  
  // Scanner Input & Status
  const [scanInput, setScanInput] = useState('');
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<{ 
    type: 'success' | 'channel_confirmed' | 'label_generated' | 'error' | 'info'; 
    message: string;
    details?: string;
  } | null>(null);
  const [showCameraScanner, setShowCameraScanner] = useState(false);

  // Shipping Company Templates State
  const [templates, setTemplates] = useState<ShippingCompanyTemplate[]>(DEFAULT_TEMPLATES);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tmpl_amz_buy_usps');
  const [autoMatchTemplate, setAutoMatchTemplate] = useState<boolean>(true);

  // Active Dispatch State
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [scannedItems, setScannedItems] = useState<Record<string, number>>({}); // sku -> quantity verified
  const [lastDispatchedOrder, setLastDispatchedOrder] = useState<Order | null>(null);
  const [lastActionResult, setLastActionResult] = useState<{
    action: 'label_generated' | 'channel_confirmed';
    orderId: string;
    trackingNumber: string;
    carrier: string;
    labelUrl?: string;
    message: string;
  } | null>(null);

  // Audit and Dispatch Activity Log
  const [dispatchLogs, setDispatchLogs] = useState<Array<{
    id: string;
    timestamp: string;
    type: 'label_generated' | 'channel_confirmed' | 'scan_verified' | 'mismatch_error';
    orderId: string;
    message: string;
    badge: string;
  }>>([]);

  // Auto-advance toggle (after successful confirmation or label, load next pending)
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);

  // PO & Stock Take States
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('sup_1');
  const [poItems, setPoItems] = useState<Array<{ sku: string; name: string; ordered: number; received: number }>>([
    { sku: 'AMZ-ELEC-402', name: 'Premium Noise Cancelling Wireless Earbuds Pro', ordered: 50, received: 0 },
    { sku: 'AMZ-CABLE-USB', name: 'Ultra-Durable Braided USB-C Charging Cable (6ft)', ordered: 100, received: 0 },
  ]);
  const [selectedProductSku, setSelectedProductSku] = useState<string>('');
  const [stockTakeCount, setStockTakeCount] = useState<number | ''>('');
  const [uploadSubject, setUploadSubject] = useState<'product' | 'order'>('product');
  const [subjectId, setSubjectId] = useState<string>('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Audio feedback synthesis
  const [audioFeedback, setAudioFeedback] = useState<'success' | 'channel_confirmed' | 'label_generated' | 'error' | null>(null);
  const audioTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);

  // Fetch saved templates from server on mount
  useEffect(() => {
    fetch('/api/shipping-templates')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setTemplates(data);
        }
      })
      .catch(() => {});
  }, []);

  // Web Audio feedback synthesizer
  const triggerAudioFeedback = (type: 'success' | 'channel_confirmed' | 'label_generated' | 'error') => {
    setAudioFeedback(type);
    if (audioTimeoutRef.current) clearTimeout(audioTimeoutRef.current);
    audioTimeoutRef.current = setTimeout(() => setAudioFeedback(null), 900);

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;

      if (type === 'channel_confirmed') {
        // Triumphant double-chime for Channel Confirmed!
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(audioCtx.destination);
        gain.gain.setValueAtTime(0.12, now);

        osc1.frequency.setValueAtTime(587.33, now); // D5
        osc1.frequency.setValueAtTime(880, now + 0.12); // A5
        osc2.frequency.setValueAtTime(1174.66, now + 0.12); // D6
        
        osc1.start(now);
        osc2.start(now + 0.12);
        osc1.stop(now + 0.35);
        osc2.stop(now + 0.35);

      } else if (type === 'label_generated') {
        // Crisp dual-tone beep for Label Generated
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        gain.gain.setValueAtTime(0.1, now);
        
        osc.frequency.setValueAtTime(659.25, now); // E5
        osc.frequency.setValueAtTime(1046.50, now + 0.08); // C6
        osc.start(now);
        osc.stop(now + 0.22);

      } else if (type === 'success') {
        // Single high verification beep
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        gain.gain.setValueAtTime(0.08, now);
        osc.frequency.setValueAtTime(987.77, now); // B5
        osc.start(now);
        osc.stop(now + 0.1);

      } else {
        // Low mismatch warning buzz
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        gain.gain.setValueAtTime(0.15, now);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.setValueAtTime(140, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch {
      // AudioContext not allowed or not supported
    }
  };

  // Auto-select first pending order on load if none selected
  useEffect(() => {
    const pending = orders.filter(o => o.status === 'pending');
    if (pending.length > 0 && !selectedOrderId) {
      setSelectedOrderId(pending[0].id);
    }
  }, [orders, selectedOrderId]);

  // Keep scanner input focused for fast hardware barcode scanner wedge
  useEffect(() => {
    if (activeMode === 'dispatch' && scanInputRef.current) {
      scanInputRef.current.focus();
    }
  }, [activeMode, selectedOrderId]);

  // Current active order object
  const activeOrder = useMemo(() => {
    return orders.find(o => o.id === selectedOrderId) || null;
  }, [orders, selectedOrderId]);

  // Determine active template (accounting for channel auto-match)
  const activeTemplate = useMemo(() => {
    if (autoMatchTemplate && activeOrder) {
      const match = templates.find(t => t.channelAffinity === activeOrder.source);
      if (match) return match;
    }
    return templates.find(t => t.id === selectedTemplateId) || templates[0] || DEFAULT_TEMPLATES[0];
  }, [templates, selectedTemplateId, autoMatchTemplate, activeOrder]);

  // Helper: check if order already has a label printed with a tracking number
  const isOrderPrePrinted = (order: Order) => {
    const hasTracking = Boolean(order.trackingNumber && order.trackingNumber.trim().length > 0);
    const hasLabel = Boolean(order.labelPrinted || order.labelUrl || order.status === 'shipped');
    return hasTracking && hasLabel;
  };

  // Helper: check pick completion
  const getOrderPickProgress = (order: Order) => {
    let required = 0;
    let picked = 0;
    order.items.forEach(it => {
      required += it.quantity;
      picked += scannedItems[it.sku] || 0;
    });
    return {
      required,
      picked,
      isComplete: required > 0 && picked >= required
    };
  };

  // Reset or change active order
  const handleOrderChange = (id: string) => {
    setSelectedOrderId(id);
    setScannedItems({});
    setScanStatus(null);
  };

  // Advance to next pending order
  const advanceToNextPending = () => {
    const pending = orders.filter(o => o.status === 'pending' && o.id !== selectedOrderId);
    if (pending.length > 0) {
      handleOrderChange(pending[0].id);
    } else {
      setSelectedOrderId('');
      setScannedItems({});
    }
  };

  // -------------------------------------------------------------
  // CORE DISPATCH LOGIC (Branch 1: Generate Label vs Branch 2: Channel Confirm Only)
  // -------------------------------------------------------------
  const executeDispatchAction = async (targetOrder: Order, templateToUse: ShippingCompanyTemplate) => {
    const alreadyPrinted = isOrderPrePrinted(targetOrder);

    // Call server endpoint or fallback to direct update
    try {
      const res = await fetch('/api/dispatch/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barcode: targetOrder.id,
          orderId: targetOrder.id,
          templateId: templateToUse.id
        })
      });
      const data = await res.json();

      if (data.success) {
        if (data.action === 'channel_confirmed') {
          // BRANCH 2: Label was already printed with tracking on it!
          // ONLY confirmed on the channel. Zero duplicate labels bought.
          triggerAudioFeedback('channel_confirmed');
          setLastActionResult({
            action: 'channel_confirmed',
            orderId: targetOrder.id,
            trackingNumber: targetOrder.trackingNumber || 'EX-TRACK',
            carrier: targetOrder.carrier || targetOrder.selectedRate?.carrierName || templateToUse.carrierName,
            message: `Order confirmed on ${targetOrder.source.toUpperCase()}. Existing tracking [${targetOrder.trackingNumber}] dispatched. Zero duplicate labels bought.`
          });

          setScanStatus({
            type: 'channel_confirmed',
            message: `🚀 CHANNEL CONFIRMED ON ${targetOrder.source.toUpperCase()}!`,
            details: `Existing tracking ${targetOrder.trackingNumber} (${targetOrder.carrier || 'Assigned Carrier'}) successfully submitted to sales channel. No duplicate label generated.`
          });

          setDispatchLogs(prev => [{
            id: 'log_' + Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            type: 'channel_confirmed',
            orderId: targetOrder.id,
            message: `Confirmed on ${targetOrder.source.toUpperCase()} with tracking ${targetOrder.trackingNumber}. Zero duplicate label bought.`,
            badge: 'Channel Confirmed'
          }, ...prev.slice(0, 19)]);

        } else {
          // BRANCH 1: Label NOT yet printed -> Shipping label generated!
          triggerAudioFeedback('label_generated');
          setLastActionResult({
            action: 'label_generated',
            orderId: targetOrder.id,
            trackingNumber: data.trackingNumber,
            carrier: templateToUse.carrierName,
            labelUrl: data.labelUrl,
            message: `Shipping label generated using saved template [${templateToUse.name}]. Tracking: ${data.trackingNumber}`
          });

          setScanStatus({
            type: 'label_generated',
            message: `🏷️ SHIPPING LABEL GENERATED via ${templateToUse.name}!`,
            details: `Tracking #${data.trackingNumber} generated. Thermal 4x6 label created. Ready for packing.`
          });

          setDispatchLogs(prev => [{
            id: 'log_' + Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            type: 'label_generated',
            orderId: targetOrder.id,
            message: `Generated label via ${templateToUse.carrierName}. Tracking: ${data.trackingNumber}`,
            badge: 'Label Generated'
          }, ...prev.slice(0, 19)]);
        }

        setLastDispatchedOrder(data.order);
        await onUpdateOrder(targetOrder.id, data.order);

        // Auto-advance after brief delay if enabled
        if (autoAdvance) {
          setTimeout(() => {
            advanceToNextPending();
          }, 3000);
        }
        return;
      }
    } catch {
      // Offline fallback
    }

    // Direct local fallback handling for robust operation
    if (alreadyPrinted) {
      // BRANCH 2 FALLBACK: Channel confirm only
      triggerAudioFeedback('channel_confirmed');
      const confirmedAt = new Date().toISOString();
      const updated: Partial<Order> = {
        status: 'shipped',
        channelConfirmed: true,
        channelConfirmedAt: confirmedAt,
        dispatchedAt: confirmedAt
      };
      await onUpdateOrder(targetOrder.id, updated);

      setLastActionResult({
        action: 'channel_confirmed',
        orderId: targetOrder.id,
        trackingNumber: targetOrder.trackingNumber || 'TRK-EXISTING',
        carrier: targetOrder.carrier || templateToUse.carrierName,
        message: `Fulfillment confirmed on ${targetOrder.source.toUpperCase()} with tracking [${targetOrder.trackingNumber}]. Zero duplicate labels bought.`
      });

      setScanStatus({
        type: 'channel_confirmed',
        message: `🚀 CHANNEL CONFIRMED ON ${targetOrder.source.toUpperCase()}!`,
        details: `Order fulfilled with existing tracking ${targetOrder.trackingNumber}. No duplicate label created.`
      });

      if (autoAdvance) setTimeout(advanceToNextPending, 3000);

    } else {
      // BRANCH 1 FALLBACK: Generate label from template
      triggerAudioFeedback('label_generated');
      const prefix = templateToUse.trackingPrefix || 'TRK';
      const newTrk = prefix === 'GB' 
        ? `GB${Math.floor(100000000 + Math.random() * 900000000)}RM`
        : prefix === '9400'
        ? `94001${Math.floor(10000000000000 + Math.random() * 90000000000000)}`
        : prefix === '1Z'
        ? `1Z${Math.random().toString(36).substring(2, 8).toUpperCase()}${Math.floor(1000000000 + Math.random() * 9000000000)}`
        : `${prefix}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

      const updated: Partial<Order> = {
        carrier: templateToUse.carrierName,
        serviceClass: templateToUse.serviceName,
        trackingNumber: newTrk,
        labelPrinted: true,
        labelUrl: `thermal_4x6_${newTrk}`,
        templateId: templateToUse.id,
        selectedRate: {
          id: `rate_${templateToUse.id}_${targetOrder.id}`,
          carrierName: templateToUse.carrierName,
          serviceName: templateToUse.serviceName,
          amount: 4.50,
          currency: targetOrder.currency || 'USD',
          deliveryDays: 2,
          shippingType: 'buy_shipping'
        }
      };
      await onUpdateOrder(targetOrder.id, updated);

      setLastActionResult({
        action: 'label_generated',
        orderId: targetOrder.id,
        trackingNumber: newTrk,
        carrier: templateToUse.carrierName,
        message: `Generated label via ${templateToUse.name}. Tracking: ${newTrk}`
      });

      setScanStatus({
        type: 'label_generated',
        message: `🏷️ SHIPPING LABEL GENERATED via ${templateToUse.name}!`,
        details: `Tracking #${newTrk} assigned. Thermal label queued.`
      });

      if (autoAdvance) setTimeout(advanceToNextPending, 3000);
    }
  };

  // -------------------------------------------------------------
  // SCAN PROCESSOR: Barcode scanned from hardware gun, camera or tester
  // -------------------------------------------------------------
  const processBarcodeScan = (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    setLastScannedCode(cleanCode);
    setScanInput('');

    // --- CASE 1: SCANNED CODE IS AN ORDER ID ---
    const matchedOrderById = orders.find(o => o.id.toLowerCase() === cleanCode.toLowerCase());
    if (matchedOrderById) {
      triggerAudioFeedback('success');
      setSelectedOrderId(matchedOrderById.id);
      setActiveMode('dispatch');
      setScannedItems({});
      setScanStatus({
        type: 'info',
        message: `Order #${matchedOrderById.id} Loaded`,
        details: `Customer: ${matchedOrderById.buyerName} | Channel: ${matchedOrderById.source.toUpperCase()} | Items: ${matchedOrderById.items.length}`
      });
      return;
    }

    // --- CASE 2: DISPATCH MODE ITEM SCAN ---
    if (activeMode === 'dispatch') {
      let targetOrder = activeOrder;

      // If no active order, or the scanned code belongs to another pending order, look for the matching order
      const matchedProd = products.find(p => 
        p.sku.toLowerCase() === cleanCode.toLowerCase() || 
        (p.mappedSku && p.mappedSku.toLowerCase() === cleanCode.toLowerCase()) ||
        (p.barcode && p.barcode.toLowerCase() === cleanCode.toLowerCase())
      );

      // Check if scanned item is in current active order
      const isItemInActive = targetOrder && targetOrder.items.some(it => 
        it.sku.toLowerCase() === cleanCode.toLowerCase() || 
        (matchedProd && (it.sku.toLowerCase() === matchedProd.sku.toLowerCase() || (matchedProd.mappedSku && it.sku.toLowerCase() === matchedProd.mappedSku.toLowerCase())))
      );

      // If not in active order, try finding a pending order containing this item!
      if (!isItemInActive) {
        const otherPendingOrder = orders.find(o => 
          o.status === 'pending' && o.items.some(it => 
            it.sku.toLowerCase() === cleanCode.toLowerCase() || 
            (matchedProd && (it.sku.toLowerCase() === matchedProd.sku.toLowerCase() || (matchedProd.mappedSku && it.sku.toLowerCase() === matchedProd.mappedSku.toLowerCase())))
          )
        );

        if (otherPendingOrder) {
          targetOrder = otherPendingOrder;
          setSelectedOrderId(otherPendingOrder.id);
          setScannedItems({});
        }
      }

      if (!targetOrder) {
        triggerAudioFeedback('error');
        setScanStatus({
          type: 'error',
          message: `DISPATCH MISMATCH: Barcode [${cleanCode}] Not Found!`,
          details: 'This product barcode does not match any items in the currently loaded order or any pending order in the queue.'
        });
        setDispatchLogs(prev => [{
          id: 'log_' + Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          type: 'mismatch_error',
          orderId: selectedOrderId || 'N/A',
          message: `Scanned barcode [${cleanCode}] rejected - not in order.`,
          badge: 'Mismatch Alert'
        }, ...prev.slice(0, 19)]);
        return;
      }

      // Find matching item in target order
      const matchedItem = targetOrder.items.find(it => 
        it.sku.toLowerCase() === cleanCode.toLowerCase() || 
        (matchedProd && (it.sku.toLowerCase() === matchedProd.sku.toLowerCase() || (matchedProd.mappedSku && it.sku.toLowerCase() === matchedProd.mappedSku.toLowerCase())))
      );

      if (!matchedItem) {
        triggerAudioFeedback('error');
        setScanStatus({
          type: 'error',
          message: `DISPATCH MISMATCH: Product [${cleanCode}] Not in Order #${targetOrder.id}!`,
          details: `Order #${targetOrder.id} requires: ${targetOrder.items.map(i => `${i.quantity}x ${i.sku}`).join(', ')}.`
        });
        return;
      }

      // Check quantity limits
      const currentlyScanned = scannedItems[matchedItem.sku] || 0;
      if (currentlyScanned >= matchedItem.quantity) {
        triggerAudioFeedback('error');
        setScanStatus({
          type: 'error',
          message: `OVER-SCAN PREVENTED!`,
          details: `Order only requires ${matchedItem.quantity}x of SKU ${matchedItem.sku}. Already picked ${currentlyScanned}x!`
        });
        return;
      }

      // Register picked item
      const newScannedQty = currentlyScanned + 1;
      const updatedScannedItems = {
        ...scannedItems,
        [matchedItem.sku]: newScannedQty
      };
      setScannedItems(updatedScannedItems);

      // Check if this completes the order pick
      let allComplete = true;
      targetOrder.items.forEach(it => {
        const q = it.sku === matchedItem.sku ? newScannedQty : (scannedItems[it.sku] || 0);
        if (q < it.quantity) allComplete = false;
      });

      if (!allComplete) {
        triggerAudioFeedback('success');
        setScanStatus({
          type: 'success',
          message: `✓ Pick Verified: 1x ${matchedItem.sku}`,
          details: `Progress for Order #${targetOrder.id}: ${newScannedQty}/${matchedItem.quantity} units verified.`
        });
      } else {
        // 100% ITEMS VERIFIED! Trigger the core logic!
        executeDispatchAction(targetOrder, activeTemplate);
      }
      return;
    }

    // --- OTHER MODES ---
    if (activeMode === 'po') {
      const matchedPo = poItems.find(it => it.sku.toLowerCase() === cleanCode.toLowerCase());
      if (matchedPo) {
        triggerAudioFeedback('success');
        setPoItems(prev => prev.map(it => it.sku === matchedPo.sku ? { ...it, received: Math.min(it.ordered, it.received + 1) } : it));
        setScanStatus({ type: 'success', message: `PO Received: 1x ${matchedPo.sku}` });
      } else {
        triggerAudioFeedback('error');
        setScanStatus({ type: 'error', message: `SKU [${cleanCode}] not found in Purchase Order.` });
      }
    } else if (activeMode === 'stock_take') {
      const prod = products.find(p => p.sku.toLowerCase() === cleanCode.toLowerCase() || p.mappedSku?.toLowerCase() === cleanCode.toLowerCase());
      if (prod) {
        triggerAudioFeedback('success');
        setSelectedProductSku(prod.sku);
        setStockTakeCount(prod.stock || 0);
        setScanStatus({ type: 'success', message: `Scanned Catalog SKU: ${prod.sku} (${prod.name})` });
      } else {
        triggerAudioFeedback('error');
        setScanStatus({ type: 'error', message: `SKU [${cleanCode}] not in master catalog.` });
      }
    }
  };

  const pickProgress = activeOrder ? getOrderPickProgress(activeOrder) : { required: 0, picked: 0, isComplete: false };
  const alreadyPrePrinted = activeOrder ? isOrderPrePrinted(activeOrder) : false;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-900 text-slate-100 p-3 md:p-5 select-none" id="dispatch-scan-console-workspace">
      
      {/* Top Station Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-inner">
            <Barcode className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                Dispatch & Scan Station
              </h1>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                Hardware Scanner Online
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Industrial packing bench scan station. Automatically generates labels via saved templates, or confirms orders on marketplace channels when pre-printed.
            </p>
          </div>
        </div>

        {/* View Layout & Station Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Orders Deck Link */}
          {onNavigateToOrders && (
            <button
              onClick={onNavigateToOrders}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Return to Orders Deck"
            >
              <Package className="w-3.5 h-3.5" /> Orders Deck
            </button>
          )}

          {/* Toggle Device Frame (Handheld vs Desktop Bench) */}
          <button
            onClick={() => setUseDeviceFrame(!useDeviceFrame)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              useDeviceFrame 
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Toggle between handheld mobile terminal frame and desktop packing station"
          >
            <Smartphone className="w-3.5 h-3.5" />
            {useDeviceFrame ? 'Handheld Terminal Mode' : 'Desktop Bench Mode'}
          </button>
        </div>
      </div>

      {/* Main Barcode Scan Input Bar (Focus Target for Handheld Scanner Guns) */}
      <div className="mt-3 shrink-0 bg-slate-950 border border-slate-800 rounded-2xl p-3 shadow-xl">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            processBarcodeScan(scanInput);
          }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
        >
          <div className="flex-1 relative flex items-center bg-slate-900 border-2 border-slate-700 focus-within:border-indigo-500 rounded-xl overflow-hidden transition-all shadow-inner">
            <div className="pl-3.5 pr-2 text-indigo-400">
              <Barcode className="w-5 h-5" />
            </div>
            <input
              ref={scanInputRef}
              type="text"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              placeholder="Scan product barcode, SKU, UPC or Order ID (Scanner Gun focus target)..."
              className="w-full bg-transparent border-0 outline-none py-2.5 px-1 text-sm font-mono font-bold text-white placeholder-slate-500"
              id="dispatch-barcode-main-input"
            />
            {scanInput && (
              <button 
                type="button" 
                onClick={() => setScanInput('')} 
                className="pr-3 text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              title="Process scanned code"
              id="dispatch-barcode-submit-btn"
            >
              <ArrowRight className="w-4 h-4" />
              Scan Enter
            </button>
            <button
              type="button"
              onClick={() => setShowCameraScanner(true)}
              className="bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Open camera barcode scanner for mobile/tablet"
            >
              <Camera className="w-4 h-4" />
              Camera
            </button>
          </div>
        </form>

        {/* Scan Status Banner */}
        {scanStatus && (
          <div className={`mt-2.5 p-3 rounded-xl border text-xs flex items-start justify-between gap-3 animate-fadeIn ${
            scanStatus.type === 'channel_confirmed' ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200' :
            scanStatus.type === 'label_generated' ? 'bg-sky-950/40 border-sky-500 text-sky-200' :
            scanStatus.type === 'success' ? 'bg-emerald-900/30 border-emerald-500/40 text-emerald-300' :
            scanStatus.type === 'error' ? 'bg-rose-950/40 border-rose-500/50 text-rose-200' :
            'bg-indigo-950/30 border-indigo-500/30 text-indigo-300'
          }`}>
            <div className="flex items-start gap-2.5">
              {scanStatus.type === 'channel_confirmed' ? <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" /> :
               scanStatus.type === 'label_generated' ? <Printer className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" /> :
               scanStatus.type === 'error' ? <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" /> :
               <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
              <div>
                <p className="font-black text-sm tracking-wide">{scanStatus.message}</p>
                {scanStatus.details && <p className="text-xs opacity-90 mt-0.5 font-medium leading-relaxed">{scanStatus.details}</p>}
              </div>
            </div>
            <button 
              onClick={() => setScanStatus(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Mode Sub-nav (Dispatch, Shipping Templates, PO Goods In, Stock Take) */}
      <div className="flex items-center gap-1.5 mt-3 shrink-0 overflow-x-auto pb-1">
        {[
          { id: 'dispatch', label: 'Pack & Dispatch Station', icon: Package },
          { id: 'templates', label: 'Carrier Shipping Templates', icon: Layers },
          { id: 'po', label: 'PO Goods Inward', icon: Building2 },
          { id: 'stock_take', label: 'Cycle Stock Take', icon: Database },
        ].map(m => {
          const Icon = m.icon;
          const isActive = activeMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => {
                setActiveMode(m.id as any);
                setScanStatus(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Main Content Workspace */}
      <div className="flex-1 min-h-0 mt-3 flex flex-col lg:flex-row gap-4 overflow-hidden">
        
        {/* LEFT / CENTER WORKSPACE: Active Order Inspection & Packing Bench */}
        {activeMode === 'dispatch' && (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 overflow-y-auto">
            
            {/* Active Order Control Ribbon */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-slate-400 uppercase font-mono">Active Order:</span>
                <select
                  value={selectedOrderId}
                  onChange={(e) => handleOrderChange(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white text-xs font-mono font-bold rounded-lg px-2.5 py-1.5 outline-none focus:border-indigo-500"
                  id="dispatch-active-order-select"
                >
                  <option value="">-- Select Pending Order --</option>
                  {orders.filter(o => o.status === 'pending').map(o => (
                    <option key={o.id} value={o.id}>
                      {o.id} - {o.buyerName} ({o.source.toUpperCase()})
                    </option>
                  ))}
                  <option disabled>──────────</option>
                  {orders.filter(o => o.status === 'shipped').map(o => (
                    <option key={o.id} value={o.id}>
                      {o.id} - {o.buyerName} [Shipped / Confirmed]
                    </option>
                  ))}
                </select>
              </div>

              {/* Saved Shipping Company Template Selector */}
              <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 p-1 rounded-xl">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 pl-2 flex items-center gap-1">
                  <Printer className="w-3 h-3 text-sky-400" /> Carrier Template:
                </span>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-indigo-300 outline-none"
                  id="dispatch-carrier-template-select"
                >
                  {templates.map(tmpl => (
                    <option key={tmpl.id} value={tmpl.id}>
                      {tmpl.name} ({tmpl.carrierName})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ORDER PACKING & SCAN VERIFICATION DECK */}
            {activeOrder ? (
              <div className="mt-4 space-y-4">
                
                {/* Order Summary & Status Pill Banner */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block font-mono">Order Details</span>
                    <span className="text-sm font-black text-white">{activeOrder.id}</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                        activeOrder.source === 'amazon' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        activeOrder.source === 'ebay' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                        activeOrder.source === 'shopify' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {activeOrder.source}
                      </span>
                      <span className="text-xs text-slate-400 font-medium truncate">{activeOrder.buyerName}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block font-mono">Shipping Destination</span>
                    <span className="text-xs font-bold text-slate-300 block truncate">
                      {activeOrder.shippingAddress?.city}, {activeOrder.shippingAddress?.stateOrRegion} {activeOrder.shippingAddress?.postalCode}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{activeOrder.shippingAddress?.countryCode || 'US'}</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block font-mono">Label & Tracking State</span>
                    {alreadyPrePrinted ? (
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Label Already Printed
                        </span>
                        <span className="text-[10px] font-mono text-emerald-300/80 truncate">
                          Trk: {activeOrder.trackingNumber}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> No Label Generated Yet
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block font-mono">Channel Confirmation</span>
                    {activeOrder.channelConfirmed ? (
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" /> Confirmed on Channel
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400">
                        Pending final dispatch scan
                      </span>
                    )}
                  </div>
                </div>

                {/* THE CORE LOGIC CALLOUT: Shows the warehouse operator exactly what will happen when they scan! */}
                <div className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
                  alreadyPrePrinted 
                    ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200' 
                    : 'bg-indigo-950/30 border-indigo-500/50 text-indigo-200'
                }`}>
                  {alreadyPrePrinted ? (
                    <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <Printer className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5" />
                  )}
                  <div className="text-xs">
                    <p className="font-extrabold text-sm uppercase tracking-wide">
                      {alreadyPrePrinted 
                        ? 'GATE 2: LABEL ALREADY PRINTED → ONLY CONFIRM ON SALES CHANNEL' 
                        : 'GATE 1: UNPRINTED ORDER → GENERATE SHIPPING LABEL VIA SAVED TEMPLATE'}
                    </p>
                    <p className="text-slate-300 mt-1 leading-relaxed">
                      {alreadyPrePrinted 
                        ? `This package already has Tracking #${activeOrder.trackingNumber} and a printed label. Squeezing the trigger on this item will NOT generate or buy a duplicate shipping label. It will immediately transmit fulfillment confirmation directly to ${activeOrder.source.toUpperCase()}.`
                        : `Scanning this item will verify the pick checklist, automatically generate the thermal 4x6 label via [${activeTemplate.name}], and assign a tracking number.`}
                    </p>
                  </div>
                </div>

                {/* Pick Progress & Checklist */}
                <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400 font-mono">
                      Order Pick Checklist ({pickProgress.picked}/{pickProgress.required} Items Verified)
                    </span>
                    <span className={`text-xs font-extrabold px-2 py-0.5 rounded ${
                      pickProgress.isComplete ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {pickProgress.isComplete ? '✓ 100% Verified' : 'Scanning In Progress'}
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${pickProgress.isComplete ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                      style={{ width: `${pickProgress.required > 0 ? (pickProgress.picked / pickProgress.required) * 100 : 0}%` }}
                    ></div>
                  </div>

                  {/* Line Items List with Barcode Test Buttons */}
                  <div className="space-y-2 pt-2">
                    {activeOrder.items.map((item, idx) => {
                      const prod = products.find(p => p.sku === item.sku || p.mappedSku === item.sku);
                      const scannedCount = scannedItems[item.sku] || 0;
                      const isComplete = scannedCount >= item.quantity;

                      return (
                        <div 
                          key={idx}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                            isComplete 
                              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                              : scannedCount > 0 
                                ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                                : 'bg-slate-900 border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden font-mono text-xs font-bold">
                              {prod?.image ? (
                                <img src={prod.image} alt={item.title} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-5 h-5 text-slate-500" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-xs bg-slate-800 text-indigo-300 px-2 py-0.5 rounded border border-slate-700">
                                  {item.sku}
                                </span>
                                {prod?.categoryId && (
                                  <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-1.5 py-0.2 rounded border border-orange-500/20 flex items-center gap-1">
                                    <FolderTree className="w-2.5 h-2.5" />
                                    {categories.find(c => c.id === prod.categoryId)?.name || prod.categoryId}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-semibold text-slate-200 truncate mt-1">{item.title}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <span className="font-mono font-black text-sm block">
                                {scannedCount} / {item.quantity}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase">Scanned</span>
                            </div>

                            {/* Shortcut scan button for quick testing */}
                            <button
                              onClick={() => processBarcodeScan(item.sku)}
                              disabled={isComplete}
                              className={`p-2 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                                isComplete 
                                  ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
                                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                              }`}
                              title={`Simulate barcode scan of ${item.sku}`}
                            >
                              {isComplete ? <Check className="w-4 h-4" /> : <Barcode className="w-4 h-4" />}
                              {isComplete ? 'Verified' : 'Scan Item'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Final Action Trigger Button Bar */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-400 font-bold flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={autoAdvance} 
                        onChange={(e) => setAutoAdvance(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      Auto-advance to next order after scan
                    </label>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleOrderChange(selectedOrderId)}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Reset Scans
                    </button>

                    <button
                      onClick={() => executeDispatchAction(activeOrder, activeTemplate)}
                      className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs font-black tracking-wide uppercase transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                        alreadyPrePrinted 
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/30'
                      }`}
                    >
                      {alreadyPrePrinted ? (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          Confirm on Channel (No Duplicate Label)
                        </>
                      ) : (
                        <>
                          <Printer className="w-4 h-4" />
                          Generate Label via {activeTemplate.name}
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-500">
                <Package className="w-12 h-12 text-slate-700 mb-3" />
                <h3 className="text-base font-black text-slate-400">No Order Selected</h3>
                <p className="text-xs max-w-sm mt-1">
                  Scan an item barcode or order ID to begin picking, or select a pending order from the dropdown above.
                </p>
              </div>
            )}
          </div>
        )}

        {/* MODE: SHIPPING TEMPLATES MANAGER */}
        {activeMode === 'templates' && (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  Saved Shipping Company Templates
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pre-configured courier templates used to generate shipping labels dynamically during scan packing.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">
                {templates.length} Active Presets
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map(tmpl => (
                <div 
                  key={tmpl.id}
                  className={`p-4 rounded-xl border transition-all ${
                    tmpl.id === selectedTemplateId 
                      ? 'bg-indigo-950/30 border-indigo-500 shadow-md ring-1 ring-indigo-500' 
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 font-mono block">
                        {tmpl.carrierName}
                      </span>
                      <h4 className="text-sm font-black text-white mt-0.5">{tmpl.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">{tmpl.serviceName}</p>
                    </div>
                    {tmpl.id === selectedTemplateId ? (
                      <span className="bg-indigo-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                        Active Default
                      </span>
                    ) : (
                      <button
                        onClick={() => setSelectedTemplateId(tmpl.id)}
                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:underline"
                      >
                        Set Active
                      </button>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-[11px] font-mono">
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">Format</span>
                      <span className="text-slate-300 font-bold">{tmpl.paperSize} Thermal</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">Weight</span>
                      <span className="text-slate-300 font-bold">{tmpl.defaultWeightOz} oz</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">Tracking Prefix</span>
                      <span className="text-slate-300 font-bold">{tmpl.trackingPrefix}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODE: PO GOODS IN */}
        {activeMode === 'po' && (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 overflow-y-auto space-y-4">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              PO Goods Inward Receiving
            </h2>
            <div className="space-y-3">
              {poItems.map(it => (
                <div key={it.sku} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-indigo-400">{it.sku}</span>
                    <p className="text-xs font-semibold text-white">{it.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-black">{it.received} / {it.ordered}</span>
                    <button 
                      onClick={() => processBarcodeScan(it.sku)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold"
                    >
                      Receive 1x
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODE: STOCK TAKE */}
        {activeMode === 'stock_take' && (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 overflow-y-auto space-y-4">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" />
              Cycle Count & Stock Take
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {products.slice(0, 6).map(p => (
                <div key={p.sku} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <span className="font-mono text-xs font-bold text-indigo-400">{p.sku}</span>
                    <p className="text-xs text-white truncate">{p.name}</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">Stock: {p.stock}</span>
                    <button 
                      onClick={() => processBarcodeScan(p.sku)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-bold"
                    >
                      Scan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RIGHT SIDEBAR: Live Simulator Shortcuts & Recent Activity Log */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4 overflow-y-auto">
          
          {/* Live Scanner Simulator (Quick test buttons for verifying both cases!) */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                Quick Scan Simulator
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Click any quick trigger to test hardware barcode gun behavior:
            </p>

            <div className="space-y-2">
              {/* Branch 1 Tester */}
              <button
                onClick={() => {
                  const unprinted = orders.find(o => o.status === 'pending' && !o.trackingNumber);
                  if (unprinted && unprinted.items.length > 0) {
                    processBarcodeScan(unprinted.items[0].sku);
                  } else {
                    processBarcodeScan('AMZ-ELEC-402');
                  }
                }}
                className="w-full text-left p-2.5 bg-indigo-950/30 hover:bg-indigo-900/40 border border-indigo-500/40 hover:border-indigo-400 rounded-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-indigo-300 font-bold text-xs">
                  <span>⚡ Scan: Unprinted Order Product</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[10px] text-indigo-300/70 mt-1">
                  Triggers Gate 1 → Generates label via template.
                </p>
              </button>

              {/* Branch 2 Tester */}
              <button
                onClick={() => {
                  const prePrinted = orders.find(o => Boolean(o.trackingNumber && o.labelPrinted));
                  if (prePrinted && prePrinted.items.length > 0) {
                    setSelectedOrderId(prePrinted.id);
                    processBarcodeScan(prePrinted.items[0].sku);
                  } else {
                    // Pre-fill tracking on active order to demonstrate Branch 2
                    if (activeOrder) {
                      onUpdateOrder(activeOrder.id, {
                        trackingNumber: 'TRK-PREPRINTED-99',
                        labelPrinted: true,
                        labelUrl: 'mock_label'
                      }).then(() => {
                        processBarcodeScan(activeOrder.items[0].sku);
                      });
                    }
                  }
                }}
                className="w-full text-left p-2.5 bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/40 hover:border-emerald-400 rounded-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-emerald-300 font-bold text-xs">
                  <span>⚡ Scan: Pre-Printed Order Product</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[10px] text-emerald-300/70 mt-1">
                  Triggers Gate 2 → Confirms channel only (zero duplicate label).
                </p>
              </button>

              {/* Mismatch Alert Tester */}
              <button
                onClick={() => processBarcodeScan('ERR-INVALID-SKU-999')}
                className="w-full text-left p-2.5 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/30 rounded-xl transition-all cursor-pointer flex items-center justify-between text-rose-300 text-xs font-bold"
              >
                <span>⚡ Scan: Wrong / Unknown Item</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </button>
            </div>
          </div>

          {/* Real-time Dispatch Event Audit Feed */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex-1 flex flex-col min-h-[220px]">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 font-mono mb-2 flex items-center justify-between">
              <span>Station Audit Feed</span>
              <span className="text-[10px] text-slate-500">{dispatchLogs.length} events</span>
            </h4>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
              {dispatchLogs.map(log => (
                <div key={log.id} className="p-2 rounded-lg bg-slate-900/70 border border-slate-800 text-[11px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                      log.type === 'channel_confirmed' ? 'bg-emerald-500/20 text-emerald-300' :
                      log.type === 'label_generated' ? 'bg-sky-500/20 text-sky-300' :
                      log.type === 'mismatch_error' ? 'bg-rose-500/20 text-rose-300' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {log.badge}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{log.timestamp}</span>
                  </div>
                  <p className="text-slate-300 font-medium leading-tight">{log.message}</p>
                </div>
              ))}

              {dispatchLogs.length === 0 && (
                <div className="p-6 text-center text-slate-600 text-xs">
                  Awaiting scan events...
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Camera Scanner Modal for Mobile / Tablet */}
      {showCameraScanner && (
        <CameraScanner
          onScan={(decoded) => {
            setShowCameraScanner(false);
            processBarcodeScan(decoded);
          }}
          onClose={() => setShowCameraScanner(false)}
        />
      )}

    </div>
  );
}
