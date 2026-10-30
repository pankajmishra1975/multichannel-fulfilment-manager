import React, { useState, useEffect, useMemo } from 'react';
import { Order, ApiCredentials, ActivityLog, CarrierRate, Product, Category } from './types';
import OrdersList from './components/OrdersList';
import ActiveOrderDetails from './components/ActiveOrderDetails';
import CredentialsModal from './components/CredentialsModal';
import ProductsManager from './components/ProductsManager';
import PrintStatusModal from './components/PrintStatusModal';
import DashboardView from './components/DashboardView';
import InventoryView from './components/InventoryView';
import ShippingView from './components/ShippingView';
import IntegrationsView from './components/IntegrationsView';
import ReportsView from './components/ReportsView';
import AiProductsDashboardView from './components/AiProductsDashboardView';
import AiOrdersDashboardView from './components/AiOrdersDashboardView';
import SettingsView from './components/SettingsView';
import EmailSettingsView from './components/EmailSettingsView';
import WmsView from './components/WmsView';
import PrinterSettingsView from './components/PrinterSettingsView';
import LoginView from './components/LoginView';
import ProfitCalculatorView from './components/ProfitCalculatorView';
import UserGuidesView from './components/UserGuidesView';
import CrmView from "./components/CrmView";
import TemplateDesigner from './components/TemplateDesigner';
import SubscriptionAdminCentre from './components/SubscriptionAdminCentre';
import SuperAdminControlView from './components/SuperAdminControlView';
import SuperAdminApp from './SuperAdminApp';
import ScannerConsole from './components/ScannerConsole';
import {
  Package,
  Boxes,
  Truck,
  TrendingUp,
  Settings,
  Link as LinkIcon,
  Home,
  RefreshCw,
  Search,
  Bell,
  LogOut,
  AlertCircle,
  LayoutDashboard,
  Printer,
  FileText,
  Palette,
  Calculator,
  MessageSquare,
  BookOpen,
  X,
  Plus,
  Mail, Barcode
, Activity, Wifi, Terminal, ShoppingBag, Database, Building2, Layers, Globe, Users, Coins, Lock, Sparkles, Shield, AlertTriangle} from 'lucide-react';

export default function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [credentials, setCredentials] = useState<ApiCredentials>({
    amazonSellerId: '',
    amazonClientId: '',
    amazonClientSecret: '',
    amazonRefreshToken: '',
    ebayClientId: '',
    ebayClientSecret: '',
    ebayRefreshToken: '',
    isSandbox: true,
  });
  
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isCredentialsOpen, setIsCredentialsOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkStrategy, setBulkStrategy] = useState<'cheapest' | 'fastest' | 'buy_shipping' | 'shipping_v2'>('cheapest');
  
  // Print status confirmation modal state
  const [printStatusData, setPrintStatusData] = useState<{
    processedCount: number;
    processedOrders: any[];
    preferredStrategy: string;
  } | null>(null);
  
  // Products and Inventory states
  const [activeTab, setActiveTab] = useState<string | null>('reports');
  const [openTabs, setOpenTabs] = useState<string[]>(['dashboard', 'reports']);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([
    { id: 'cat_electronics', name: 'Electronics', alertDays: [30] },
    { id: 'cat_food', name: 'Food & Fresh Produce', alertDays: [21, 14] },
    { id: 'cat_beverages', name: 'Beverages & Energy Drinks', alertDays: [90, 60, 30] },
    { id: 'cat_toys', name: 'Toys', alertDays: [30] },
    { id: 'cat_home', name: 'Home & Garden', alertDays: [30] },
  ]);
  const [inventoryThreshold, setInventoryThreshold] = useState<number>(5);

  // Subscription synchronization state
  const [lockedSubFeatures, setLockedSubFeatures] = useState<string[]>([]);
  const [activePlanName, setActivePlanName] = useState<string>('');

  const syncSubscriptionLocks = () => {
    try {
      const subActiveStr = localStorage.getItem('sub_active');
      const subPlansStr = localStorage.getItem('sub_plans');
      if (subActiveStr && subPlansStr) {
        const activeSub = JSON.parse(subActiveStr);
        const plans = JSON.parse(subPlansStr);
        const plan = plans.find((p: any) => p.id === activeSub.planId);
        if (plan) {
          setLockedSubFeatures(plan.lockedFeatures || []);
          setActivePlanName(plan.name);
          return;
        }
      }
    } catch(e) {}
    // Fallbacks
    setLockedSubFeatures(['emails', 'logs']); // default Silver Growth locks
    setActivePlanName('Silver Growth');
  };

  useEffect(() => {
    syncSubscriptionLocks();
    window.addEventListener('subscription_updated', syncSubscriptionLocks);
    return () => {
      window.removeEventListener('subscription_updated', syncSubscriptionLocks);
    };
  }, []);

  const renderLockedFeatureOverlay = (tabId: string) => {
    const featureLabelMap: Record<string, string> = {
      designer: 'Thermal Label Template Designer',
      crm: 'CRM Customers & Lead Manager',
      emails: 'Outgoing Transactional Email Notifications',
      logs: 'Live Websocket API Logs Gateway'
    };
    const label = featureLabelMap[tabId] || 'Premium Logistics Module';

    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-900 text-slate-100 min-h-full" id={`locked-feature-overlay-${tabId}`}>
        <div className="max-w-md w-full bg-slate-950 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-6 text-center relative overflow-hidden">
          {/* Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 flex items-center justify-center mx-auto animate-pulse">
            <Lock className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block">Subscription Tier Ceiling</span>
            <h3 className="text-base font-black text-white">{label} is locked</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your current assigned subscription tier (<strong className="text-white">{activePlanName}</strong>) does not license access to this advanced warehouse tool.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800/80 p-4 rounded-xl text-left text-[11px] text-slate-400">
            💼 <strong className="text-slate-200">Admin Lock Active:</strong> Corporate logistics rules require Gold Professional or higher to release this capability.
          </div>

          <button title="Perform action" 
            onClick={() => {
              if (!openTabs.includes('subscriptions')) {
                setOpenTabs([...openTabs, 'subscriptions']);
              }
              setActiveTab('subscriptions');
            }}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-white animate-spin" />
            Visit Subscription Hub & Upgrade
          </button>
        </div>
      </div>
    );
  };

  // User role state
  const [userRole, setUserRole] = useState<'admin' | 'team_member' | 'super_admin' | null>(() => {
    return localStorage.getItem('sellershub_user_role') as any || null;
  });
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('sellershub_user_name') || '';
  });
  const [currency, setCurrency] = useState<string>('GBP');
  const [unitSystem, setUnitSystem] = useState<'imperial' | 'metric'>('metric');
  const [originCountry, setOriginCountry] = useState('GB');
  const [originCity, setOriginCity] = useState('London');
  const [originState, setOriginState] = useState('ENG');
  const [originZip, setOriginZip] = useState('SW1A 1AA');

  const [standaloneOrderId, setStandaloneOrderId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('orderId');
  });

  // Auto-Sync Toggle & countdown
  const [autoSync, setAutoSync] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [aiDashboardsExpanded, setAiDashboardsExpanded] = useState(true);

  // Load initial orders, logs, and credentials from server state
  useEffect(() => {
    fetchOrders();
    fetchLogs();
    fetchCredentials();
    fetchProducts();
    fetchThreshold();
    fetchCurrency();
    fetchOrigin();
  }, []);

  useEffect(() => {
    if (standaloneOrderId && orders.length > 0) {
      const ord = orders.find(o => o.id === standaloneOrderId);
      if (ord) {
        setActiveOrder(ord);
      }
    }
  }, [orders, standaloneOrderId]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      console.error('Error fetching products:', e);
    }
  };

  const fetchThreshold = async () => {
    try {
      const res = await fetch('/api/inventory/threshold');
      const data = await res.json();
      setInventoryThreshold(data.threshold);
    } catch (e) {
      console.error('Error fetching threshold:', e);
    }
  };

  const fetchCurrency = async () => {
    try {
      const res = await fetch('/api/settings/currency');
      const data = await res.json();
      if (data.currency) {
        setCurrency(data.currency);
        if (data.unitSystem) setUnitSystem(data.unitSystem);
      }
    } catch (e) {
      console.error('Error fetching currency settings:', e);
    }
  };

  const fetchOrigin = async () => {
    try {
      const savedOrigin = localStorage.getItem('appOrigin');
      if (savedOrigin) {
        const parsed = JSON.parse(savedOrigin);
        setOriginCountry(parsed.country || 'US');
        setOriginCity(parsed.city || 'Atlanta');
        setOriginState(parsed.state || 'GA');
        setOriginZip(parsed.zip || '30309');
        fetch('/api/settings/origin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed)
        }).catch(() => {});
        return;
      }
      const res = await fetch('/api/settings/origin');
      const data = await res.json();
      if (data) {
        setOriginCountry(data.country || 'US');
        setOriginCity(data.city || 'Atlanta');
        setOriginState(data.state || 'GA');
        setOriginZip(data.zip || '30309');
      }
    } catch (e) {
      console.error('Error fetching origin settings:', e);
    }
  };

  const handleUpdateOrigin = async (country: string, city: string, state: string, zip: string) => {
    try {
      localStorage.setItem('appOrigin', JSON.stringify({ country, city, state, zip }));
      const res = await fetch('/api/settings/origin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country, city, state, zip })
      });
      const data = await res.json();
      if (data.success) {
        setOriginCountry(data.origin.country);
        setOriginCity(data.origin.city);
        setOriginState(data.origin.state);
        setOriginZip(data.origin.zip);
        fetchLogs();
      }
    } catch (e) {
      console.error('Error saving origin settings:', e);
    }
  };

  const handleUpdateUnitSystem = async (newUnit: string) => {
    try {
      const res = await fetch('/api/settings/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unitSystem: newUnit })
      });
      const data = await res.json();
      if (data.success) {
        setUnitSystem(data.unitSystem);
        fetchLogs();
      }
    } catch (e) {
      console.error('Error updating unit settings:', e);
    }
  };

  const handleUpdateCurrency = async (newCurrency: string) => {
    try {
      const res = await fetch('/api/settings/currency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency: newCurrency })
      });
      const data = await res.json();
      if (data.success) {
        setCurrency(data.currency);
        if (data.unitSystem) setUnitSystem(data.unitSystem);
        fetchLogs();
        fetchOrders();
      }
    } catch (e) {
      console.error('Error updating currency settings:', e);
    }
  };

  const handleUpdateThreshold = async (threshold: number) => {
    try {
      const res = await fetch('/api/inventory/threshold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threshold })
      });
      const data = await res.json();
      if (data.success) {
        setInventoryThreshold(data.threshold);
        await fetchLogs();
        fetchOrders();
      }
    } catch (e) {
      console.error('Error updating threshold:', e);
    }
  };

  const handleSyncProducts = async (channel: string = 'all') => {
    try {
      const res = await fetch('/api/products/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel })
      });
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
        await fetchLogs();
        fetchOrders();
      }
    } catch (e) {
      console.error('Error syncing products:', e);
    }
  };

  const handleUpdateProduct = async (productDetails: any) => {
    try {
      const res = await fetch('/api/products/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productDetails)
      });
      const data = await res.json();
      if (data.success) {
        await fetchProducts();
        await fetchLogs();
        fetchOrders();
      }
    } catch (e) {
      console.error('Error updating product:', e);
    }
  };

  const handleImportProducts = async (itemsToImport: any[]) => {
    try {
      const res = await fetch('/api/products/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsToImport })
      });
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
        await fetchLogs();
        fetchOrders();
      }
    } catch (e) {
      console.error('Error importing products via CSV:', e);
    }
  };

  // SSE auto-sync for orders
  useEffect(() => {
    const evtSource = new EventSource('/api/stream');
    evtSource.addEventListener('orders', (e: any) => {
      try {
        const data = JSON.parse(e.data);
        setOrders(data);
        // Retain active order if selected
        setActiveOrder((prevActive: any) => {
          if (prevActive) {
            return data.find((o: any) => o.id === prevActive.id) || prevActive;
          }
          return null;
        });
      } catch (err) {}
    });
    return () => evtSource.close();
  }, []);

  // Auto-sync polling timer
  useEffect(() => {
    let interval: any = null;
    if (autoSync) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            handleSyncOrders('all');
            return 15;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setCountdown(15);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoSync]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data);
      // Retain selection or update active order
      if (activeOrder) {
        const updated = data.find((o: Order) => o.id === activeOrder.id);
        if (updated) setActiveOrder(updated);
      }
    } catch (e) {
      console.error('Error fetching orders:', e);
    }
  };

  const fetchLogs = async () => {
  const handleReverseAction = async () => {
    try {
      await fetch('/api/logs/reverse', { method: 'POST' });
      fetchLogs();
    } catch (e) {
      console.error(e);
    }
  };
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      setLogs(data);
    } catch (e) {
      console.error('Error fetching logs:', e);
    }
  };

  const fetchCredentials = async () => {
    try {
      const res = await fetch('/api/credentials');
      const data = await res.json();
      setCredentials(data);
    } catch (e) {
      console.error('Error fetching credentials:', e);
    }
  };

  const handleSaveCredentials = async (newCreds: ApiCredentials) => {
    try {
      const res = await fetch('/api/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCreds)
      });
      const data = await res.json();
      if (data.success) {
        setCredentials(data.credentials);
        fetchLogs();
        fetchOrders();
      }
    } catch (e) {
      console.error('Error saving credentials:', e);
    }
  };

  const handleSyncOrders = async (channel: string = 'all') => {
    setSyncing(true);
    try {
      const res = await fetch('/api/orders/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel })
      });
      const data = await res.json();
      setOrders(data);
      await fetchLogs();
        fetchOrders();
    } catch (e) {
      console.error('Error syncing orders:', e);
    } finally {
      setSyncing(false);
    }
  };

  const handleUpdateSpecs = async (id: string, weightOz: number, dimensions: { length: number; width: number; height: number }) => {
    try {
      const res = await fetch('/api/orders/update-specs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, weightOz, dimensions })
      });
      const data = await res.json();
      if (data.success) {
        await fetchOrders();
        await fetchLogs();
        fetchOrders();
        if (activeOrder && activeOrder.id === id) {
          setActiveOrder(data.order);
        }
      }
    } catch (e) {
      console.error('Error updating order specs:', e);
    }
  };

  const handleBulkUpdateSpecs = async (ids: string[], weightOz: number, dimensions: { length: number; width: number; height: number }) => {
    try {
      const res = await fetch('/api/orders/bulk-update-specs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, weightOz, dimensions })
      });
      const data = await res.json();
      if (data.success) {
        await fetchOrders();
        await fetchLogs();
        if (activeOrder && ids.includes(activeOrder.id)) {
          const updatedActive = data.orders.find((o: any) => o.id === activeOrder.id);
          if (updatedActive) {
            setActiveOrder(updatedActive);
          }
        }
      }
    } catch (e) {
      console.error('Error bulk updating order specs:', e);
    }
  };

  const handleUpdateOrder = async (id: string, updates: Partial<Order>) => {
    try {
      const res = await fetch('/api/orders/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });
      const data = await res.json();
      if (data.success) {
        await fetchOrders();
        await fetchLogs();
        fetchOrders();
        if (activeOrder && activeOrder.id === id) {
          setActiveOrder(data.order);
        }
      }
    } catch (e) {
      console.error('Error updating order:', e);
    }
  };

  const handleResetOrders = async () => {
    try {
      const res = await fetch('/api/orders/reset', { method: 'POST' });
      const data = await res.json();
      setOrders(data);
      setSelectedOrderIds([]);
      setActiveOrder(null);
      await fetchLogs();
        fetchOrders();
    } catch (e) {
      console.error('Error resetting orders:', e);
    }
  };

  const handleBuyLabel = async (orderId: string, rateId: string) => {
    try {
      const res = await fetch('/api/shipping/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, rateId })
      });
      const data = await res.json();
      if (data.success) {
        await fetchOrders();
        await fetchLogs();
        fetchOrders();
      }
    } catch (e) {
      console.error('Error buying shipping label:', e);
    }
  };

  const handleMergeOrders = async (orderIds: string[]) => {
    try {
      const res = await fetch('/api/orders/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds })
      });
      const data = await res.json();
      if (data.success) {
        await fetchOrders();
        await fetchLogs();
        fetchOrders();
        setSelectedOrderIds([]);
        if (activeOrder && orderIds.includes(activeOrder.id)) {
          setActiveOrder(data.mergedOrder);
        }
      } else {
        console.error('Merge error:', data.error);
      }
    } catch (e) {
      console.error('Error merging orders:', e);
    }
  };

  const handleBulkAction = async (action: 'cancel' | 'delete' | 'ship' | 'notify_channels', ids: string[]) => {
    if (ids.length === 0) return;
    try {
      const res = await fetch('/api/orders/bulk-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ids })
      });
      const data = await res.json();
      if (data.success) {
        await fetchOrders();
        await fetchLogs();
        setSelectedOrderIds([]);
      }
    } catch (e) {
      console.error('Error in bulk action:', e);
    }
  };

  const handleOpenPrintSpool = (processedOrders: any[]) => {
    const sheetWindow = window.open('', '_blank');
    if (sheetWindow) {
      sheetWindow.document.write(`
        <html>
        <head>
          <title>Bulk Print 6x4 Thermal Queue - Multi-Channel Fulfillment</title>
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
              .print-header-bar {
                display: none !important;
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
              background: #f1f5f9;
              display: flex;
              flex-direction: column;
              align-items: center;
              color: black;
            }
            .print-header-bar {
              background: #0f172a;
              color: white;
              padding: 15px 25px;
              width: 4in;
              box-sizing: border-box;
              border-radius: 8px;
              margin-bottom: 20px;
              text-align: center;
              box-shadow: 0 4px 6px rgba(0,0,0,0.05);
              font-family: sans-serif;
            }
            .btn-print {
              background: #10b981;
              color: white;
              border: none;
              padding: 10px 18px;
              font-weight: bold;
              border-radius: 6px;
              cursor: pointer;
              margin-top: 10px;
              width: 100%;
              font-size: 13px;
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
              box-shadow: 0 4px 10px rgba(0,0,0,0.05);
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
          <div class="print-header-bar">
            <div style="font-weight: bold; font-size: 14px;">Direct Printer Thermal Spool</div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">${processedOrders.length} Labels Ready for Direct Printing</div>
            <button title="Print document" class="btn-print" onclick="window.print()">✓ Print All 6x4 Labels</button>
          </div>
          
          ${processedOrders.map((o: any) => `
            <div class="label-card">
              <div class="carrier-header">
                <div>
                  <span class="service-pill">AMZN</span>
                  <span style="margin-left:5px;">${o.selectedRate.carrierName.toUpperCase()}</span>
                </div>
                <span style="font-size: 12px; font-weight:bold;">${o.selectedRate.serviceName.toUpperCase()}</span>
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
                <span style="font-size: 13px; font-weight: bold;">${o.shippingAddress.name}</span><br/>
                ${o.shippingAddress.addressLine1}<br/>
                ${o.shippingAddress.city}, ${o.shippingAddress.stateOrRegion} ${o.shippingAddress.postalCode}
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
                <div class="tracking-text">${o.trackingNumber}</div>
                <div style="font-size: 8px; margin-top: 3px;">Order: ${o.id} | Source: ${o.source.toUpperCase()}</div>
              </div>
            </div>
          `).join('')}
        </body>
        </html>
      `);
      sheetWindow.document.close();
    }
  };

  const handleBulkProcess = async () => {
    if (selectedOrderIds.length === 0) return;
    setBulkProcessing(true);
    try {
      const res = await fetch('/api/shipping/bulk-buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: selectedOrderIds, preferredType: bulkStrategy })
      });
      const data = await res.json();
      if (data.success) {
        await fetchOrders();
        await fetchLogs();
        fetchOrders();
        setSelectedOrderIds([]);
        
        // Save state to trigger 'Print Status' confirmation modal
        setPrintStatusData({
          processedCount: data.processedCount,
          processedOrders: data.processedOrders,
          preferredStrategy: bulkStrategy
        });

        // Trigger simulated printing dialog
        handleOpenPrintSpool(data.processedOrders);
      }
    } catch (e) {
      console.error('Error processing bulk labels:', e);
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleRefreshRates = async (orderId: string): Promise<CarrierRate[]> => {
    try {
      const res = await fetch('/api/shipping/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
      return await res.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const handleClearLogs = async () => {
    try {
      await fetch('/api/logs/clear', { method: 'POST' });
      fetchLogs();
        fetchOrders();
    } catch (e) {
      console.error(e);
    }
  };

  // Selection helpers
  const handleToggleSelectOrder = (id: string) => {
    setSelectedOrderIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(oId => oId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleToggleSelectAll = () => {
    const pendingOrdersOnPage = orders.filter(o => o.status === 'pending');
    const allPendingSelected = pendingOrdersOnPage.every(o => selectedOrderIds.includes(o.id));
    
    if (allPendingSelected) {
      // Deselect all
      setSelectedOrderIds(prev => prev.filter(id => !pendingOrdersOnPage.some(o => o.id === id)));
    } else {
      // Select all pending
      const pendingIds = pendingOrdersOnPage.map(o => o.id);
      setSelectedOrderIds(prev => Array.from(new Set([...prev, ...pendingIds])));
    }
  };

  const handleLoginSuccess = (role: 'admin' | 'team_member' | 'super_admin', name: string) => {
    setUserRole(role);
    setUserName(name);
    localStorage.setItem('sellershub_user_role', role);
    localStorage.setItem('sellershub_user_name', name);
  };

  const handleLogout = () => {
    setUserRole(null);
    setUserName('');
    localStorage.removeItem('sellershub_user_role');
    localStorage.removeItem('sellershub_user_name');
    window.location.href = '/';
  };

  const handleOpenTab = (tabId: string) => {
    if (!openTabs.includes(tabId)) {
      setOpenTabs([...openTabs, tabId]);
    }
    setActiveTab(tabId as any);
  };

  const handleCloseTab = (tabId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextTabs = openTabs.filter(id => id !== tabId);
    setOpenTabs(nextTabs);
    if (activeTab === tabId) {
      if (nextTabs.length > 0) {
        setActiveTab(nextTabs[nextTabs.length - 1] as any);
      } else {
        setActiveTab(null);
      }
    }
  };

  // Statistics
  const totalOrdersCount = orders.length;
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const shippedCount = orders.filter(o => o.status === 'shipped').length;
  const amazonCount = orders.filter(o => o.source === 'amazon').length;
  const ebayCount = orders.filter(o => o.source === 'ebay').length;

  const totalPostageSpent = orders
    .filter(o => o.status === 'shipped' && o.selectedRate)
    .reduce((sum, o) => sum + (o.selectedRate?.amount || 0), 0);

  if (!userRole) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  if (userRole === 'super_admin') {
    return <SuperAdminApp />;
  }

  if (standaloneOrderId) {
    const targetOrder = orders.find(o => o.id === standaloneOrderId);
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans animate-fade-in" id="standalone-workspace-container">
        <header className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center shadow-lg shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 text-slate-950 p-2 rounded-xl flex items-center justify-center">
              <Truck className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-wider text-white">Sellershub Standalone Order Workspace</h1>
              <p className="text-[11px] text-slate-400">Perform individual weight/dimension edits, courier ratings, and direct postage purchasing.</p>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-hidden p-6 max-w-5xl mx-auto w-full">
          {targetOrder ? (
             <ActiveOrderDetails
                order={targetOrder}
                onUpdateSpecs={handleUpdateSpecs}
                onRefreshRates={handleRefreshRates}
                onBuyLabel={handleBuyLabel}
                onUpdateOrder={handleUpdateOrder}
                unitSystem={unitSystem}
             />
          ) : (
             <div className="text-center p-10 text-slate-400">Order not found or loading...</div>
          )}
        </div>
      </div>
    );
  }

  const expiringAlerts = useMemo(() => {
    const alerts: { product: Product; threshold: number; daysRemaining: number }[] = [];
    products.forEach(p => {
      if (!p.expiryDate) return;
      const category = categories.find(c => c.id === p.categoryId);
      const alertDays = category?.alertDays || [30];

      const expiry = new Date(p.expiryDate).getTime();
      const now = new Date().getTime();
      const daysRemaining = (expiry - now) / (1000 * 60 * 60 * 24);

      if (daysRemaining < 0) {
        if (p.lastAcknowledgedDays !== -1) {
          alerts.push({ product: p, threshold: -1, daysRemaining: Math.ceil(daysRemaining) });
        }
      } else {
        const currentThreshold = [...alertDays].sort((a, b) => a - b).find(threshold => daysRemaining <= threshold);
        if (currentThreshold !== undefined) {
          if (p.lastAcknowledgedDays !== currentThreshold) {
            alerts.push({ product: p, threshold: currentThreshold, daysRemaining: Math.ceil(daysRemaining) });
          }
        }
      }
    });
    return alerts;
  }, [products, categories]);

  // Main application return
  return (
    <div className="h-screen bg-slate-900 text-slate-100 flex flex-col font-sans overflow-hidden" id="main-application-root">
      {/* Expiry Warning Alert */}
      {expiringAlerts.length > 0 && (
        <div className="bg-rose-600 text-white px-4 py-2 flex items-center justify-between shrink-0 shadow-lg z-50 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none translate-x-1/2 -translate-y-1/2" />
          <div className="flex items-center gap-3 relative z-10">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
            <div>
              <p className="text-sm font-bold tracking-wide">
                Warning: {expiringAlerts.length} product(s) are approaching expiry thresholds!
              </p>
              <p className="text-xs text-rose-100 mt-0.5 max-h-12 overflow-y-auto">
                {expiringAlerts.map(a => `${a.product.sku} (${a.daysRemaining > 0 ? `${a.daysRemaining} days left` : 'Expired'})`).join(' | ')}
              </p>
            </div>
          </div>
          <button 
            onClick={() => {
              expiringAlerts.forEach(a => {
                handleUpdateProduct({ ...a.product, lastAcknowledgedDays: a.threshold });
              });
            }}
            className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-white/20 whitespace-nowrap shrink-0 relative z-10"
          >
            Acknowledge & Dismiss
          </button>
        </div>
      )}

      {/* Top Application Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex justify-between items-center shrink-0 shadow-md z-10" id="main-app-header">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 text-slate-950 p-1.5 rounded-lg flex items-center justify-center shadow-lg">
            <Truck className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-wider text-white">Sellershub Logistics</h1>
            <p className="text-[9px] text-slate-400 tracking-wide">ENTERPRISE EDITION</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-4 text-slate-400 text-[10px] uppercase font-bold mr-2">
            <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-emerald-500" /> SYSTEM ONLINE</span>
            <span className="flex items-center gap-1.5"><Wifi className="w-3.5 h-3.5 text-emerald-500" /> API: {credentials.amazonSellingPartner ? 'CONNECTED' : 'DISCONNECTED'}</span>
          </div>
          
          <button title="Perform action" 
            onClick={() => {
              if (!openTabs.includes('logs')) {
                setOpenTabs([...openTabs, 'logs']);
              }
              setActiveTab('logs');
            }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5" />
            Terminal Output
          </button>

          {userRole === 'admin' && (
            <>
              <button title="Change settings or filter"
                onClick={handleResetOrders}
                className="text-xs px-3 py-1.5 border border-slate-700 hover:bg-slate-800 rounded-lg text-slate-300 font-semibold transition-colors"
                id="reset-demo-orders-btn"
              >
                Reset Simulator
              </button>

              <button title="Perform action" 
                onClick={() => {
                  if (!openTabs.includes('guide')) {
                    setOpenTabs([...openTabs, 'guide']);
                  }
                  setActiveTab('guide');
                }}
                className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-semibold transition-all border border-indigo-500 shadow-sm"
                id="open-user-guides-btn"
              >
                <BookOpen className="w-4 h-4 text-white" />
                User Guides
              </button>
            </>
          )}
        </div>
      </header>

      {/* Workspace Wrapper */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0" id="workspace-wrapper">
        
        {/* Left Side Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-slate-950 text-slate-300 flex flex-col border-r border-slate-800 shrink-0 select-none" id="sidebar-tabs-list">
          <div className="p-4 border-b border-slate-900 bg-slate-950/40">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Logistics Modules</span>
          </div>
          <div className="flex-1 p-3 space-y-1 overflow-y-auto">
            <button 
              onClick={() => handleOpenTab('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
                  : openTabs.includes('dashboard')
                    ? 'bg-slate-900/50 text-slate-200 border border-slate-800'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Activity className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="truncate">Dashboard</span>
              </div>
            </button>

            <div className="pt-1 pb-1">
              <button 
                onClick={() => setAiDashboardsExpanded(!aiDashboardsExpanded)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-all"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 flex items-center justify-center transition-transform ${aiDashboardsExpanded ? 'rotate-90' : ''}`}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </div>
                  <span className="uppercase tracking-widest text-[10px] font-black">AI DASHBOARDS</span>
                </div>
                <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Premium</span>
              </button>
              
              {aiDashboardsExpanded && (
                <div className="pl-6 pr-2 space-y-1 mt-1 border-l border-slate-800 ml-5">
                  {[
                    { id: 'ai_products', label: 'Products', icon: Package },
                    { id: 'ai_orders', label: 'Orders', icon: ShoppingBag }
                  ].map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => handleOpenTab(tab.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                        activeTab === tab.id
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
                          : openTabs.includes(tab.id)
                            ? 'bg-slate-900/50 text-slate-200 border border-slate-800'
                            : 'text-slate-400 hover:text-white hover:bg-slate-900/60 border border-transparent'
                      }`}
                    >
                      <span className="truncate">{tab.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {[
              { id: 'orders', label: 'Orders Deck', icon: ShoppingBag, badge: orders.filter(o => o.status === 'pending').length },
              { id: 'scanner', label: 'Dispatch & Scan Console', icon: Barcode, badge: orders.filter(o => o.status === 'pending').length, badgeColor: 'bg-indigo-600' },
              { id: 'products', label: 'Products', icon: Package },
              { id: 'inventory', label: 'Inventory', icon: Database, badge: products.filter(p => p.stock !== undefined && p.stock <= inventoryThreshold).length, badgeColor: 'bg-rose-500' },
              { id: 'profit_calculator', label: 'Profit Calculator', icon: Calculator },
              { id: 'shipping', label: 'Shipping', icon: Truck },
              { id: 'wms', label: 'WMS Suppliers & POs', icon: Building2 },
              { id: 'printers', label: 'Printers & Spool', icon: Printer },
              { id: 'designer', label: 'Template Designer', icon: Layers },
              { id: 'crm', label: 'CRM & Customers', icon: Users },
              { id: 'integrations', label: 'Integrations', icon: Globe, adminOnly: true },
              { id: 'reports', label: 'Reports', icon: FileText },
              { id: 'guide', label: 'User Guides', icon: BookOpen },
              { id: 'settings', label: 'Settings', icon: Settings, adminOnly: true },
              { id: 'subscriptions', label: 'Subscription Hub', icon: Coins, badge: lockedSubFeatures.length > 0 ? 1 : 0, badgeColor: 'bg-indigo-600', adminOnly: true },
              { id: 'emails', label: 'Emails & Notifications', icon: Mail, adminOnly: true },
              { id: 'logs', label: 'API\'s Logs', icon: Terminal, adminOnly: true }
            ].map((tab) => {
              const Icon = tab.icon;
              const isOpen = openTabs.includes(tab.id);
              const isActive = activeTab === tab.id;
              const isLocked = tab.adminOnly && userRole === 'team_member';
              
              return (
                <button 
                  key={tab.id}
                  onClick={() => {
                    if (isLocked) return;
                    handleOpenTab(tab.id);
                  }}
                  disabled={isLocked}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
                      : isOpen
                        ? 'bg-slate-900/50 text-slate-200 border border-slate-800'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/60 border border-transparent'
                  } ${isLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                  id={`sidebar-tab-trigger-${tab.id}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span className="truncate">{tab.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isLocked && <span className="text-[10px]" title="Admin Access Required">🔒</span>}
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className={`text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none shrink-0 ${tab.badgeColor || 'bg-indigo-600'}`}>
                        {tab.badge}
                      </span>
                    )}
                    {isOpen && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Loaded in top bar"></span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick status box at the bottom of the sidebar */}
          <div className="p-4 border-t border-slate-900 bg-slate-950/20 space-y-4 hidden md:block">
            <div className="space-y-2">
              <div className="text-[10px] text-slate-500 flex items-center justify-between">
                <span>Low Stock SKUs</span>
                <span className="font-mono text-rose-400 font-bold">{products.filter(p => p.stock !== undefined && p.stock <= inventoryThreshold).length}</span>
              </div>
              <div className="text-[10px] text-slate-500 flex items-center justify-between">
                <span>Pending Orders</span>
                <span className="font-mono text-emerald-400 font-bold">{orders.filter(o => o.status === 'pending').length}</span>
              </div>
            </div>
            <button title="Execute Logout"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-150 text-slate-300 border border-slate-800 hover:bg-slate-900/60 hover:text-rose-400"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </aside>

        {/* Right Stage Panel (Tabs and Content) */}
        <div className="flex-1 flex flex-col min-h-0 bg-slate-100 text-slate-900 overflow-hidden" id="workspace-main-panel">
          
          {/* Top Tabs Bar: shows open, closable tabs */}
          <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between shrink-0 shadow-xs" id="workspace-top-bar">
            {/* Open tabs list container */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 flex-1">
              {openTabs.length === 0 ? (
                <span className="text-xs text-slate-400 italic">No workspace views open. Select a tool from the left panel to begin.</span>
              ) : (
                openTabs.map((tabId) => {
                  let tabMeta = [
                    { id: 'dashboard', label: 'Dashboard', icon: Activity },
                    { id: 'ai_products', label: 'AI Products Dashboard', icon: Package },
                    { id: 'ai_orders', label: 'AI Orders Dashboard', icon: ShoppingBag },
                    { id: 'orders', label: 'Orders Deck', icon: ShoppingBag },
                    { id: 'scanner', label: 'Dispatch Console', icon: Barcode },
                    { id: 'products', label: 'Products', icon: Package },
                    { id: 'inventory', label: 'Inventory', icon: Database },
                    { id: 'profit_calculator', label: 'Profit Calculator', icon: Calculator },
                    { id: 'shipping', label: 'Shipping', icon: Truck },
                    { id: 'wms', label: 'WMS Suppliers', icon: Building2 },
                    { id: 'printers', label: 'Printers & Spool', icon: Printer },
                    { id: 'designer', label: 'Template Designer', icon: Layers },
              { id: 'crm', label: 'CRM & Customers', icon: Users },
                    { id: 'integrations', label: 'Integrations', icon: Globe },
                    { id: 'reports', label: 'Reports', icon: FileText },
                    { id: 'guide', label: 'User Guides', icon: BookOpen },
                          { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'emails', label: 'Emails & Notifications', icon: Mail },
                    { id: 'logs', label: 'API\'s Logs', icon: Terminal }
                  ].find(t => t.id === tabId);

                  if (!tabMeta && tabId.startsWith('order_')) {
                    tabMeta = {
                      id: tabId,
                      label: `Order ${tabId.replace('order_', '')}`,
                      icon: ShoppingBag
                    };
                  }

                  if (!tabMeta) return null;
                  const TabIcon = tabMeta.icon;
                  const isActive = activeTab === tabId;

                  return (
                    <div
                      key={tabId}
                      onClick={() => setActiveTab(tabId as any)}
                      className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none shrink-0 ${
                        isActive
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-slate-50 text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-100'
                      }`}
                      id={`workspace-tab-${tabId}`}
                    >
                      <TabIcon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span>{tabMeta.label}</span>
                      
                      {/* Close Tab trigger */}
                      <button 
                        onClick={(e) => handleCloseTab(tabId, e)}
                        className={`p-0.5 rounded-full transition-colors shrink-0 ${
                          isActive
                            ? 'hover:bg-slate-800 text-slate-400 hover:text-white'
                            : 'hover:bg-slate-200 text-slate-400 hover:text-slate-800'
                        }`}
                        title="Close View"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* Active View Container Area */}
          <div className="flex-1 overflow-y-auto" id="workspace-viewport">
            {activeTab === null ? (
              /* High-Contrast Beautiful Launch Panel */
              <div className="max-w-4xl mx-auto py-16 px-6 text-center space-y-8" id="empty-workspace-state">
                <div className="w-20 h-20 bg-slate-900 text-emerald-400 border border-slate-800 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                  <Truck className="w-10 h-10 stroke-[1.5]" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">Sellershub Logistics Hub</h2>
                  <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                    All workspace views are currently closed. Use the left navigation panel to open modules, or quick-launch a primary system tab below:
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left pt-4">
                  {[
                    { id: 'dashboard', label: 'Overview Dashboard', icon: Activity, desc: 'Central logistics KPIs, order dispatch states, and real-time connectivity health.' },
                    { id: 'orders', label: 'Orders Deck', icon: ShoppingBag, desc: 'Manage multi-channel marketplace order flow, bulk purchase courier labels.' },
                    { id: 'scanner', label: 'Dispatch & Scan Console', icon: Barcode, desc: 'Avoid dispatch errors. Scan item barcodes to auto-generate shipping labels or confirm pre-printed orders.' },
                    { id: 'products', label: 'Products Inventory', icon: Package, desc: 'Synchronize listings, control warehouse bin locations, manage safety stock.' },
                    { id: 'profit_calculator', label: 'VAT Margin Calculator', icon: Calculator, desc: 'Analyze real-time channel transaction net profits, VAT rates & fulfillment fees.' }
                  ].map((item) => {
                    const CardIcon = item.icon;
                    return (
                      <button title="Perform action" 
                        key={item.id}
                        onClick={() => handleOpenTab(item.id)}
                        className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-emerald-500 hover:shadow-md transition-all text-left group flex gap-3 cursor-pointer w-full"
                      >
                        <div className="bg-slate-50 text-slate-700 p-2.5 rounded-xl group-hover:bg-emerald-50 text-emerald-600 shrink-0 transition-all flex items-center justify-center h-11 w-11">
                          <CardIcon className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-extrabold text-slate-800 tracking-wide uppercase flex items-center gap-1.5">
                            {item.label}
                            <span className="text-[9px] text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                          </h4>
                          <p className="text-[11px] text-slate-400 leading-normal">{item.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <main className="p-6 w-full space-y-5 flex flex-col min-h-0" id="fulfillment-manager-stage">
                
                {activeTab === 'dashboard' && (
                  <DashboardView
                    orders={orders}
                    products={products}
              currency={currency}
                    logs={logs}
                    inventoryThreshold={inventoryThreshold}
                    onTabChange={handleOpenTab}
                    onSyncAll={() => handleSyncOrders('all')}
                  />
                )}

        {activeTab === 'orders' && (
          <>
            {/* Orders Action Hub & Synchronizer */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 shrink-0 flex flex-col md:flex-row gap-4 items-center justify-between text-white" id="orders-synchronizer-strip">
              <div className="flex items-center gap-3">
                <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold px-2 py-1 rounded">
                  Channel Sync Status: Active
                </span>
                <span className="text-xs text-slate-300">
                  {credentials.isSandbox ? (
                    <span className="text-amber-400 font-semibold flex items-center gap-1">
                      ⚡ Sandbox Mode Enabled. Sync generates mock sales feeds.
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      ✓ Connected Live. Accessing SP-API and eBay.
                    </span>
                  )}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Auto-Sync mode toggle */}
                <button 
                  onClick={() => setAutoSync(!autoSync)}
                  title="Toggle background auto-synchronization every 15 seconds"
                  className={`text-xs font-extrabold px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 border ${
                    autoSync 
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 animate-pulse' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                  id="auto-sync-toggle-btn"
                >
                  <span className={`w-2 h-2 rounded-full ${autoSync ? 'bg-slate-950' : 'bg-slate-500'}`}></span>
                  {autoSync ? `Auto-Sync Active (15s) - Next: ${countdown}s` : 'Enable Auto-Sync'}
                </button>

                <button 
                  onClick={() => handleSyncOrders('amazon')}
                  disabled={syncing}
                  title="Fetch latest orders from Amazon Seller Central"
                  className="text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-2 rounded-lg transition-all flex items-center gap-1.5"
                  id="sync-amazon-btn"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                  Sync Amazon
                </button>
                <button 
                  onClick={() => handleSyncOrders('ebay')}
                  disabled={syncing}
                  title="Fetch latest orders from eBay Seller Hub"
                  className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-all flex items-center gap-1.5"
                  id="sync-ebay-btn"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                  Sync eBay
                </button>
                <button 
                  onClick={() => handleSyncOrders('all')}
                  disabled={syncing}
                  title="Fetch latest orders from all connected channels"
                  className="text-xs font-bold bg-white hover:bg-slate-100 text-slate-950 px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                  id="sync-all-btn"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                  Sync Both Channels
                </button>
              </div>
            </div>

            {/* Bulk Processing Controls Deck - Renders when 1 or more pending are selected */}
            {selectedOrderIds.length > 0 && (
              <div className="bg-indigo-600/95 text-white p-4 rounded-2xl border border-indigo-700 shadow-md animate-fade-in flex flex-col md:flex-row gap-4 justify-between items-center shrink-0" id="bulk-action-deck">
                <div className="flex items-center gap-3">
                  <div className="bg-white text-indigo-700 rounded-full w-8 h-8 flex items-center justify-center font-black text-sm shrink-0">
                    {selectedOrderIds.length}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm tracking-tight">Bulk Shipping Labels Queue Active</h3>
                    <p className="text-[11px] text-indigo-100">Calculate rates and buy carrier postage for multiple orders simultaneously.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto">
                  {/* Select strategy */}
                  <div className="flex flex-col shrink-0">
                    <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider mb-0.5">Postage Strategy</span>
                    <select
                      value={bulkStrategy}
                      onChange={(e: any) => setBulkStrategy(e.target.value)}
                      className="bg-indigo-700 border border-indigo-500 text-xs rounded-lg px-2.5 py-1.5 font-semibold text-white focus:outline-none focus:ring-1 focus:ring-white"
                      id="bulk-strategy-select"
                    >
                      <option value="cheapest">Cheapest Rate (Optimized Cost)</option>
                      <option value="fastest">Fastest Delivery (Express Courier)</option>
                      <option value="buy_shipping">Amazon Buy Shipping Priority</option>
                      <option value="shipping_v2">Amazon Ground Shipping v2</option>
                    </select>
                  </div>

                  {/* Bulk Buy label button */}
                  <button
                    onClick={handleBulkProcess}
                    disabled={bulkProcessing}
                    title="Calculate rates and purchase postage for selected orders"
                    className="bg-white hover:bg-indigo-50 text-indigo-700 font-extrabold text-xs px-5 py-3 rounded-xl transition-all shadow-md mt-auto shrink-0 flex items-center gap-1.5"
                    id="bulk-buy-btn"
                  >
                    {bulkProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Processing and Buying...
                      </>
                    ) : (
                      <>
                        <Printer className="w-4 h-4 text-indigo-600" />
                        Bulk Purchase & Auto-Print
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Primary Interactive Workspace Grid (Full width for Excel-like view) */}
            <div className="flex-1 min-h-0 relative" id="interactive-workspace-pane">
              {/* Orders list full width */}
              <div className="w-full flex flex-col h-full min-h-0">
                <OrdersList unitSystem={unitSystem}
                  onUpdateSpecs={handleUpdateSpecs}
                  onBulkUpdateSpecs={handleBulkUpdateSpecs}
                  onUpdateOrder={handleUpdateOrder}
                  orders={orders}
                  selectedOrderIds={selectedOrderIds}
                  onToggleSelectOrder={handleToggleSelectOrder}
                  onToggleSelectAll={handleToggleSelectAll}
                  onSelectOrderDetails={(order) => handleOpenTab(`order_${order.id}`)}
                  activeOrderId={activeOrder?.id || null}
                  onAnalyzeAddress={() => {}}
                  onPackagingAdvise={() => {}}
                  products={products}
                  categories={categories}
                  inventoryThreshold={inventoryThreshold}
                  onMergeOrders={handleMergeOrders}
                  onBulkAction={handleBulkAction}
                  onOpenDispatchConsole={() => handleOpenTab('scanner')}
                />
              </div>


            </div>
          </>
        )}

        {activeTab === 'products' && (
          <div className="flex-1 flex flex-col min-h-0" id="products-catalog-tab-container">
            <ProductsManager
              products={products}
              categories={categories}
              onCreateCategory={(cat) => setCategories(prev => [...prev, cat])}
              onUpdateCategory={(cat) => setCategories(prev => prev.map(c => c.id === cat.id ? cat : c))}
              onDeleteCategory={(catId) => setCategories(prev => prev.filter(c => c.id !== catId))}
              inventoryThreshold={inventoryThreshold}
              onUpdateThreshold={handleUpdateThreshold}
              onSyncProducts={handleSyncProducts}
              onUpdateProduct={handleUpdateProduct}
              onImportProducts={handleImportProducts}
              unitSystem={unitSystem}
              currency={currency}
            />
          </div>
        )}

        {activeTab === 'scanner' && (
          <div className="flex-1 flex flex-col min-h-0" id="scanner-tab-container">
            <ScannerConsole
              orders={orders}
              products={products}
              categories={categories}
              unitSystem={unitSystem}
              onUpdateProduct={handleUpdateProduct}
              onUpdateOrder={handleUpdateOrder}
              onNavigateToOrders={() => handleOpenTab('orders')}
            />
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="flex-1 flex flex-col min-h-0" id="inventory-tab-container">
            <InventoryView
              products={products}
              currency={currency}
              unitSystem={unitSystem}
              inventoryThreshold={inventoryThreshold}
              onUpdateThreshold={handleUpdateThreshold}
              onSyncProducts={handleSyncProducts}
              onUpdateProduct={handleUpdateProduct}
            />
          </div>
        )}

        {activeTab === 'profit_calculator' && (
          <div className="flex-1 flex flex-col min-h-0 p-6 overflow-y-auto" id="profit-calculator-tab-container">
            <ProfitCalculatorView products={products}
              currency={currency} />
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="flex-1 flex flex-col min-h-0" id="shipping-tab-container">
            <ShippingView unitSystem={unitSystem} />
          </div>
        )}

        {activeTab === 'crm' && (
          <div className="flex-1 flex flex-col min-h-0" id="crm-tab-container">
            {lockedSubFeatures.includes('crm') ? renderLockedFeatureOverlay('crm') : <CrmView orders={orders} />}
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div className="flex-1 flex flex-col min-h-0" id="subscriptions-tab-container">
            <SubscriptionAdminCentre
              currentOrderCount={orders.length}
              currentSkuCount={products.length}
              currentProductCount={products.length}
              userRole={userRole}
              onRefreshLogs={fetchLogs}
            />
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="flex-1 flex flex-col min-h-0" id="integrations-tab-container">
            {userRole === 'team_member' ? (
              <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
                <div className="max-w-md w-full text-center bg-white border border-slate-200 p-8 rounded-2xl shadow-sm space-y-4">
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                    <span>🔒</span>
                  </div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Administrator Credentials Required</h3>
                  <p className="text-xs text-slate-500 leading-normal">
                    Store connector API credentials (SP-API tokens & credentials) are locked for non-administrative team member roles. Please contact Pankaj (Sellershub Admin) for token updates.
                  </p>
                </div>
              </div>
            ) : (
              <IntegrationsView
                credentials={credentials}
                onSaveCredentials={handleSaveCredentials}
                onSyncOrders={handleSyncOrders}
                syncing={syncing}
                products={products}
                onUpdateProduct={handleUpdateProduct}
                onSyncProducts={handleSyncProducts}
              />
            )}
          </div>
        )}

        {activeTab === 'emails' && (
          <div className="flex-1 flex flex-col min-h-0" id="emails-tab-container">
            {lockedSubFeatures.includes('emails') ? renderLockedFeatureOverlay('emails') : <EmailSettingsView />}
          </div>
        )}

        {activeTab === 'ai_products' && (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-100" id="ai-products-dashboard-container">
            <AiProductsDashboardView products={products} currency={currency} />
          </div>
        )}

        {activeTab === 'ai_orders' && (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-100" id="ai-orders-dashboard-container">
            <AiOrdersDashboardView orders={orders} currency={currency} />
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="flex-1 flex flex-col min-h-0" id="reports-tab-container">
            <ReportsView
              orders={orders}
              products={products}
              currency={currency}
            />
          </div>
        )}

        {activeTab === 'wms' && (
          <div className="flex-1 flex flex-col min-h-0" id="wms-tab-container">
            <WmsView currency={currency} unitSystem={unitSystem}
              products={products}
              onRefreshProducts={fetchProducts}
              onRefreshLogs={fetchLogs}
            />
          </div>
        )}

        {activeTab === 'printers' && (
          <div className="flex-1 flex flex-col min-h-0" id="printers-tab-container">
            <PrinterSettingsView
              onRefreshLogs={fetchLogs}
            />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="flex-1 flex flex-col min-h-0" id="settings-tab-container">
            {userRole === 'team_member' ? (
              <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
                <div className="max-w-md w-full text-center bg-white border border-slate-200 p-8 rounded-2xl shadow-sm space-y-4">
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                    <span>🔒</span>
                  </div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Administrator Authority Required</h3>
                  <p className="text-xs text-slate-500 leading-normal">
                    Global postage strategies, Automated shipping rule engines, and base currencies are restricted. Day-to-day warehouse operations cannot adjust logistics rulesets.
                  </p>
                </div>
              </div>
            ) : (
              <SettingsView
                onResetDemoOrders={handleResetOrders}
                inventoryThreshold={inventoryThreshold}
                onUpdateThreshold={handleUpdateThreshold}
                bulkStrategy={bulkStrategy}
                setBulkStrategy={setBulkStrategy}
                onRefreshOrders={fetchOrders}
                onRefreshLogs={fetchLogs}
                currency={currency}
                onUpdateCurrency={handleUpdateCurrency}
                unitSystem={unitSystem}
                onUpdateUnitSystem={handleUpdateUnitSystem}
                originCountry={originCountry}
                originCity={originCity}
                originState={originState}
                originZip={originZip}
                onUpdateOrigin={handleUpdateOrigin}
              />
            )}
          </div>
        )}

        {/* Tab content continues... */}

        {activeTab === 'guide' && (
          <div className="flex-1 flex flex-col min-h-0" id="user-guides-tab-container">
            <UserGuidesView />
          </div>
        )}

        {activeTab === 'designer' && (
          <div className="flex-1 flex flex-col min-h-0" id="template-designer-tab-container">
            {lockedSubFeatures.includes('designer') ? renderLockedFeatureOverlay('designer') : <TemplateDesigner />}
          </div>
        )}

        {activeTab?.startsWith('order_') && (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50 rounded-2xl shadow-sm border border-slate-200" id="order-tab-container">
            {(() => {
              const orderId = activeTab.replace('order_', '');
              const targetOrder = orders.find(o => o.id === orderId);
              if (!targetOrder) return <div className="p-8 text-center text-slate-500">Order not found.</div>;
              return (
                <div className="flex-1 overflow-y-auto bg-slate-100 rounded-2xl">
                  <ActiveOrderDetails 
                    unitSystem={unitSystem} 
                    order={targetOrder} 
                    onBuyLabel={handleBuyLabel} 
                    onRefreshRates={handleRefreshRates}
                    onUpdateSpecs={handleUpdateSpecs}
                    onUpdateOrder={handleUpdateOrder}
                  />
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="flex-1 flex flex-col min-h-0" id="logs-tab-container">
            {lockedSubFeatures.includes('logs') ? (
              renderLockedFeatureOverlay('logs')
            ) : (
              <div className="bg-slate-900 text-slate-300 flex-1 flex flex-col rounded-2xl border border-slate-800 p-4 shadow-inner">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-400" /> API Gateway Logs / Connection Console
                </h4>
                <div className="flex items-center gap-2">
                  <button title="Execute ClearLogs"
                    onClick={handleClearLogs}
                    className="text-[10px] text-slate-500 hover:text-slate-300 font-semibold bg-slate-800 px-3 py-1 rounded"
                    id="clear-logs-btn"
                  >
                    Clear Console
                  </button>
                  <button title="Refresh data"
                    onClick={async () => {
                      alert("Reversing last bulk action...");
                      try {
                        const res = await fetch('/api/orders/bulk-action', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ action: 'reverse', ids: [] })
                        });
                        if (res.ok) {
                          alert("Action reversed successfully.");
                          // Trigger reload to sync data
                          window.location.reload();
                        } else {
                          alert("Failed to reverse action.");
                        }
                      } catch (e) {
                        alert("Error reversing action");
                      }
                    }}
                    className="text-[10px] text-amber-500 hover:text-amber-300 font-semibold bg-slate-800 px-3 py-1 rounded"
                  >
                    Reverse Last Action
                  </button>
                  <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-2 py-1 rounded">
                    24-Hour History • Live Websocket Simulation Stream
                  </span>
                </div>
              </div>
              <div className="bg-slate-950 rounded-xl p-3 flex-1 overflow-y-auto font-mono text-[11px] space-y-1.5 border border-slate-800" id="logs-container">
                {logs.length === 0 ? (
                  <p className="text-slate-600 italic">No network connection logs to show. Trigger a synchronization event.</p>
                ) : (
                  logs.map((log) => {
                    const isError = log.level === 'error';
                    const isWarn = log.level === 'warn';
                    const isAi = log.source === 'ai';
                    return (
                      <div key={log.id} className="flex items-start gap-1.5">
                        <span className="text-slate-600 text-[10px]">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded shrink-0 ${
                          log.source === 'amazon_api' 
                            ? 'bg-amber-950/50 text-amber-400 border border-amber-900/35' 
                            : log.source === 'ebay_api'
                              ? 'bg-blue-950/50 text-blue-400 border border-blue-900/35'
                              : isAi 
                                ? 'bg-indigo-950 text-indigo-400 border border-indigo-900'
                                : 'bg-slate-800 text-slate-300'
                        }`}>
                          {log.source.replace('_', '-')}
                        </span>
                        <span className={`${
                          isError 
                            ? 'text-rose-400 font-bold' 
                            : isWarn 
                              ? 'text-amber-400 font-semibold' 
                              : isAi 
                                ? 'text-indigo-300 font-medium' 
                                : 'text-slate-300'
                        }`}>
                          {log.message}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            )}
          </div>
        )}

      </main>
            )}
          </div>
        </div>
      </div>

      {/* API Credentials Configuration Slideover Modal */}
      <CredentialsModal
        isOpen={isCredentialsOpen}
        onClose={() => setIsCredentialsOpen(false)}
        credentials={credentials}
        onSave={handleSaveCredentials}
      />

      {/* Print Status Confirmation Modal */}
      <PrintStatusModal currency={currency} unitSystem={unitSystem}
        isOpen={printStatusData !== null}
        onClose={() => setPrintStatusData(null)}
        processedCount={printStatusData?.processedCount || 0}
        processedOrders={printStatusData?.processedOrders || []}
        preferredStrategy={printStatusData?.preferredStrategy || ''}
        onOpenSpool={() => printStatusData && handleOpenPrintSpool(printStatusData.processedOrders)}
      />
    </div>
  );
}
