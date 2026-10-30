import React from 'react';
import { Order, Product, ActivityLog } from '../types';
import { 
  TrendingUp, 
  ShoppingBag, 
  CheckCircle, 
  AlertTriangle, 
  Package, 
  Activity, 
  Truck, 
  ArrowRight,
  Globe,
  Database
} from 'lucide-react';

interface DashboardViewProps {
  orders: Order[];
  products: Product[];
  logs: ActivityLog[];
  inventoryThreshold: number;
  onTabChange: (tab: 'dashboard' | 'orders' | 'products' | 'inventory' | 'shipping' | 'integrations' | 'reports' | 'settings') => void;
  onSyncAll: () => void;
  currency?: string;
}

export default function DashboardView({
  orders,
  products,
  logs,
  inventoryThreshold,
  onTabChange,
  onSyncAll,
  currency = 'USD'
}: DashboardViewProps) {
  const totalCount = orders.length;
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const shippedCount = orders.filter(o => o.status === 'shipped').length;
  const amazonCount = orders.filter(o => o.source === 'amazon').length;
  const ebayCount = orders.filter(o => o.source === 'ebay').length;

  const lowStockProducts = products.filter(p => p.stock !== undefined && p.stock <= inventoryThreshold);
  const missingSpecsCount = orders.filter(o => o.status === 'pending' && (!o.weightOz || !o.dimensions)).length;

  // Compute average shipping cost
  const shippedOrdersWithRates = orders.filter(o => o.status === 'shipped' && o.selectedRate);
  const totalShippingCost = shippedOrdersWithRates.reduce((sum, o) => sum + (o.selectedRate?.amount || 0), 0);
  const averageShippingCost = shippedOrdersWithRates.length > 0 
    ? totalShippingCost / shippedOrdersWithRates.length 
    : 0;

  // Calculate fulfillment completion rate
  const fulfillmentRate = totalCount > 0 ? Math.round((shippedCount / totalCount) * 100) : 0;

  // Sample recent activity logs
  const recentLogs = logs.slice(0, 4);

  return (
    <div className="space-y-6" id="dashboard-view-container">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider font-extrabold">
              Control Center Live
            </span>
            <h2 className="text-2xl font-black tracking-tight font-sans">
              Welcome back, Sellershub Dispatcher
            </h2>
            <p className="text-xs text-slate-300">
              Gateway connection online. Ready to optimize multi-channel postage rates and catalog entries.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onSyncAll}
              title="Force sync data from all connected channels"
              className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-500/10 flex items-center gap-1.5 shrink-0"
              id="dash-sync-both-btn"
            >
              <Activity className="w-3.5 h-3.5" />
              Sync Channels
            </button>
            <button 
              onClick={() => onTabChange('orders')}
              title="Navigate to the Orders Fulfillment Deck"
              className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0"
              id="dash-go-orders-btn"
            >
              Fulfillment Deck
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="dash-metrics-grid">
        {/* Stat: Pipeline Completion */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Fulfillment Health</span>
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded">
              {fulfillmentRate}% Done
            </span>
          </div>
          <div className="my-3">
            <span className="text-3xl font-black text-slate-900 block tracking-tight">
              {shippedCount} / {totalCount}
            </span>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2 border border-slate-200/50">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${fulfillmentRate}%` }}
              ></div>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 block font-medium">
            Pending orders waiting for shipment: <strong className="text-slate-700 font-bold">{pendingCount}</strong>
          </span>
        </div>

        {/* Stat: High-Priority Incomplete Specs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Action Required</span>
            {missingSpecsCount > 0 ? (
              <span className="bg-amber-50 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                Incomplete Specs
              </span>
            ) : (
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                All Cleared
              </span>
            )}
          </div>
          <div className="my-3">
            <span className="text-3xl font-black text-slate-900 block tracking-tight">
              {missingSpecsCount} Orders
            </span>
            <p className="text-xs text-slate-500 mt-1 leading-normal">
              Need weights & custom box dimensions updated to fetch carrier rates.
            </p>
          </div>
          {missingSpecsCount > 0 ? (
            <button  
              onClick={() => onTabChange('orders')}
              title="Navigate to orders to resolve missing specifications"
              className="text-[10px] font-bold text-amber-600 hover:text-amber-700 text-left flex items-center gap-1 mt-1"
            >
              Update missing specs now <ArrowRight className="w-3 h-3" />
            </button>
          ) : (
            <span className="text-[10px] text-slate-400 block font-medium">Ready to buy postage labels.</span>
          )}
        </div>

        {/* Stat: Low Stock Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Inventory Warning</span>
            {lowStockProducts.length > 0 ? (
              <span className="bg-rose-50 text-rose-700 text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                {lowStockProducts.length} Critical SKU
              </span>
            ) : (
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                Sufficient Stock
              </span>
            )}
          </div>
          <div className="my-3">
            <span className="text-3xl font-black text-slate-900 block tracking-tight">
              {lowStockProducts.length} Items
            </span>
            <p className="text-xs text-slate-500 mt-1 leading-normal">
              Products with stock level below threshold level of <strong className="text-slate-800">{inventoryThreshold} units</strong>.
            </p>
          </div>
          {lowStockProducts.length > 0 ? (
            <button  
              onClick={() => onTabChange('inventory')}
              title="Navigate to inventory to view low stock products"
              className="text-[10px] font-bold text-rose-600 hover:text-rose-700 text-left flex items-center gap-1 mt-1"
            >
              Review stock shortage <ArrowRight className="w-3 h-3" />
            </button>
          ) : (
            <span className="text-[10px] text-slate-400 block font-medium">All item levels are healthy.</span>
          )}
        </div>

        {/* Stat: Average Shipping Cost */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Average Postage Rate</span>
            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded">
              Label Cost
            </span>
          </div>
          <div className="my-3">
            <span className="text-3xl font-black text-slate-900 block tracking-tight">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(averageShippingCost)}
            </span>
            <p className="text-xs text-slate-500 mt-1 leading-normal">
              Based on {shippedOrdersWithRates.length} shipped items with successful carrier calculations.
            </p>
          </div>
          <span className="text-[10px] text-slate-400 block font-medium">
            Postage strategy optimized.
          </span>
        </div>
      </div>

      {/* Analytics & Connection Health Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Marketplace Performance Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 lg:col-span-2">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600" />
              Channel Sales Metrics Summary
            </h3>
            <p className="text-xs text-slate-500">Breakdown of orders synced across Amazon and eBay merchant APIs</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Amazon Progress */}
            <div className="border border-slate-100 p-4 rounded-xl bg-slate-50/75 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-sm"></span>
                  Amazon Seller Central
                </span>
                <span className="font-mono font-bold text-slate-600">{amazonCount} Orders</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${totalCount > 0 ? (amazonCount / totalCount) * 100 : 0}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400">
                {totalCount > 0 ? Math.round((amazonCount / totalCount) * 100) : 0}% of multi-channel orders volume.
              </p>
            </div>

            {/* eBay Progress */}
            <div className="border border-slate-100 p-4 rounded-xl bg-slate-50/75 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-blue-600 rounded-sm"></span>
                  eBay Developer REST
                </span>
                <span className="font-mono font-bold text-slate-600">{ebayCount} Orders</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full"
                  style={{ width: `${totalCount > 0 ? (ebayCount / totalCount) * 100 : 0}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400">
                {totalCount > 0 ? Math.round((ebayCount / totalCount) * 100) : 0}% of multi-channel orders volume.
              </p>
            </div>
          </div>

          {/* SVG Multi-Channel orders visualizer */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Postal Savings Target</span>
              <p className="text-xs font-semibold text-slate-800 leading-normal">
                Consolidating identical buyers addresses can save up to 45% on shipping weights.
              </p>
            </div>
            
            {/* SVG Visual gauge */}
            <div className="shrink-0 flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="#cbd5e1" strokeWidth="6" fill="transparent" />
                <circle 
                  cx="32" 
                  cy="32" 
                  r="28" 
                  stroke="#10b981" 
                  strokeWidth="6" 
                  fill="transparent" 
                  strokeDasharray={175.9} 
                  strokeDashoffset={175.9 - (175.9 * fulfillmentRate) / 100}
                />
              </svg>
              <span className="absolute font-mono text-xs font-black text-slate-800">{fulfillmentRate}%</span>
            </div>
          </div>
        </div>

        {/* Live Logs Terminal Ticker */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                API Connection Logs
              </h3>
              <span className="text-[8px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase font-bold">
                Online
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mb-4">Latest real-time connections from carrier APIs & Amazon SP-API webhooks</p>

            <div className="space-y-3 font-mono text-[10px] max-h-[160px] overflow-y-auto">
              {recentLogs.map((log) => {
                const isError = log.level === 'error';
                const isWarn = log.level === 'warn';
                return (
                  <div key={log.id} className="border-b border-slate-900 pb-2.5 last:border-b-0 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-600 text-[9px]">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                      <span className="text-indigo-400 font-extrabold uppercase text-[8px] tracking-wide bg-indigo-950 px-1.5 py-0.2 rounded border border-indigo-900/35">
                        {log.source.replace('_', '-')}
                      </span>
                    </div>
                    <p className={`leading-normal ${isError ? 'text-rose-400 font-bold' : isWarn ? 'text-amber-400' : 'text-slate-300'}`}>
                      {log.message}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <button 
            onClick={() => onTabChange('settings')}
            title="Navigate to Settings to manage sandbox configuration"
            className="w-full text-center text-slate-500 hover:text-slate-300 text-[10px] font-semibold tracking-wide border-t border-slate-900 pt-3.5 block"
          >
            Manage Simulator Configurations
          </button>
        </div>
      </div>

      {/* Quick Access Portal Panel */}
      <div className="space-y-3" id="dash-quick-access">
        <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Interactive Portals</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Deck */}
          <button  
            onClick={() => onTabChange('orders')}
            title="Open Orders Fulfillment Deck"
            className="bg-white hover:bg-slate-50 border border-slate-200 p-4 rounded-xl text-left transition-all hover:border-slate-300 flex items-start gap-3"
          >
            <div className="bg-orange-50 text-orange-600 p-2 rounded-lg">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-extrabold text-slate-800">Orders Fulfillment Deck</h4>
              <p className="text-[10px] text-slate-500">Calculate rates, buy postage labels, and process customer orders.</p>
            </div>
          </button>

          {/* Catalog */}
          <button  
            onClick={() => onTabChange('products')}
            title="Open Product Catalog Manager"
            className="bg-white hover:bg-slate-50 border border-slate-200 p-4 rounded-xl text-left transition-all hover:border-slate-300 flex items-start gap-3"
          >
            <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-extrabold text-slate-800">Product Catalog Manager</h4>
              <p className="text-[10px] text-slate-500">Add products, edit details, or optimize entries with Gemini AI specs generator.</p>
            </div>
          </button>

          {/* Forecasting */}
          <button  
            onClick={() => onTabChange('inventory')}
            title="Open Inventory Stock & Alerts view"
            className="bg-white hover:bg-slate-50 border border-slate-200 p-4 rounded-xl text-left transition-all hover:border-slate-300 flex items-start gap-3"
          >
            <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-extrabold text-slate-800">Inventory Stock & Alerts</h4>
              <p className="text-[10px] text-slate-500">Monitor stock levels, set warning thresholds, and update SKU quantites.</p>
            </div>
          </button>

          {/* Calculator */}
          <button  
            onClick={() => onTabChange('shipping')}
            title="Open Carrier Rates Simulator"
            className="bg-white hover:bg-slate-50 border border-slate-200 p-4 rounded-xl text-left transition-all hover:border-slate-300 flex items-start gap-3"
          >
            <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
              <Truck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-extrabold text-slate-800">Carrier Rates Simulator</h4>
              <p className="text-[10px] text-slate-500">Manually calculate box courier charges and packaging optimizations.</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
