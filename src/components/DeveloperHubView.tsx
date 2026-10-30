import React, { useState, useEffect } from 'react';
import { 
  Key, 
  ShieldCheck, 
  Check, 
  Copy, 
  Plus, 
  Trash2, 
  Terminal, 
  Lock, 
  Eye, 
  EyeOff, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Sliders, 
  Database, 
  RefreshCw, 
  Settings, 
  Activity, 
  ChevronRight, 
  Coins,
  ArrowRight
} from 'lucide-react';
import { Product } from '../types';

interface DeveloperApp {
  id: string;
  name: string;
  category: 'accounting' | 'inventory' | 'orders' | 'shipping' | 'crm' | 'custom';
  clientId: string;
  clientSecret: string;
  scopes: string[];
  status: 'active' | 'suspended';
  rateLimit: number; // requests per minute
  createdDate: string;
}

interface DeveloperHubViewProps {
  products?: Product[];
}

const AVAILABLE_SCOPES = [
  { key: 'accounts:read', label: 'Accounts (Read)', category: 'Accounts', description: 'Retrieve tax breakdown, sales invoicing, subscription ledger, and subscription configurations.' },
  { key: 'accounts:write', label: 'Accounts (Write)', category: 'Accounts', description: 'Create and update client invoices, post tax summary entries, and adjust ledger sync offsets.' },
  { key: 'orders:read', label: 'Orders (Read)', category: 'Orders', description: 'Download customer purchase transactions, checkout parameters, channel origins, and shipping addresses.' },
  { key: 'orders:write', label: 'Orders (Write)', category: 'Orders', description: 'Update dispatch status, inject custom tracking numbers, split orders, and purchase courier postage.' },
  { key: 'inventory:read', label: 'Inventory (Read)', category: 'Inventory', description: 'Retrieve direct stock count logs, warehouse bin locations, threshold alarms, and product listings.' },
  { key: 'inventory:write', label: 'Inventory (Write)', category: 'Inventory', description: 'Modify active physical stock count levels, re-allocate bin mapping, and adjust buffer parameters.' },
  { key: 'products:read', label: 'Products (Read)', category: 'Catalog', description: 'Read system catalog entries, sku mapping references, dimensions, and weights.' },
  { key: 'products:write', label: 'Products (Write)', category: 'Catalog', description: 'Create system catalog entries, alter master weights/dimensions, and override product mappings.' },
  { key: 'shipping:read', label: 'Shipping (Read)', category: 'Shipping', description: 'Retrieve shipping quotes, valid service mappings, and Evri/Royal Mail regional presets.' },
  { key: 'shipping:write', label: 'Shipping (Write)', category: 'Shipping', description: 'Generate shipping labels, establish courier handshakes, and trigger label printers.' },
  { key: 'crm:read', label: 'CRM & Tickets (Read)', category: 'CRM', description: 'Retrieve active support tickets, client conversations, logs, and ticket categories.' },
  { key: 'crm:write', label: 'CRM & Tickets (Write)', category: 'CRM', description: 'Post ticket replies, update ticket status, trigger AI-generated responses, and close tickets.' },
];

const API_ENDPOINTS = [
  { path: 'GET /api/v1/accounts/summary', scope: 'accounts:read', description: 'Fetch trial balances, tax rates, and sales invoice ledger summary.' },
  { path: 'POST /api/v1/accounts/invoice', scope: 'accounts:write', description: 'Post a new invoice voucher directly to Xero/Sage ledger.' },
  { path: 'GET /api/v1/orders', scope: 'orders:read', description: 'Retrieve high-volume orders feed with delivery metadata.' },
  { path: 'POST /api/v1/orders/fulfill', scope: 'orders:write', description: 'Dispatch order, upload consignment tracking, and trigger courier.' },
  { path: 'GET /api/v1/inventory/stock', scope: 'inventory:read', description: 'Audit physical stock totals and bin allocations.' },
  { path: 'PUT /api/v1/inventory/stock', scope: 'inventory:write', description: 'Write physical inventory updates directly to warehouse bins.' },
  { path: 'GET /api/v1/crm/tickets', scope: 'crm:read', description: 'View active support tickets from multiple marketplace channels.' },
];

export default function DeveloperHubView({ products = [] }: DeveloperHubViewProps) {
  // Developer apps state
  const [apps, setApps] = useState<DeveloperApp[]>(() => {
    const defaults: DeveloperApp[] = [
      {
        id: 'dev_app_1',
        name: 'Xero Active Ledger Connector',
        category: 'accounting',
        clientId: 'sh_client_xero_81a29f',
        clientSecret: 'sh_secret_xero_7d1b8c2e9a03f4e5678d910a',
        scopes: ['accounts:read', 'accounts:write', 'orders:read'],
        status: 'active',
        rateLimit: 60,
        createdDate: '2026-02-15'
      },
      {
        id: 'dev_app_2',
        name: 'QuickBooks Smart Sync',
        category: 'accounting',
        clientId: 'sh_client_qb_93b821',
        clientSecret: 'sh_secret_qb_a39b28c7d1e405a62f889d71',
        scopes: ['accounts:read', 'accounts:write', 'orders:read', 'customers:read'],
        status: 'active',
        rateLimit: 120,
        createdDate: '2026-04-10'
      },
      {
        id: 'dev_app_3',
        name: 'Sage 50 Ledger Manager',
        category: 'accounting',
        clientId: 'sh_client_sage_5050f8',
        clientSecret: 'sh_secret_sage_cc82a1b9f7c3e4a2d8019b88',
        scopes: ['accounts:read', 'inventory:read'],
        status: 'active',
        rateLimit: 60,
        createdDate: '2026-05-18'
      },
      {
        id: 'dev_app_4',
        name: 'Custom WMS Barcode Scanners',
        category: 'inventory',
        clientId: 'sh_client_whs_00192a',
        clientSecret: 'sh_secret_whs_9982f1b0c9e8310d62a4bf73',
        scopes: ['inventory:read', 'inventory:write', 'products:read'],
        status: 'active',
        rateLimit: 120,
        createdDate: '2026-06-20'
      }
    ];
    try {
      const saved = localStorage.getItem('developer_apps');
      return saved ? JSON.parse(saved) : defaults;
    } catch {
      return defaults;
    }
  });

  // State to control new app drawer/panel
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppCategory, setNewAppCategory] = useState<'accounting' | 'inventory' | 'orders' | 'shipping' | 'crm' | 'custom'>('accounting');
  const [newAppScopes, setNewAppScopes] = useState<string[]>(['accounts:read', 'orders:read']);
  const [newAppRateLimit, setNewAppRateLimit] = useState(60);
  const [newAppSuccess, setNewAppSuccess] = useState<DeveloperApp | null>(null);

  // Edit scopes state
  const [editingApp, setEditingApp] = useState<DeveloperApp | null>(null);

  // Secrets visibility map
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, boolean>>({});

  // Clipboard copy state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Playground state
  const [selectedAppId, setSelectedAppId] = useState<string>('dev_app_1');
  const [selectedEndpointPath, setSelectedEndpointPath] = useState<string>('GET /api/v1/accounts/summary');
  const [sandboxResponse, setSandboxResponse] = useState<any>(null);
  const [sandboxStatus, setSandboxStatus] = useState<number | null>(null);
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [sandboxLogs, setSandboxLogs] = useState<string[]>([]);
  const [sandboxLatency, setSandboxLatency] = useState<number | null>(null);

  // Save apps list to local storage
  const saveApps = (updatedApps: DeveloperApp[]) => {
    setApps(updatedApps);
    localStorage.setItem('developer_apps', JSON.stringify(updatedApps));
  };

  const handleCreateApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim()) return;

    // Generate random mock IDs and secrets
    const appRandomId = Math.random().toString(36).substring(2, 8);
    const clientSecretRandom = Array.from({ length: 24 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    const newApp: DeveloperApp = {
      id: `dev_app_${Date.now()}`,
      name: newAppName,
      category: newAppCategory,
      clientId: `sh_client_${newAppCategory}_${appRandomId}`,
      clientSecret: `sh_secret_${newAppCategory}_${clientSecretRandom}`,
      scopes: [...newAppScopes],
      status: 'active',
      rateLimit: newAppRateLimit,
      createdDate: new Date().toISOString().split('T')[0]
    };

    const updated = [...apps, newApp];
    saveApps(updated);
    setNewAppSuccess(newApp);
    setNewAppName('');
    setNewAppScopes(['accounts:read', 'orders:read']);
    setNewAppRateLimit(60);
  };

  const handleDeleteApp = (id: string) => {
    if (confirm('Are you sure you want to permanently revoke this developer application key? All API requests utilizing this client secret will immediately fail with a 401 Unauthorized error.')) {
      const updated = apps.filter(app => app.id !== id);
      saveApps(updated);
      if (selectedAppId === id) {
        setSelectedAppId(updated[0]?.id || '');
      }
    }
  };

  const handleToggleAppStatus = (id: string) => {
    const updated = apps.map(app => {
      if (app.id === id) {
        const nextStatus: 'active' | 'suspended' = app.status === 'active' ? 'suspended' : 'active';
        return { ...app, status: nextStatus };
      }
      return app;
    });
    saveApps(updated);
  };

  const handleScopeChecklistToggle = (scopeKey: string, isEditing = false) => {
    if (isEditing && editingApp) {
      const currentScopes = editingApp.scopes;
      const nextScopes = currentScopes.includes(scopeKey)
        ? currentScopes.filter(s => s !== scopeKey)
        : [...currentScopes, scopeKey];
      
      const updatedEditingApp = { ...editingApp, scopes: nextScopes };
      setEditingApp(updatedEditingApp);

      // Instantly save
      const updated = apps.map(app => app.id === editingApp.id ? updatedEditingApp : app);
      saveApps(updated);
    } else {
      setNewAppScopes(prev => 
        prev.includes(scopeKey) 
          ? prev.filter(s => s !== scopeKey) 
          : [...prev, scopeKey]
      );
    }
  };

  const toggleSecretVisibility = (id: string) => {
    setVisibleSecrets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Run Sandbox simulation
  const handleRunSandboxRequest = () => {
    const currentApp = apps.find(a => a.id === selectedAppId);
    const endpoint = API_ENDPOINTS.find(ep => ep.path === selectedEndpointPath);
    
    if (!endpoint) return;

    setSandboxLoading(true);
    setSandboxResponse(null);
    setSandboxStatus(null);
    setSandboxLatency(null);

    const logs: string[] = [];
    const timestamp = new Date().toLocaleTimeString();
    
    logs.push(`[${timestamp}] 📡 Initiated handshake request on endpoint: ${selectedEndpointPath}`);
    
    if (!currentApp) {
      setTimeout(() => {
        logs.push(`[${timestamp}] ❌ Error: App ID not found or deleted.`);
        logs.push(`[${timestamp}] 🔐 Response Status: 401 Unauthorized`);
        setSandboxLogs(logs);
        setSandboxStatus(401);
        setSandboxResponse({
          error: "Unauthorized",
          status: 401,
          message: "The API Client ID used does not match any registered application key in the system database.",
          timestamp: new Date().toISOString()
        });
        setSandboxLoading(false);
      }, 600);
      return;
    }

    logs.push(`[${timestamp}] 🔑 Validating Client ID: "${currentApp.clientId}"`);
    logs.push(`[${timestamp}] 🛡️ Validating API Secret signature... Passed.`);

    if (currentApp.status === 'suspended') {
      setTimeout(() => {
        logs.push(`[${timestamp}] ⛔ Access Blocked: App status is currently 'Suspended'.`);
        logs.push(`[${timestamp}] 🔐 Response Status: 403 Forbidden`);
        setSandboxLogs(logs);
        setSandboxStatus(403);
        setSandboxResponse({
          error: "Forbidden",
          status: 403,
          message: "This developer app credential has been suspended by the platform administrator.",
          app_name: currentApp.name,
          timestamp: new Date().toISOString()
        });
        setSandboxLoading(false);
      }, 700);
      return;
    }

    const requiredScope = endpoint.scope;
    logs.push(`[${timestamp}] 🔍 Checking required scope: "${requiredScope}"`);

    const hasScope = currentApp.scopes.includes(requiredScope);
    
    if (hasScope) {
      logs.push(`[${timestamp}] ✅ Access Granted. Required scope "${requiredScope}" is checked in the Checklist Control.`);
      logs.push(`[${timestamp}] 🗄️ Querying system database...`);
    } else {
      logs.push(`[${timestamp}] ❌ Access Denied: Required scope "${requiredScope}" is missing from this API Key's checklist!`);
    }

    // Simulate Network Latency
    setTimeout(() => {
      const duration = Math.floor(Math.random() * 80) + 30; // 30ms - 110ms
      setSandboxLatency(duration);

      if (!hasScope) {
        logs.push(`[${timestamp}] 🔐 Response Status: 403 Forbidden [${duration}ms]`);
        setSandboxStatus(403);
        setSandboxResponse({
          error: "Forbidden",
          status: 403,
          message: `Access denied. Your client credentials do not hold the required '${requiredScope}' permission scope.`,
          required_scope: requiredScope,
          checked_scopes: currentApp.scopes,
          guideline: `To fix this error, go to the Developer App Hub, select "${currentApp.name}" and use the checklist control to enable the "${requiredScope}" feature.`,
          timestamp: new Date().toISOString()
        });
      } else {
        logs.push(`[${timestamp}] 🚀 Handshake success. Marshalling JSON ledger records.`);
        logs.push(`[${timestamp}] 🔐 Response Status: 200 OK [${duration}ms]`);
        setSandboxStatus(200);

        // Dynamic responses depending on endpoint
        let data: any = {};
        if (selectedEndpointPath.includes('/accounts/summary')) {
          data = {
            status: "success",
            endpoint: "/api/v1/accounts/summary",
            timestamp: new Date().toISOString(),
            ledger: {
              organization: "Slamtech UK Ltd (Xero Unified)",
              tax_id: "GB-992182-ZM",
              fiscal_year_end: "31st December",
              currency: "GBP",
              balances: {
                total_sales_gross: 48920.50,
                total_sales_vat_collected: 9784.10,
                pending_invoice_receivables: 12450.00,
                discounts_applied: 410.00
              },
              sync_status: "synchronized_healthy",
              last_sync_timestamp: "2026-07-16T12:00:00Z"
            }
          };
        } else if (selectedEndpointPath.includes('/accounts/invoice')) {
          data = {
            status: "created",
            endpoint: "/api/v1/accounts/invoice",
            timestamp: new Date().toISOString(),
            invoice: {
              invoice_number: `INV-2026-00${Math.floor(Math.random() * 900) + 100}`,
              organization_target: "Sage 50 Cloud",
              client_email: "accounts-payable@sage.co.uk",
              invoice_date: new Date().toISOString().split('T')[0],
              due_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
              line_items: [
                { description: "API Sync bulk orders credit note", unit_price: 349.99, quantity: 1, tax_rate: "20% VAT" }
              ],
              gross_total: 419.99,
              tax_total: 70.00,
              net_total: 349.99
            }
          };
        } else if (selectedEndpointPath.includes('/v1/orders') && !selectedEndpointPath.includes('fulfill')) {
          data = {
            status: "success",
            endpoint: "/api/v1/orders",
            timestamp: new Date().toISOString(),
            count: 3,
            orders: [
              { order_id: "SH-99210", platform: "Amazon SP-API", customer_name: "John Doe", total_price: 49.99, currency: "GBP", sku: "IPH-15-PRO", status: "pending", created_at: "2026-07-16T10:15:00Z" },
              { order_id: "SH-99211", platform: "eBay REST", customer_name: "Jane Smith", total_price: 120.00, currency: "GBP", sku: "AP-MD821-ZM", status: "shipped", tracking_number: "RM-GB-29102", created_at: "2026-07-16T11:02:00Z" },
              { order_id: "SH-99212", platform: "Shopify Store", customer_name: "Robert Johnson", total_price: 15.50, currency: "GBP", sku: "SKU-BUFFER-1", status: "pending", created_at: "2026-07-16T12:45:00Z" }
            ]
          };
        } else if (selectedEndpointPath.includes('fulfill')) {
          data = {
            status: "success",
            endpoint: "/api/v1/orders/fulfill",
            timestamp: new Date().toISOString(),
            action: "fulfillment_processed",
            consignment: {
              order_id: "SH-99210",
              carrier: "EVRi Corporate Delivery",
              service_class: "Next Day Home Delivery",
              package_type: "Small Parcel",
              consignment_number: `EVR-GB-${Math.floor(Math.random() * 900000) + 100000}`,
              label_generated: "https://api.sellershub.io/v1/labels/evr_99210.pdf",
              tracking_pushed: true
            }
          };
        } else if (selectedEndpointPath.includes('/inventory/stock')) {
          data = {
            status: "success",
            endpoint: "/api/v1/inventory/stock",
            timestamp: new Date().toISOString(),
            warehouse_code: "LND-WH-UNIT5",
            inventory_levels: products.slice(0, 4).map(p => ({
              sku: p.sku || 'N/A',
              name: p.name || 'Product',
              stock_allocated: p.stock || 25,
              bin_location: "A-04-12",
              buffer_stock: 5,
              reorder_point: 10
            }))
          };
        } else if (selectedEndpointPath.includes('/crm/tickets')) {
          data = {
            status: "success",
            endpoint: "/api/v1/crm/tickets",
            timestamp: new Date().toISOString(),
            ticket_summary: { open_tickets: 2, resolved_today: 14 },
            tickets: [
              { ticket_id: "TCK-481", source: "Amazon Support", subject: "EVRi Tracking shows delivered but buyer claims not received", status: "open", priority: "high", last_reply: "2 hours ago" },
              { ticket_id: "TCK-482", source: "eBay Dispute", subject: "Refund request for damaged charger", status: "awaiting_buyer", priority: "medium", last_reply: "1 day ago" }
            ]
          };
        } else {
          data = {
            status: "success",
            endpoint: selectedEndpointPath,
            timestamp: new Date().toISOString(),
            message: "Success response marshalled by Sandbox controller."
          };
        }

        setSandboxResponse(data);
      }

      setSandboxLogs(logs);
      setSandboxLoading(false);
    }, 850);
  };

  // Run initial sandbox simulation log
  useEffect(() => {
    setSandboxLogs([
      `[${new Date().toLocaleTimeString()}] 📟 Console idle. Select a developer app, pick an endpoint, and click "Send Sandbox Request" to test API credential scopes.`
    ]);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in" id="developer-hub-container">
      
      {/* Intro Header banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase">Enterprise API</span>
            <h4 className="text-sm font-black uppercase tracking-wider text-indigo-400">Granular Feature Access API Hub</h4>
          </div>
          <h3 className="text-lg font-black tracking-tight text-white">Third-Party App Credentials & Checklist Control</h3>
          <p className="text-xs text-slate-400 max-w-2xl">
            Allow custom developers, accounting portals (Xero, Sage, QuickBooks), or external warehouse scanners to connect with your Sellershub instance. Fully lock down feature permissions down to granular scopes using our interactive checklists.
          </p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-center shrink-0 min-w-[120px]">
          <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Active Apps</span>
          <span className="text-2xl font-black text-indigo-400">{apps.length}</span>
          <span className="block text-[9px] text-emerald-400 font-bold mt-1">● Live Access active</span>
        </div>
      </div>

      {/* Main Grid: left column Apps List & creation, right column Sandbox simulator */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Col: App Manager (7 columns) */}
        <div className="xl:col-span-7 space-y-6">
          
          {/* Main App list */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Registered Developer Keys</h4>
              </div>
              <button title="Add new element" 
                type="button"
                onClick={() => {
                  setShowCreateForm(!showCreateForm);
                  setNewAppSuccess(null);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                {showCreateForm ? 'View Keys List' : 'Create Developer App'}
              </button>
            </div>

            {newAppSuccess && (
              <div className="p-4 bg-emerald-50 border-b border-emerald-100 space-y-3">
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-black text-emerald-950">Developer App Credentials Generated Successfully!</h5>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      Secure access keys have been allocated for **{newAppSuccess.name}**. Record your client secret key immediately. For security, this secret cannot be retrieved once you close this banner.
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-emerald-200 rounded-xl p-3 space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-sans">CLIENT ID</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-800 select-all font-semibold">{newAppSuccess.clientId}</span>
                      <button title="Copy address to clipboard" 
                        onClick={() => handleCopyText(newAppSuccess.clientId, 'copied_new_id')}
                        className="text-indigo-600 hover:text-indigo-800 p-1 cursor-pointer"
                      >
                        {copiedKey === 'copied_new_id' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center gap-2 pt-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-sans">CLIENT SECRET</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-800 select-all font-semibold bg-slate-50 px-1 rounded">{newAppSuccess.clientSecret}</span>
                      <button title="Copy address to clipboard" 
                        onClick={() => handleCopyText(newAppSuccess.clientSecret, 'copied_new_secret')}
                        className="text-indigo-600 hover:text-indigo-800 p-1 cursor-pointer"
                      >
                        {copiedKey === 'copied_new_secret' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button title="Perform action" 
                    onClick={() => {
                      setNewAppSuccess(null);
                      setShowCreateForm(false);
                    }}
                    className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100/60 hover:bg-emerald-100 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Close & Go to Keys List
                  </button>
                </div>
              </div>
            )}

            {showCreateForm ? (
              <form onSubmit={handleCreateApp} className="p-5 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10.5px] uppercase font-extrabold text-slate-600 tracking-wider">App Name / Integrator</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Xero Invoicing Feed"
                      value={newAppName}
                      onChange={(e) => setNewAppName(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-slate-50/50 font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10.5px] uppercase font-extrabold text-slate-600 tracking-wider">Target Category</label>
                    <select
                      value={newAppCategory}
                      onChange={(e) => setNewAppCategory(e.target.value as any)}
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-slate-50/50 font-bold text-slate-700"
                    >
                      <option value="accounting">📊 Accounting Tool (Xero/Sage/Quickbooks)</option>
                      <option value="inventory">📦 Inventory & Warehouse Connector</option>
                      <option value="orders">🛍️ Orders deck Synchronizer</option>
                      <option value="shipping">🚚 Shipping/Courier Label Service</option>
                      <option value="crm">💬 CRM & Chat Ticketing Bot</option>
                      <option value="custom">🔌 Custom Third Party App Developer</option>
                    </select>
                  </div>
                </div>

                {/* Checklist control */}
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10.5px] uppercase font-extrabold text-slate-600 tracking-wider">
                      Granular Feature Access Scopes (Checklist Control)
                    </label>
                    <button title="Perform action" 
                      type="button"
                      onClick={() => {
                        const allKeys = AVAILABLE_SCOPES.map(s => s.key);
                        if (newAppScopes.length === allKeys.length) {
                          setNewAppScopes([]);
                        } else {
                          setNewAppScopes(allKeys);
                        }
                      }}
                      className="text-[10px] font-black text-indigo-600 hover:text-indigo-800"
                    >
                      {newAppScopes.length === AVAILABLE_SCOPES.length ? 'Deselect All' : 'Select All Scopes'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Control exactly what data this third-party app can query or write. Unchecked scopes will fail with 403 Forbidden.
                  </p>

                  <div className="grid grid-cols-1 gap-2.5 max-h-[220px] overflow-y-auto pr-1 border border-slate-150 rounded-xl p-3 bg-slate-50/50">
                    {AVAILABLE_SCOPES.map(scope => {
                      const isChecked = newAppScopes.includes(scope.key);
                      return (
                        <label 
                          key={scope.key} 
                          className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                            isChecked 
                              ? 'bg-indigo-50/40 border-indigo-200/80 shadow-3xs' 
                              : 'bg-white border-slate-200/80 hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleScopeChecklistToggle(scope.key)}
                            className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 mt-0.5"
                          />
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-slate-800">{scope.label}</span>
                              <span className="text-[9px] font-mono font-bold bg-slate-200/80 text-slate-600 px-1.5 py-0.2 rounded font-mono uppercase tracking-wide">
                                {scope.key}
                              </span>
                            </div>
                            <p className="text-[10.5px] text-slate-500 leading-relaxed font-sans font-medium">{scope.description}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                  <div className="space-y-1">
                    <label className="block text-[10.5px] uppercase font-extrabold text-slate-600 tracking-wider">Rate Limit Throttle</label>
                    <select
                      value={newAppRateLimit}
                      onChange={(e) => setNewAppRateLimit(Number(e.target.value))}
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-slate-50/50 font-bold text-slate-700"
                    >
                      <option value={30}>🐌 Standard Developer Plan (30 req/min)</option>
                      <option value={60}>🚀 Standard Core Plan (60 req/min)</option>
                      <option value={120}>⚡ Enterprise High Frequency (120 req/min)</option>
                      <option value={240}>💎 Unlimited Partner Line (240 req/min)</option>
                    </select>
                  </div>
                  <div className="flex items-end justify-end gap-2.5">
                    <button title="Cancel and close" 
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="text-slate-600 hover:text-slate-800 text-xs font-bold bg-slate-100 px-4 py-2.5 rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button title="Submit form" 
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <Key className="w-4 h-4" /> Generate Secure Keys
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="divide-y divide-slate-100">
                {apps.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
                    <h5 className="text-sm font-black text-slate-800">No Developer Keys Found</h5>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Create your very first third-party app credentials above to allow systems like Xero or QuickBooks to access your data safely.
                    </p>
                  </div>
                ) : (
                  apps.map((app) => {
                    const isSecretVisible = visibleSecrets[app.id];
                    return (
                      <div key={app.id} className="p-4 space-y-3 hover:bg-slate-50/50 transition-colors">
                        {/* Title bar */}
                        <div className="flex flex-wrap items-center justify-between gap-2.5">
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs font-black text-slate-800">{app.name}</h5>
                              <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full ${
                                app.category === 'accounting' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                app.category === 'inventory' ? 'bg-green-50 text-green-700 border border-green-200' :
                                app.category === 'orders' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                                app.category === 'shipping' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                                app.category === 'crm' ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' :
                                'bg-slate-100 text-slate-700 border border-slate-300'
                              }`}>
                                {app.category}
                              </span>
                              <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full ${
                                app.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {app.status}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Created: {app.createdDate} • Rate limit: {app.rateLimit} req/min</span>
                          </div>

                          {/* Quick Admin Actions */}
                          <div className="flex items-center gap-1.5">
                            <button title="Edit item" 
                              onClick={() => {
                                setEditingApp(editingApp?.id === app.id ? null : app);
                              }}
                              className={`text-[10.5px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                                editingApp?.id === app.id
                                  ? 'bg-indigo-600 border-indigo-600 text-white'
                                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                              }`}
                            >
                              Checklist Scopes
                            </button>
                            <button title="Perform action" 
                              onClick={() => handleToggleAppStatus(app.id)}
                              className={`text-[10.5px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                                app.status === 'active'
                                  ? 'bg-amber-50 border-amber-100 text-amber-700 hover:bg-amber-100'
                                  : 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100'
                              }`}
                            >
                              {app.status === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                            <button 
                              onClick={() => handleDeleteApp(app.id)}
                              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Revoke key permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Credentials box */}
                        <div className="bg-slate-50 rounded-xl border border-slate-200/60 p-3 space-y-2 text-[11px] font-mono text-slate-700">
                          <div className="flex items-center justify-between gap-2.5">
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-[9.5px] font-bold text-slate-400 font-sans tracking-wide uppercase">Client ID</span>
                            </div>
                            <div className="flex items-center gap-1.5 overflow-hidden">
                              <span className="bg-white px-1.5 py-0.5 rounded border border-slate-150 text-slate-800 font-semibold truncate select-all">{app.clientId}</span>
                              <button title="Copy address to clipboard" 
                                onClick={() => handleCopyText(app.clientId, `${app.id}_id`)}
                                className="text-indigo-600 hover:text-indigo-800 shrink-0 p-1 cursor-pointer"
                              >
                                {copiedKey === `${app.id}_id` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2.5 border-t border-slate-100 pt-2">
                            <div className="flex items-center gap-1.5 shrink-0">
                              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-[9.5px] font-bold text-slate-400 font-sans tracking-wide uppercase">Client Secret</span>
                            </div>
                            <div className="flex items-center gap-1.5 overflow-hidden">
                              <span className="bg-white px-1.5 py-0.5 rounded border border-slate-150 text-slate-800 font-semibold truncate">
                                {isSecretVisible ? app.clientSecret : '••••••••••••••••••••••••••••••••'}
                              </span>
                              <button title="Copy address to clipboard" 
                                onClick={() => toggleSecretVisibility(app.id)}
                                className="text-slate-400 hover:text-slate-600 shrink-0 p-1 cursor-pointer"
                              >
                                {isSecretVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                              <button title="Copy address to clipboard" 
                                onClick={() => handleCopyText(app.clientSecret, `${app.id}_secret`)}
                                className="text-indigo-600 hover:text-indigo-800 shrink-0 p-1 cursor-pointer"
                              >
                                {copiedKey === `${app.id}_secret` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Scopes badge list */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider font-sans">Enabled Scopes:</span>
                          {app.scopes.length === 0 ? (
                            <span className="text-[9.5px] font-bold text-rose-500 italic bg-rose-50 px-2 py-0.5 rounded">No features enabled (Request blocked)</span>
                          ) : (
                            app.scopes.map(s => (
                              <span key={s} className="text-[9.5px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                                {s}
                              </span>
                            ))
                          )}
                        </div>

                        {/* Expanded editing checklist in-place */}
                        {editingApp?.id === app.id && (
                          <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-indigo-150 space-y-3.5 animate-fade-in">
                            <div className="flex justify-between items-center">
                              <div>
                                <h6 className="text-[11.5px] font-black text-slate-800">Checklist Control: Granular Scopes for {app.name}</h6>
                                <p className="text-[10px] text-slate-500">Enable or disable specific features dynamically for this client credential.</p>
                              </div>
                              <button title="Edit item" 
                                onClick={() => setEditingApp(null)}
                                className="text-[10px] font-bold bg-white text-slate-700 border border-slate-200 px-2 py-1 rounded hover:bg-slate-50 cursor-pointer"
                              >
                                Done
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[180px] overflow-y-auto">
                              {AVAILABLE_SCOPES.map(scope => {
                                const isChecked = editingApp.scopes.includes(scope.key);
                                return (
                                  <label 
                                    key={scope.key} 
                                    className={`flex items-start gap-2.5 p-2 rounded-lg border transition-all cursor-pointer ${
                                      isChecked 
                                        ? 'bg-indigo-50/60 border-indigo-200' 
                                        : 'bg-white border-slate-200 hover:border-slate-300'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => handleScopeChecklistToggle(scope.key, true)}
                                      className="w-3.5 h-3.5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 mt-0.5"
                                    />
                                    <div className="space-y-0.2">
                                      <span className="text-[11px] font-extrabold text-slate-800 block leading-tight">{scope.label}</span>
                                      <span className="text-[8.5px] font-mono font-bold text-slate-400 block font-mono">{scope.key}</span>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Quick Integration Guidance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-1.5">
              <span className="text-[20px]">📊</span>
              <h5 className="text-[11.5px] font-black text-slate-800 uppercase">Xero Connect</h5>
              <p className="text-[10.5px] text-slate-500 leading-normal">
                Enable <strong>accounts:read/write</strong> scopes. Xero can download invoice data and upload client tax ledgers dynamically.
              </p>
            </div>
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-1.5">
              <span className="text-[20px]">⚡</span>
              <h5 className="text-[11.5px] font-black text-slate-800 uppercase">Sage Ledger</h5>
              <p className="text-[10.5px] text-slate-500 leading-normal">
                Configure <strong>orders:read</strong> and <strong>accounts:write</strong>. Push multi-channel sales ledgers directly to Sage.
              </p>
            </div>
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-1.5">
              <span className="text-[20px]">🔌</span>
              <h5 className="text-[11.5px] font-black text-slate-800 uppercase">QuickBooks</h5>
              <p className="text-[10.5px] text-slate-500 leading-normal">
                Requires <strong>inventory:read</strong> and <strong>orders:read/write</strong>. Instantly updates stock buffers across lines.
              </p>
            </div>
          </div>

        </div>

        {/* Right Col: Sandbox Playground (5 columns) */}
        <div className="xl:col-span-5 space-y-6">
          
          <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-lg overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400 animate-pulse" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">Developer API Sandbox</h4>
              </div>
              <span className="text-[9px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded-full border border-indigo-500/30">
                Connection Simulator
              </span>
            </div>

            {/* Config panel inside terminal */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 space-y-4">
              {/* App selector */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">1. Select Auth Application</label>
                <select
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
                >
                  {apps.map(app => (
                    <option key={app.id} value={app.id}>
                      {app.name} ({app.status === 'active' ? 'Active' : 'Suspended'})
                    </option>
                  ))}
                  <option value="invalid_key">❌ Bad / Tampered API Client Key</option>
                </select>
              </div>

              {/* Endpoint Selector */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">2. Choose API Endpoint</label>
                <select
                  value={selectedEndpointPath}
                  onChange={(e) => setSelectedEndpointPath(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                >
                  {API_ENDPOINTS.map(ep => (
                    <option key={ep.path} value={ep.path}>
                      {ep.path} ({ep.scope})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 italic">
                  {API_ENDPOINTS.find(ep => ep.path === selectedEndpointPath)?.description}
                </p>
              </div>

              {/* Action trigger */}
              <button title="Execute RunSandboxRequest"
                type="button"
                onClick={handleRunSandboxRequest}
                disabled={sandboxLoading || apps.length === 0}
                className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                {sandboxLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Executing Secure Handshake...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Send Sandbox Request</span>
                  </>
                )}
              </button>
            </div>

            {/* Console logs */}
            <div className="p-3 bg-slate-950 font-mono text-[11px] space-y-1 border-b border-slate-900 max-h-[140px] overflow-y-auto scrollbar-none">
              {sandboxLogs.map((log, index) => {
                const isError = log.includes('❌') || log.includes('⛔') || log.includes('Access Denied');
                const isSuccess = log.includes('✅') || log.includes('success');
                return (
                  <div 
                    key={index} 
                    className={`${
                      isError ? 'text-rose-400 font-semibold' : 
                      isSuccess ? 'text-emerald-400 font-semibold' : 
                      'text-slate-400'
                    }`}
                  >
                    {log}
                  </div>
                );
              })}
            </div>

            {/* JSON Response frame */}
            <div className="p-4 bg-slate-950 font-mono space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-500">API Response Payload</span>
                {sandboxStatus && (
                  <div className="flex items-center gap-2">
                    {sandboxLatency && (
                      <span className="text-[9.5px] text-slate-500">{sandboxLatency}ms latency</span>
                    )}
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      sandboxStatus === 200 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                      sandboxStatus === 403 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      HTTP {sandboxStatus} {sandboxStatus === 200 ? 'OK' : sandboxStatus === 403 ? 'Forbidden' : 'Unauthorized'}
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-[11px] leading-relaxed text-indigo-300 overflow-x-auto max-h-[280px]">
                {sandboxResponse ? (
                  <pre className="whitespace-pre">{JSON.stringify(sandboxResponse, null, 2)}</pre>
                ) : (
                  <div className="text-center py-10 text-slate-500 select-none">
                    <Terminal className="w-8 h-8 text-slate-700 mx-auto mb-2 animate-bounce" />
                    <span>Waiting for active request execution...</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-600 border-t border-slate-900 pt-3">
                <span>Method: JSON REST API</span>
                <span>Version: v1.0.4 (Active)</span>
              </div>
            </div>
          </div>

          {/* Rate limiting note card */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-xs space-y-2 text-indigo-950">
            <h5 className="font-extrabold flex items-center gap-1.5">
              <Info className="w-4 h-4 text-indigo-600" />
              Developer API Rate-Limiting Controls
            </h5>
            <p className="leading-relaxed text-[11px] text-indigo-900">
              Each generated developer token includes active rate-limiting counters. If a connected app (like Xero or QuickBooks) breaches their configured threshold (e.g. 60 requests per minute), the API gateway immediately issues HTTP 429 Too Many Requests. Scopes checklist controls allow administrators to throttle each third-party tool separately.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
