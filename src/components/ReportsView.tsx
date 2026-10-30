import React, { useState } from 'react';
import { Order, Product } from '../types';
import AiOrdersDashboardView from './AiOrdersDashboardView';
import AiProductsDashboardView from './AiProductsDashboardView';
import { FileText, Package, ShoppingBag } from 'lucide-react';

interface ReportsViewProps {
  currency: string;
  orders: Order[];
  products: Product[];
}

export default function ReportsView({ orders, products, currency }: ReportsViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'products'>('orders');

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden" id="reports-view-container">
      {/* Reports Header / Sub-nav */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-2 text-slate-800">
          <FileText className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold">Reports & AI Dashboards</h2>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveSubTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              activeSubTab === 'orders' 
                ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Orders Stats
          </button>
          <button
            onClick={() => setActiveSubTab('products')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              activeSubTab === 'products' 
                ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Package className="w-4 h-4" />
            Products Stats
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeSubTab === 'orders' ? (
          <AiOrdersDashboardView orders={orders} currency={currency} />
        ) : (
          <AiProductsDashboardView products={products} currency={currency} />
        )}
      </div>
    </div>
  );
}
