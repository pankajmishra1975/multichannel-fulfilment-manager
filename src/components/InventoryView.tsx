import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { 
  Database, AlertTriangle, Plus, Minus, Check, TrendingUp, RefreshCw, 
  Sliders, Package, Boxes, Search, Filter, ArrowRight, ArrowDownRight, 
  ArrowUpRight, AlertCircle, History, BarChart3, Settings, Download,
  ArrowUpDown, MoreVertical, LayoutGrid
} from 'lucide-react';

interface InventoryViewProps {
  products: Product[];
  inventoryThreshold: number;
  onUpdateThreshold: (threshold: number) => Promise<void>;
  onSyncProducts: (channel: 'all' | 'amazon' | 'ebay') => Promise<void>;
  onUpdateProduct: (productDetails: any) => Promise<void>;
  currency: string;
  unitSystem: 'metric' | 'imperial';
}

export default function InventoryView({
  products,
  inventoryThreshold,
  onUpdateThreshold,
  onSyncProducts,
  onUpdateProduct,
  currency,
  unitSystem
}: InventoryViewProps) {
  const [editingThreshold, setEditingThreshold] = useState<string>(String(inventoryThreshold));
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'stock' | 'movements' | 'settings'>('overview');
  
  // Table filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low' | 'out' | 'healthy'>('all');
  const [sortBy, setSortBy] = useState<'sku' | 'stock' | 'value'>('stock');
  const [sortAsc, setSortAsc] = useState(false);

  const getCurrencySymbol = (code: string) => {
    switch (code.toUpperCase()) {
      case 'GBP': return '£';
      case 'EUR': return '€';
      case 'JPY': return '¥';
      case 'CAD': return '$';
      default: return '$';
    }
  };

  const curr = getCurrencySymbol(currency);

  // Compute stats
  const totalSkuCount = products.length;
  const totalItems = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const outOfStockCount = products.filter(p => (p.stock || 0) === 0).length;
  const lowStockCount = products.filter(p => p.stock !== undefined && p.stock <= inventoryThreshold && p.stock > 0).length;
  const healthyStockCount = products.filter(p => p.stock !== undefined && p.stock > inventoryThreshold).length;

  const totalValuation = products.reduce((sum, p) => {
    const cost = (p.sellingPrice || 19.99) * 0.55;
    return sum + (cost * (p.stock || 0));
  }, 0);

  const handleSaveThreshold = async () => {
    const val = parseInt(editingThreshold, 10);
    if (!isNaN(val) && val >= 0) {
      await onUpdateThreshold(val);
      showTemporarySuccess('Threshold configuration saved successfully.');
    }
  };

  const handleStockAdjust = async (product: Product, diff: number) => {
    setUpdatingId(product.sku);
    try {
      const currentStock = product.stock || 0;
      const nextStock = Math.max(0, currentStock + diff);
      await onUpdateProduct({
        sku: product.sku,
        stock: nextStock
      });
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSyncClick = async (channel: 'all' | 'amazon' | 'ebay') => {
    setSyncing(true);
    try {
      await onSyncProducts(channel);
      showTemporarySuccess(`Inventory sync with ${channel} API finished.`);
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  const showTemporarySuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg(null);
    }, 3500);
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
      
      const stock = p.stock || 0;
      if (statusFilter === 'out' && stock !== 0) return false;
      if (statusFilter === 'low' && (stock === 0 || stock > inventoryThreshold)) return false;
      if (statusFilter === 'healthy' && stock <= inventoryThreshold) return false;
      
      return true;
    });

    result.sort((a, b) => {
      let valA, valB;
      if (sortBy === 'sku') {
        valA = a.sku;
        valB = b.sku;
      } else if (sortBy === 'stock') {
        valA = a.stock || 0;
        valB = b.stock || 0;
      } else {
        valA = (a.stock || 0) * (a.sellingPrice * 0.55);
        valB = (b.stock || 0) * (b.sellingPrice * 0.55);
      }
      
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return result;
  }, [products, searchTerm, statusFilter, sortBy, sortAsc, inventoryThreshold]);

  const toggleSort = (field: 'sku' | 'stock' | 'value') => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(false);
    }
  };

  // Mock movements for the movements tab
  const mockMovements = useMemo(() => {
    return products.slice(0, 15).map((p, i) => ({
      id: `MOV-${1000 + i}`,
      date: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      sku: p.sku,
      name: p.name,
      type: Math.random() > 0.6 ? 'RESTOCK' : Math.random() > 0.3 ? 'SALE' : 'ADJUSTMENT',
      qty: Math.floor(Math.random() * 50) + 1,
      user: Math.random() > 0.5 ? 'System' : 'Admin User'
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [products]);

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden" id="inventory-view-pane">
      
      {/* Top Header & Navigation */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-indigo-600" />
            Inventory Control
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage stock levels, valuations, and sync across sales channels.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'overview' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'stock' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Stock Manager
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'movements' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Movements
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'settings' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Settings
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="mx-6 mt-4 bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-emerald-800 text-sm font-medium flex items-center gap-2 shadow-sm animate-fade-in shrink-0">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-6">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-sm font-medium">Total Inventory Value</span>
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div className="text-3xl font-bold text-slate-800 tracking-tight">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, maximumFractionDigits: 0 }).format(totalValuation)}
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-600 mt-2 font-medium">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>2.4% from last month</span>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-sm font-medium">Total Items in Stock</span>
                  <Package className="w-4 h-4" />
                </div>
                <div className="text-3xl font-bold text-slate-800 tracking-tight">
                  {totalItems.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  Across {totalSkuCount} unique SKUs
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-bl-full -z-10" />
                <div className="flex items-center justify-between text-amber-600 mb-2">
                  <span className="text-sm font-medium">Low Stock Alerts</span>
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="text-3xl font-bold text-amber-600 tracking-tight">
                  {lowStockCount}
                </div>
                <div className="text-xs text-amber-700/70 mt-2">
                  Items below {inventoryThreshold} units
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-rose-50 rounded-bl-full -z-10" />
                <div className="flex items-center justify-between text-rose-600 mb-2">
                  <span className="text-sm font-medium">Out of Stock</span>
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="text-3xl font-bold text-rose-600 tracking-tight">
                  {outOfStockCount}
                </div>
                <div className="text-xs text-rose-700/70 mt-2">
                  Items requiring immediate restock
                </div>
              </div>
            </div>

            {/* Quick Actions & Stock Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-base font-bold text-slate-800 mb-4">Stock Status Distribution</h3>
                <div className="h-6 w-full rounded-full overflow-hidden flex mb-4">
                  <div style={{ width: `${(healthyStockCount/totalSkuCount)*100}%` }} className="bg-emerald-500 h-full" title="Healthy" />
                  <div style={{ width: `${(lowStockCount/totalSkuCount)*100}%` }} className="bg-amber-400 h-full" title="Low Stock" />
                  <div style={{ width: `${(outOfStockCount/totalSkuCount)*100}%` }} className="bg-rose-500 h-full" title="Out of Stock" />
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-slate-600">Healthy ({healthyStockCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <span className="text-slate-600">Low Stock ({lowStockCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="text-slate-600">Out of Stock ({outOfStockCount})</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-center">
                <h3 className="text-base font-bold text-slate-800 mb-4">Quick Sync</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => handleSyncClick('amazon')}
                    disabled={syncing}
                    className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg" alt="Amazon" className="w-5 h-5" />
                      Sync Amazon FBA
                    </div>
                    <RefreshCw className={`w-4 h-4 text-slate-400 ${syncing ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={() => handleSyncClick('ebay')}
                    disabled={syncing}
                    className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 flex items-center justify-center font-bold text-blue-600 bg-white rounded shadow-sm text-xs">e</div>
                      Sync eBay Listings
                    </div>
                    <RefreshCw className={`w-4 h-4 text-slate-400 ${syncing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STOCK MANAGER TAB */}
        {activeTab === 'stock' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-full max-h-[800px]">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 rounded-t-xl">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search SKU or Name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-64"
                  />
                </div>
                <div className="relative">
                  <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="pl-9 pr-8 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white min-w-[140px]"
                  >
                    <option value="all">All Status</option>
                    <option value="healthy">Healthy</option>
                    <option value="low">Low Stock</option>
                    <option value="out">Out of Stock</option>
                  </select>
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-sm border-collapse min-w-[800px]">
                <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="py-3 px-4 font-semibold text-slate-600 border-b border-slate-200 cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('sku')}>
                      <div className="flex items-center gap-2">
                        Product Details
                        {sortBy === 'sku' && <ArrowUpDown className="w-3 h-3" />}
                      </div>
                    </th>
                    <th className="py-3 px-4 font-semibold text-slate-600 border-b border-slate-200">
                      Status
                    </th>
                    <th className="py-3 px-4 font-semibold text-slate-600 border-b border-slate-200 cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('stock')}>
                      <div className="flex items-center justify-center gap-2">
                        Quantity In Stock
                        {sortBy === 'stock' && <ArrowUpDown className="w-3 h-3" />}
                      </div>
                    </th>
                    <th className="py-3 px-4 font-semibold text-slate-600 border-b border-slate-200 text-right cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('value')}>
                      <div className="flex items-center justify-end gap-2">
                        Est. Value
                        {sortBy === 'value' && <ArrowUpDown className="w-3 h-3" />}
                      </div>
                    </th>
                    <th className="py-3 px-4 font-semibold text-slate-600 border-b border-slate-200 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500">
                        <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-base font-medium text-slate-700">No products found</p>
                        <p className="text-sm mt-1">Try adjusting your search or filter settings.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const stock = p.stock || 0;
                      const isLow = stock <= inventoryThreshold && stock > 0;
                      const isOutOfStock = stock === 0;
                      const val = stock * (p.sellingPrice * 0.55);
                      
                      // Visual bar calculation (cap at 100% based on an arbitrary "healthy" max e.g. threshold * 5)
                      const maxHealthy = Math.max(inventoryThreshold * 5, 50);
                      const barWidth = Math.min(100, (stock / maxHealthy) * 100);

                      return (
                        <tr key={p.sku} className={`hover:bg-slate-50 transition-colors ${isOutOfStock ? 'bg-rose-50/30' : ''}`}>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-100 rounded border border-slate-200 flex items-center justify-center shrink-0">
                                {p.images && p.images[0] ? (
                                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover rounded" />
                                ) : (
                                  <LayoutGrid className="w-5 h-5 text-slate-400" />
                                )}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-800 line-clamp-1">{p.name}</div>
                                <div className="text-xs font-mono text-slate-500 mt-0.5">{p.sku}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {isOutOfStock ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                Out of Stock
                              </span>
                            ) : isLow ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                Low Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Healthy
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col items-center max-w-[160px] mx-auto gap-2">
                              <div className="flex items-center justify-between w-full bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                                <button
                                  onClick={() => handleStockAdjust(p, -1)}
                                  disabled={updatingId === p.sku}
                                  className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded hover:text-slate-700 disabled:opacity-50 transition-colors"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className={`font-mono font-bold text-base w-12 text-center ${isOutOfStock ? 'text-rose-600' : 'text-slate-800'}`}>
                                  {stock}
                                </span>
                                <button
                                  onClick={() => handleStockAdjust(p, 1)}
                                  disabled={updatingId === p.sku}
                                  className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded hover:text-slate-700 disabled:opacity-50 transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${isOutOfStock ? 'bg-transparent' : isLow ? 'bg-amber-400' : 'bg-emerald-500'}`}
                                  style={{ width: `${barWidth}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-slate-700">
                            {curr}{val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination / Footer (Mocked) */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-sm text-slate-600 rounded-b-xl">
              <div>Showing {filteredProducts.length} of {products.length} products</div>
              <div className="flex gap-1">
                <button className="px-3 py-1 border border-slate-300 rounded bg-white hover:bg-slate-50 disabled:opacity-50" disabled>Previous</button>
                <button className="px-3 py-1 border border-slate-300 rounded bg-white hover:bg-slate-50 disabled:opacity-50" disabled>Next</button>
              </div>
            </div>
          </div>
        )}

        {/* MOVEMENTS TAB */}
        {activeTab === 'movements' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden max-w-5xl mx-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Inventory Movement Log</h2>
                <p className="text-sm text-slate-500">History of stock additions, sales deductions, and manual adjustments.</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                <Download className="w-4 h-4" />
                Export Log
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="py-3 px-6 font-semibold text-slate-600 border-b border-slate-200">Date & Time</th>
                    <th className="py-3 px-6 font-semibold text-slate-600 border-b border-slate-200">Event ID</th>
                    <th className="py-3 px-6 font-semibold text-slate-600 border-b border-slate-200">Product</th>
                    <th className="py-3 px-6 font-semibold text-slate-600 border-b border-slate-200">Type</th>
                    <th className="py-3 px-6 font-semibold text-slate-600 border-b border-slate-200 text-right">Qty Change</th>
                    <th className="py-3 px-6 font-semibold text-slate-600 border-b border-slate-200">Source/User</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {mockMovements.map((mov) => (
                    <tr key={mov.id} className="hover:bg-slate-50">
                      <td className="py-3 px-6 text-slate-600 whitespace-nowrap">
                        {new Date(mov.date).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-6 font-mono text-xs text-slate-500">{mov.id}</td>
                      <td className="py-3 px-6">
                        <div className="font-medium text-slate-800">{mov.name}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{mov.sku}</div>
                      </td>
                      <td className="py-3 px-6">
                        {mov.type === 'RESTOCK' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">Restock</span>
                        ) : mov.type === 'SALE' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">Sale</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">Adjustment</span>
                        )}
                      </td>
                      <td className={`py-3 px-6 text-right font-mono font-bold ${mov.type === 'SALE' ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {mov.type === 'SALE' ? '-' : '+'}{mov.qty}
                      </td>
                      <td className="py-3 px-6 text-slate-600">{mov.user}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                  <Sliders className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-slate-800">Low Stock Alert Threshold</h2>
                  <p className="text-sm text-slate-500 mt-1 mb-4">
                    Set the global minimum quantity before a product is flagged as "Low Stock". This triggers dashboard alerts and can be used for reorder reports.
                  </p>
                  
                  <div className="flex items-center gap-3">
                    <div className="relative w-32">
                      <input
                        type="number"
                        min="0"
                        value={editingThreshold}
                        onChange={(e) => setEditingThreshold(e.target.value)}
                        className="w-full pl-4 pr-8 py-2 border border-slate-300 rounded-lg text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">units</span>
                    </div>
                    <button
                      onClick={handleSaveThreshold}
                      className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium rounded-lg transition-colors"
                    >
                      Save Configuration
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                  <Database className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-slate-800">API Synchronization</h2>
                  <p className="text-sm text-slate-500 mt-1 mb-4">
                    Manually force a two-way sync with your connected marketplace channels. This updates your local stock numbers from remote FBA or eBay warehouses.
                  </p>
                  
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleSyncClick('amazon')}
                      disabled={syncing}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70"
                    >
                      <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                      Sync with Amazon FBA
                    </button>
                    <button
                      onClick={() => handleSyncClick('ebay')}
                      disabled={syncing}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70"
                    >
                      <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                      Sync with eBay
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

