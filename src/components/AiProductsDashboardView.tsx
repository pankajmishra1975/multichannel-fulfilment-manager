import React, { useState } from 'react';
import { Product } from '../types';
import { Search, Calendar, RefreshCcw, Info, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Props {
  products: Product[];
  currency: string;
}

export default function AiProductsDashboardView({ products, currency }: Props) {
  const [dateRange, setDateRange] = useState('1year');
  const [expandedData, setExpandedData] = useState<string | null>(null);

  // Mock data for charts
  const barData = [
    { date: '2021-11-01', ebay: 0, amazon: 0 },
    { date: '2021-12-01', ebay: 0, amazon: 0 },
    { date: '2022-01-01', ebay: 0, amazon: 0 },
    { date: '2022-02-01', ebay: 550, amazon: 10 },
    { date: '2022-03-01', ebay: 10, amazon: 5 },
    { date: '2022-04-01', ebay: 100, amazon: 20 },
    { date: '2022-05-01', ebay: 5, amazon: 2 },
    { date: '2022-06-01', ebay: 120, amazon: 10 },
    { date: '2022-07-01', ebay: 250, amazon: 15 },
    { date: '2022-08-01', ebay: 0, amazon: 0 },
    { date: '2022-09-01', ebay: 0, amazon: 0 },
    { date: '2022-10-01', ebay: 0, amazon: 0 },
  ];

  const pieColors = ['#4ade80', '#60a5fa', '#f472b6', '#a78bfa'];

  const channelData = [
    { name: 'amazon', value: 300 },
    { name: 'ebay', value: 700 },
  ];
  const manufactureData = [
    { name: 'Generic', value: 500 },
    { name: 'BrandA', value: 500 },
  ];
  const brandsData = [
    { name: 'BrandA', value: 1000 },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto">
      {/* Top Filter Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row items-center gap-4 sticky top-0 z-10 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full pl-9 pr-12 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">KQL</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2 text-sm border border-slate-300 rounded-md bg-white hover:bg-slate-50 cursor-pointer text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="today">Today</option>
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="1year">Last 1 year</option>
              <option value="custom">Custom Range...</option>
            </select>
            <Calendar className="w-4 h-4 text-blue-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
          {dateRange === 'custom' && (
            <div className="flex items-center gap-2">
              <input type="date" className="text-sm border border-slate-300 rounded-md px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none text-slate-600" />
              <span className="text-sm text-slate-500">to</span>
              <input type="date" className="text-sm border border-slate-300 rounded-md px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none text-slate-600" />
            </div>
          )}
          <button className="text-sm text-blue-600 font-medium hover:underline">Show dates</button>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm">
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Title Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex items-start gap-4">
          <div className="font-black text-2xl tracking-tighter text-slate-800 shrink-0">
            Sellershub<span className="text-orange-500">.io</span>
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-800">Products Realtime Stats</h2>
            <p className="text-sm text-slate-500 flex items-center gap-1.5">
              <Info className="w-4 h-4" />
              This dashboard contains Products Realtime Stats. You can view it, search it, and interact with the visualizations. For more information about Sellershub documentation, check our <a href="#" className="text-blue-600 hover:underline">docs</a>.
            </p>
          </div>
        </div>

        {/* Product Filters */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-700">Product Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Channels</label>
              <select className="w-full text-sm border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option>Select...</option>
                <option>ebay</option>
                <option>amazon</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Manufacture Name</label>
              <select className="w-full text-sm border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option>Select...</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">SKU</label>
              <select className="w-full text-sm border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option>Select...</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4 pt-2">
            <button className="text-sm text-slate-400 font-medium hover:text-blue-600">Apply changes</button>
            <button className="text-sm text-slate-400 font-medium hover:text-slate-700">Cancel changes</button>
            <button className="text-sm text-slate-400 font-medium hover:text-slate-700">Clear form</button>
          </div>
        </div>

        {/* Product Stats Chart */}
        <div 
          onClick={() => setExpandedData('product_stats')}
          className={`bg-white border ${expandedData === 'product_stats' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200'} rounded-lg p-6 shadow-sm space-y-4 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all`}
        >
          <h3 className="text-sm font-bold text-slate-700">Product Stats</h3>
          <div className="h-72 w-full pointer-events-none">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{fontSize: 10, fill: '#64748b'}} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis label={{ value: 'Count of records', angle: -90, position: 'insideLeft', style: {fontSize: 12, fill: '#475569'} }} tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} verticalAlign="top" align="right" />
                <Bar dataKey="ebay" stackId="a" fill="#4ade80" barSize={8} />
                <Bar dataKey="amazon" stackId="a" fill="#60a5fa" barSize={8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center text-xs text-slate-500">
            @timestamp per week
            <div className="text-[10px] text-blue-500 font-normal mt-1">Click to view data details</div>
          </div>
        </div>

        {/* KPI Accordions */}
        <div className="space-y-3 mt-8">
          <h3 className="text-sm font-bold text-slate-700 px-1">Performance Indicators</h3>

          {[
            { id: 'unique_products', title: 'Unique products', value: '1,367', color: 'text-slate-800' },
            { id: 'total_quantity', title: 'Total Quantity', value: '12,795', color: 'text-slate-800' },
            { id: 'sum_listing', title: 'Sum of Listing Qty', value: '12,635', color: 'text-slate-800' },
            { id: 'sum_selling', title: 'Sum of Selling Price', value: `${currency}10,212`, color: 'text-slate-800' },
            { id: 'total_stock', title: 'Total Stock Value', value: `${currency}14,350`, color: 'text-slate-800' },
            { id: 'sku_performance', title: 'SKU Performance', value: <>92.4<span className="text-sm">%</span></>, color: 'text-emerald-600' }
          ].map(kpi => {
            const isExpanded = expandedData === kpi.id;
            return (
              <div key={kpi.id} className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <div 
                  onClick={() => setExpandedData(isExpanded ? null : kpi.id)}
                  className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <h4 className="text-sm font-semibold text-slate-600">{kpi.title}</h4>
                  <div className="flex items-center gap-4">
                    <div className={`text-2xl font-light tracking-tight ${kpi.color}`}>{kpi.value}</div>
                    <div className={`transition-transform text-slate-400 ${isExpanded ? 'rotate-180' : ''}`}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t border-slate-200 p-4 bg-slate-50">
                    <div className="overflow-x-auto border border-slate-300 rounded-lg shadow-sm">
                      <table className="w-full text-xs text-left whitespace-nowrap">
                        <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-300">
                          <tr>
                            <th className="border-r border-slate-300 px-3 py-2 w-10 text-center">Row</th>
                            <th className="border-r border-slate-300 px-3 py-2">Category</th>
                            <th className="border-r border-slate-300 px-3 py-2 text-right">Value Count</th>
                            <th className="border-r border-slate-300 px-3 py-2 text-right">% of Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-300 text-slate-700 bg-white">
                          <tr className="hover:bg-blue-50">
                            <td className="border-r border-slate-300 px-3 py-1.5 text-center text-slate-400">1</td>
                            <td className="border-r border-slate-300 px-3 py-1.5 font-medium">{kpi.id === 'sku_performance' ? 'High Performers' : 'BrandA'}</td>
                            <td className="border-r border-slate-300 px-3 py-1.5 text-right">700</td>
                            <td className="border-r border-slate-300 px-3 py-1.5 text-right">70.0%</td>
                          </tr>
                          <tr className="hover:bg-blue-50">
                            <td className="border-r border-slate-300 px-3 py-1.5 text-center text-slate-400">2</td>
                            <td className="border-r border-slate-300 px-3 py-1.5 font-medium">{kpi.id === 'sku_performance' ? 'Low Performers' : 'BrandB'}</td>
                            <td className="border-r border-slate-300 px-3 py-1.5 text-right">300</td>
                            <td className="border-r border-slate-300 px-3 py-1.5 text-right">30.0%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Top/Least Sellers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-700">Top Sellers (Last 30 Days)</h4>
              <button className="text-[10px] text-blue-600 font-semibold uppercase hover:underline">View All</button>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3 font-medium">SKU / Product</th>
                    <th className="px-4 py-3 font-medium text-right">Qty Sold</th>
                    <th className="px-4 py-3 font-medium text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">SKU-AUDIO-001</div>
                      <div className="text-slate-500 truncate max-w-[150px]">Premium Wireless Headphones</div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-emerald-600">412</td>
                    <td className="px-4 py-3 text-right font-mono">{currency}12,350.00</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">SKU-HOME-045</div>
                      <div className="text-slate-500 truncate max-w-[150px]">Smart LED Bulb</div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-emerald-600">389</td>
                    <td className="px-4 py-3 text-right font-mono">{currency}3,890.00</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">SKU-GAMING-012</div>
                      <div className="text-slate-500 truncate max-w-[150px]">Mechanical Keyboard RGB</div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-emerald-600">245</td>
                    <td className="px-4 py-3 text-right font-mono">{currency}11,025.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-700">Least Sellers (Needs Attention)</h4>
              <button className="text-[10px] text-blue-600 font-semibold uppercase hover:underline">View All</button>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3 font-medium">SKU / Product</th>
                    <th className="px-4 py-3 font-medium text-right">Qty Sold</th>
                    <th className="px-4 py-3 font-medium text-right">Days on shelf</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">SKU-ACC-099</div>
                      <div className="text-slate-500 truncate max-w-[150px]">Obsolete Phone Case (Gen 1)</div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-rose-500">0</td>
                    <td className="px-4 py-3 text-right text-slate-500">184 days</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">SKU-CABLE-024</div>
                      <div className="text-slate-500 truncate max-w-[150px]">Micro USB 0.5m White</div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-rose-500">2</td>
                    <td className="px-4 py-3 text-right text-slate-500">120 days</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">SKU-MUG-005</div>
                      <div className="text-slate-500 truncate max-w-[150px]">Ceramic Mug - Out of Season</div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-rose-500">4</td>
                    <td className="px-4 py-3 text-right text-slate-500">95 days</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pie Charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            onClick={() => setExpandedData('channel')}
            className={`bg-white border ${expandedData === 'channel' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200'} rounded-lg p-6 shadow-sm cursor-pointer hover:border-blue-400 hover:shadow-md transition-all`}
          >
            <h4 className="text-xs font-semibold text-slate-500 mb-4">Channel</h4>
            <div className="h-48 relative pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={channelData} cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                    {channelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 text-[10px] text-slate-500 pb-2">
                {channelData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: pieColors[i]}}></div>
                    {d.name}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-[10px] text-center text-blue-500 mt-2">Click to view details</div>
          </div>
          <div 
            onClick={() => setExpandedData('manufacture')}
            className={`bg-white border ${expandedData === 'manufacture' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200'} rounded-lg p-6 shadow-sm cursor-pointer hover:border-blue-400 hover:shadow-md transition-all`}
          >
            <h4 className="text-xs font-semibold text-slate-500 mb-4">Manufacture</h4>
            <div className="h-48 relative pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={manufactureData} cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                    {manufactureData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[10px] text-center text-blue-500 mt-2">Click to view details</div>
          </div>
          <div 
            onClick={() => setExpandedData('brands')}
            className={`bg-white border ${expandedData === 'brands' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200'} rounded-lg p-6 shadow-sm cursor-pointer hover:border-blue-400 hover:shadow-md transition-all`}
          >
            <h4 className="text-xs font-semibold text-slate-500 mb-4">Brands</h4>
            <div className="h-48 relative pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={brandsData} cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                    {brandsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[10px] text-center text-blue-500 mt-2">Click to view details</div>
          </div>
        </div>

        {/* Expanded Data Table (Excel Style) */}
        {expandedData && !['unique_products', 'total_quantity', 'sum_listing', 'sum_selling', 'total_stock', 'sku_performance'].includes(expandedData) && (
          <div className="bg-white border border-slate-300 shadow-sm mt-6 mb-8 overflow-hidden rounded-lg">
            <div className="bg-slate-100 border-b border-slate-300 px-4 py-2 flex items-center justify-between">
              <h3 className="font-bold text-slate-700 text-sm">
                {expandedData === 'product_stats' ? 'Detailed Data: Product Stats' : 
                 expandedData === 'channel' ? 'Detailed Data: Channel Distribution' : 
                 expandedData === 'manufacture' ? 'Detailed Data: Manufacture' : 
                 expandedData === 'brands' ? 'Detailed Data: Brands' : 
                 expandedData === 'unique_products' ? 'Detailed Data: Unique Products' : 
                 expandedData === 'total_quantity' ? 'Detailed Data: Total Quantity' : 
                 expandedData === 'sum_listing' ? 'Detailed Data: Sum of Listing Quantity' : 
                 expandedData === 'sum_selling' ? 'Detailed Data: Sum of Selling Price' : 
                 expandedData === 'total_stock' ? 'Detailed Data: Total Stock Value' : 
                 expandedData === 'sku_performance' ? 'Detailed Data: SKU Performance' : 
                 'Detailed Data'}
              </h3>
              <button onClick={() => setExpandedData(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <div className="overflow-x-auto border border-slate-300">
                <table className="w-full text-xs text-left whitespace-nowrap">
                  <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-300">
                    <tr>
                      <th className="border-r border-slate-300 px-3 py-2 w-10 text-center">Row</th>
                      {expandedData === 'product_stats' ? (
                        <>
                          <th className="border-r border-slate-300 px-3 py-2">Date (Week)</th>
                          <th className="border-r border-slate-300 px-3 py-2 text-right">eBay Records</th>
                          <th className="border-r border-slate-300 px-3 py-2 text-right">Amazon Records</th>
                          <th className="border-r border-slate-300 px-3 py-2 text-right">Total Count</th>
                        </>
                      ) : (
                        <>
                          <th className="border-r border-slate-300 px-3 py-2">Category</th>
                          <th className="border-r border-slate-300 px-3 py-2 text-right">Value Count</th>
                          <th className="border-r border-slate-300 px-3 py-2 text-right">% of Total</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300 text-slate-700">
                    {expandedData === 'product_stats' ? (
                      barData.map((row, i) => (
                        <tr key={i} className="hover:bg-blue-50">
                          <td className="border-r border-slate-300 px-3 py-1.5 text-center text-slate-400">{i + 1}</td>
                          <td className="border-r border-slate-300 px-3 py-1.5">{row.date}</td>
                          <td className="border-r border-slate-300 px-3 py-1.5 text-right">{row.ebay}</td>
                          <td className="border-r border-slate-300 px-3 py-1.5 text-right">{row.amazon}</td>
                          <td className="border-r border-slate-300 px-3 py-1.5 text-right font-medium">{row.ebay + row.amazon}</td>
                        </tr>
                      ))
                    ) : (
                      <>
                        <tr className="hover:bg-blue-50">
                          <td className="border-r border-slate-300 px-3 py-1.5 text-center text-slate-400">1</td>
                          <td className="border-r border-slate-300 px-3 py-1.5 font-medium">{expandedData === 'channel' ? 'eBay' : expandedData === 'manufacture' ? 'Generic' : 'BrandA'}</td>
                          <td className="border-r border-slate-300 px-3 py-1.5 text-right">700</td>
                          <td className="border-r border-slate-300 px-3 py-1.5 text-right">70.0%</td>
                        </tr>
                        <tr className="hover:bg-blue-50">
                          <td className="border-r border-slate-300 px-3 py-1.5 text-center text-slate-400">2</td>
                          <td className="border-r border-slate-300 px-3 py-1.5 font-medium">{expandedData === 'channel' ? 'Amazon' : expandedData === 'manufacture' ? 'BrandA' : 'BrandB'}</td>
                          <td className="border-r border-slate-300 px-3 py-1.5 text-right">300</td>
                          <td className="border-r border-slate-300 px-3 py-1.5 text-right">30.0%</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-slate-900 text-slate-400 text-xs py-4 px-6 rounded-b-lg flex justify-between items-center mt-8">
          <div>© 2022 Sellershub. All Rights Reserved.</div>
          <div>Email: support@sellershub.io</div>
        </div>
      </div>
    </div>
  );
}
