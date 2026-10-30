import React, { useState } from 'react';
import { Order } from '../types';
import { Search, Calendar, RefreshCcw, Info, X } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
  orders: Order[];
  currency: string;
}

export default function AiOrdersDashboardView({ orders, currency }: Props) {
  const [dateRange, setDateRange] = useState('7days');
  const [expandedData, setExpandedData] = useState<string | null>(null);

  // Pie chart data for "Orders Processed Real Time (Weekly)"
  const pieData = [
    { name: '0 - 25', value: 0 },
    { name: '26 - 750', value: 0 },
    { name: '751 - 2500', value: 692 },
    { name: '2501 - 25000', value: 0 },
  ];
  const pieColors = ['#ef4444', '#eab308', '#22c55e', '#3b82f6'];

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
            <h2 className="text-xl font-bold text-slate-800">Sales Order Realtime Execution Stats</h2>
            <p className="text-sm text-slate-500 flex items-center gap-1.5">
              <Info className="w-4 h-4" />
              This dashboard contains Sales Order Realtime Execution Stats. You can view it, search it, and interact with the visualizations. For more information about Sellershub documentation, check our <a href="#" className="text-blue-600 hover:underline">docs</a>.
            </p>
          </div>
        </div>

        {/* Order Filters */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-700">Order Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Channels</label>
              <select className="w-full text-sm border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option>Select...</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Carrier Name</label>
              <select className="w-full text-sm border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option>Select...</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Status</label>
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

        {/* Realtime Stats Bottom Area */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Orders Processed Real Time (Weekly) */}
          <div 
            onClick={() => setExpandedData('orders_processed')}
            className={`bg-white border ${expandedData === 'orders_processed' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200'} rounded-lg shadow-sm md:col-span-1 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all`}
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-[10px] font-bold text-slate-600">Orders Processed Real Time (Weekly)</h4>
              <div className="text-[10px] text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Last 7 days rounded to the day
              </div>
            </div>
            <div className="p-4 flex gap-4 items-center pointer-events-none">
              <div className="h-40 w-40 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-light text-slate-700">692</span>
                </div>
              </div>
              <div className="space-y-2 text-[10px] text-slate-600">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: pieColors[i]}}></div>
                    <span>{d.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center pb-4 text-xs font-semibold text-slate-600">
              Orders Processed
              <div className="text-[10px] text-blue-500 font-normal mt-1">Click to view data</div>
            </div>
          </div>

          {/* Subscription Plan and Order Processed */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 space-y-6">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-600 mb-4 border-b border-slate-100 pb-2">
              <span>Subscription Plan (Weekly)</span>
              <div className="flex items-center gap-1 border border-slate-200 px-1.5 py-0.5 rounded text-slate-400">
                <Calendar className="w-3 h-3" /> Last 5 years
              </div>
            </div>
            <table className="w-full text-xs text-left text-slate-600 mb-6">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-2 font-medium">Plan</th>
                  <th className="py-2 font-medium text-right">Order Limit</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 bg-emerald-50 px-2 font-medium">ENTERPRISE</td>
                  <td className="py-2 bg-emerald-50 text-right px-2">1,000</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div 
            onClick={() => setExpandedData('order_processed_box')}
            className={`bg-white border ${expandedData === 'order_processed_box' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200'} rounded-lg shadow-sm flex flex-col cursor-pointer hover:border-blue-400 hover:shadow-md transition-all`}
          >
            <div className="p-4 border-b border-slate-100">
              <h4 className="text-[10px] font-bold text-slate-600">Order Processed</h4>
            </div>
            <div className="flex-1 flex items-center justify-center p-6 flex-col">
              <div className="text-6xl font-light text-slate-800 tracking-tight">
                692
              </div>
              <div className="text-[10px] text-blue-500 font-normal mt-2">Click to view data</div>
            </div>
          </div>

          {/* Right Column: Shipping Price & Unshipped */}
          <div className="grid grid-rows-2 gap-4">
            <div 
              onClick={() => setExpandedData('shipping_price')}
              className={`bg-white border ${expandedData === 'shipping_price' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200'} rounded-lg shadow-sm flex flex-col cursor-pointer hover:border-blue-400 hover:shadow-md transition-all`}
            >
              <div className="p-3 border-b border-slate-100">
                <h4 className="text-[10px] font-bold text-slate-600">Shipping Price</h4>
              </div>
              <div className="flex-1 flex items-center justify-center p-4 flex-col">
                <div className="text-4xl font-light text-slate-800 tracking-tight">0</div>
                <div className="text-[10px] text-blue-500 font-normal mt-1">Click to view data</div>
              </div>
            </div>
            <div 
              onClick={() => setExpandedData('unshipped')}
              className={`bg-white border ${expandedData === 'unshipped' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200'} rounded-lg shadow-sm flex flex-col cursor-pointer hover:border-blue-400 hover:shadow-md transition-all`}
            >
              <div className="p-3 border-b border-slate-100">
                <h4 className="text-[10px] font-bold text-slate-600">Number of Items UnShipped</h4>
              </div>
              <div className="flex-1 flex items-center justify-center p-4 flex-col">
                <div className="text-4xl font-light text-slate-800 tracking-tight">6</div>
                <div className="text-[10px] text-blue-500 font-normal mt-1">Click to view data</div>
              </div>
            </div>
          </div>

        </div>

        {/* Extended KPI Section (Accordions) */}
        <div className="space-y-3 mt-8">
          <h3 className="text-sm font-bold text-slate-700 px-1">Performance Indicators</h3>
          
          {[
            { id: 'avg_processing_time', title: 'Avg Processing Time', value: <>4.2 <span className="text-sm text-slate-500">hrs</span></>, color: 'text-slate-800' },
            { id: 'on_time_shipping', title: 'On-Time Shipping', value: <>98.5<span className="text-sm">%</span></>, color: 'text-emerald-600' },
            { id: 'late_processing', title: 'Late Processing Rate', value: <>1.2<span className="text-sm">%</span></>, color: 'text-rose-500' },
            { id: 'order_defect_rate', title: 'Order Defect Rate', value: <>0.8<span className="text-sm">%</span></>, color: 'text-amber-500' },
            { id: 'shipping_kpi', title: 'Shipping Cost per Order', value: <>{currency}4.12</>, color: 'text-indigo-600' },
            { id: 'customer_returns', title: 'Customer Returns', value: <>3.1<span className="text-sm">%</span></>, color: 'text-slate-800' }
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
                    {kpi.id === 'customer_returns' ? (
                      <div className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-6 p-4 bg-rose-50 border border-rose-100 rounded-lg">
                           <div>
                             <div className="text-[10px] uppercase font-bold text-rose-500">Most Common Return Reason</div>
                             <div className="text-lg font-bold text-rose-700">Item Defective / Does not work</div>
                           </div>
                           <div>
                             <div className="text-[10px] uppercase font-bold text-rose-500">Most Returned SKU</div>
                             <div className="text-lg font-bold text-rose-700">SKU-AUDIO-001 (14 returns)</div>
                           </div>
                           <div>
                             <div className="text-[10px] uppercase font-bold text-rose-500">Total Return Value (Period)</div>
                             <div className="text-lg font-bold text-rose-700">{currency}1,245.00</div>
                           </div>
                        </div>
                        
                        <div className="overflow-x-auto border border-slate-300 rounded-lg shadow-sm">
                          <table className="w-full text-xs text-left whitespace-nowrap">
                            <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-300">
                              <tr>
                                <th className="border-r border-slate-300 px-3 py-2 w-10 text-center">Row</th>
                                <th className="border-r border-slate-300 px-3 py-2">Date</th>
                                <th className="border-r border-slate-300 px-3 py-2">Order ID</th>
                                <th className="border-r border-slate-300 px-3 py-2">SKU</th>
                                <th className="border-r border-slate-300 px-3 py-2">Product Name</th>
                                <th className="border-r border-slate-300 px-3 py-2">Return Reason</th>
                                <th className="border-r border-slate-300 px-3 py-2">Customer Note</th>
                                <th className="border-r border-slate-300 px-3 py-2 text-right">Value</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-300 text-slate-700 bg-white">
                              <tr className="hover:bg-blue-50">
                                <td className="border-r border-slate-300 px-3 py-1.5 text-center text-slate-400">1</td>
                                <td className="border-r border-slate-300 px-3 py-1.5">2022-10-12</td>
                                <td className="border-r border-slate-300 px-3 py-1.5 text-blue-600">ORD-9912</td>
                                <td className="border-r border-slate-300 px-3 py-1.5 font-mono text-[10px]">SKU-AUDIO-001</td>
                                <td className="border-r border-slate-300 px-3 py-1.5">Premium Wireless Headphones</td>
                                <td className="border-r border-slate-300 px-3 py-1.5 text-rose-600">Item Defective</td>
                                <td className="border-r border-slate-300 px-3 py-1.5 italic">"Left earbud has no sound"</td>
                                <td className="border-r border-slate-300 px-3 py-1.5 text-right">{currency}150.00</td>
                              </tr>
                              <tr className="hover:bg-blue-50">
                                <td className="border-r border-slate-300 px-3 py-1.5 text-center text-slate-400">2</td>
                                <td className="border-r border-slate-300 px-3 py-1.5">2022-10-11</td>
                                <td className="border-r border-slate-300 px-3 py-1.5 text-blue-600">ORD-9884</td>
                                <td className="border-r border-slate-300 px-3 py-1.5 font-mono text-[10px]">SKU-HOME-045</td>
                                <td className="border-r border-slate-300 px-3 py-1.5">Smart LED Bulb</td>
                                <td className="border-r border-slate-300 px-3 py-1.5 text-amber-600">Ordered wrong item</td>
                                <td className="border-r border-slate-300 px-3 py-1.5 italic">"Wanted bayonet not screw"</td>
                                <td className="border-r border-slate-300 px-3 py-1.5 text-right">{currency}12.50</td>
                              </tr>
                              <tr className="hover:bg-blue-50">
                                <td className="border-r border-slate-300 px-3 py-1.5 text-center text-slate-400">3</td>
                                <td className="border-r border-slate-300 px-3 py-1.5">2022-10-10</td>
                                <td className="border-r border-slate-300 px-3 py-1.5 text-blue-600">ORD-9821</td>
                                <td className="border-r border-slate-300 px-3 py-1.5 font-mono text-[10px]">SKU-AUDIO-001</td>
                                <td className="border-r border-slate-300 px-3 py-1.5">Premium Wireless Headphones</td>
                                <td className="border-r border-slate-300 px-3 py-1.5 text-rose-600">Item Defective</td>
                                <td className="border-r border-slate-300 px-3 py-1.5 italic">"Won't charge"</td>
                                <td className="border-r border-slate-300 px-3 py-1.5 text-right">{currency}150.00</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto border border-slate-300 rounded-lg shadow-sm">
                        <table className="w-full text-xs text-left whitespace-nowrap">
                          <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-300">
                            <tr>
                              <th className="border-r border-slate-300 px-3 py-2 w-10 text-center">Row</th>
                              <th className="border-r border-slate-300 px-3 py-2">Date</th>
                              <th className="border-r border-slate-300 px-3 py-2">Order ID</th>
                              <th className="border-r border-slate-300 px-3 py-2">Channel</th>
                              <th className="border-r border-slate-300 px-3 py-2">Items</th>
                              <th className="border-r border-slate-300 px-3 py-2">Status</th>
                              <th className="border-r border-slate-300 px-3 py-2 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-300 text-slate-700 bg-white">
                            <tr className="hover:bg-blue-50">
                              <td className="border-r border-slate-300 px-3 py-1.5 text-center text-slate-400">1</td>
                              <td className="border-r border-slate-300 px-3 py-1.5">2022-10-12 14:22</td>
                              <td className="border-r border-slate-300 px-3 py-1.5 text-blue-600">ORD-9988</td>
                              <td className="border-r border-slate-300 px-3 py-1.5">Amazon</td>
                              <td className="border-r border-slate-300 px-3 py-1.5">2</td>
                              <td className="border-r border-slate-300 px-3 py-1.5"><span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">Processed</span></td>
                              <td className="border-r border-slate-300 px-3 py-1.5 text-right">{currency}45.99</td>
                            </tr>
                            <tr className="hover:bg-blue-50">
                              <td className="border-r border-slate-300 px-3 py-1.5 text-center text-slate-400">2</td>
                              <td className="border-r border-slate-300 px-3 py-1.5">2022-10-12 15:05</td>
                              <td className="border-r border-slate-300 px-3 py-1.5 text-blue-600">ORD-9989</td>
                              <td className="border-r border-slate-300 px-3 py-1.5">eBay</td>
                              <td className="border-r border-slate-300 px-3 py-1.5">1</td>
                              <td className="border-r border-slate-300 px-3 py-1.5"><span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">Processed</span></td>
                              <td className="border-r border-slate-300 px-3 py-1.5 text-right">{currency}12.50</td>
                            </tr>
                            <tr className="hover:bg-blue-50">
                              <td className="border-r border-slate-300 px-3 py-1.5 text-center text-slate-400">3</td>
                              <td className="border-r border-slate-300 px-3 py-1.5">2022-10-12 16:30</td>
                              <td className="border-r border-slate-300 px-3 py-1.5 text-blue-600">ORD-9990</td>
                              <td className="border-r border-slate-300 px-3 py-1.5">Website</td>
                              <td className="border-r border-slate-300 px-3 py-1.5">5</td>
                              <td className="border-r border-slate-300 px-3 py-1.5"><span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Pending</span></td>
                              <td className="border-r border-slate-300 px-3 py-1.5 text-right">{currency}240.00</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Expanded Data Table (Excel Style) */}
        {expandedData && !['avg_processing_time', 'on_time_shipping', 'late_processing', 'order_defect_rate', 'shipping_kpi', 'customer_returns'].includes(expandedData) && (
          <div className="bg-white border border-slate-300 shadow-sm mt-6 mb-8 overflow-hidden rounded-lg">
            <div className="bg-slate-100 border-b border-slate-300 px-4 py-2 flex items-center justify-between">
              <h3 className="font-bold text-slate-700 text-sm">
                {expandedData === 'orders_processed' ? 'Detailed Data: Orders Processed Real Time' : 
                 expandedData === 'order_processed_box' ? 'Detailed Data: Orders Processed' : 
                 expandedData === 'shipping_price' ? 'Detailed Data: Shipping Price' : 
                 expandedData === 'unshipped' ? 'Detailed Data: Items Unshipped' : 
                 expandedData === 'avg_processing_time' ? 'Detailed Data: Average Processing Time' : 
                 expandedData === 'on_time_shipping' ? 'Detailed Data: On-Time Shipping' : 
                 expandedData === 'late_processing' ? 'Detailed Data: Late Processing Rate' : 
                 expandedData === 'order_defect_rate' ? 'Detailed Data: Order Defect Rate' : 
                 expandedData === 'shipping_kpi' ? 'Detailed Data: Shipping KPI' : 
                 expandedData === 'customer_returns' ? 'Detailed Data: Customer Returns' : 
                 'Detailed Data'}
              </h3>
              <button onClick={() => setExpandedData(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              {expandedData === 'customer_returns' && (
                <div className="flex flex-col md:flex-row gap-6 mb-4 p-4 bg-rose-50 border border-rose-100 rounded-lg">
                   <div>
                     <div className="text-[10px] uppercase font-bold text-rose-500">Most Common Return Reason</div>
                     <div className="text-lg font-bold text-rose-700">Item Defective / Does not work</div>
                   </div>
                   <div>
                     <div className="text-[10px] uppercase font-bold text-rose-500">Most Returned SKU</div>
                     <div className="text-lg font-bold text-rose-700">SKU-AUDIO-001 (14 returns)</div>
                   </div>
                   <div>
                     <div className="text-[10px] uppercase font-bold text-rose-500">Total Return Value (Period)</div>
                     <div className="text-lg font-bold text-rose-700">{currency}1,245.00</div>
                   </div>
                </div>
              )}
              
              <div className="overflow-x-auto border border-slate-300">
                <table className="w-full text-xs text-left whitespace-nowrap">
                  <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-300">
                    <tr>
                      <th className="border-r border-slate-300 px-3 py-2 w-10 text-center">Row</th>
                      {expandedData === 'customer_returns' ? (
                        <>
                          <th className="border-r border-slate-300 px-3 py-2">Date</th>
                          <th className="border-r border-slate-300 px-3 py-2">Order ID</th>
                          <th className="border-r border-slate-300 px-3 py-2">SKU</th>
                          <th className="border-r border-slate-300 px-3 py-2">Product Name</th>
                          <th className="border-r border-slate-300 px-3 py-2">Return Reason</th>
                          <th className="border-r border-slate-300 px-3 py-2">Customer Note</th>
                          <th className="border-r border-slate-300 px-3 py-2 text-right">Value</th>
                        </>
                      ) : (
                        <>
                          <th className="border-r border-slate-300 px-3 py-2">Date</th>
                          <th className="border-r border-slate-300 px-3 py-2">Order ID</th>
                          <th className="border-r border-slate-300 px-3 py-2">Channel</th>
                          <th className="border-r border-slate-300 px-3 py-2">Items</th>
                          <th className="border-r border-slate-300 px-3 py-2">Status</th>
                          <th className="border-r border-slate-300 px-3 py-2 text-right">Total</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300 text-slate-700">
                    {expandedData === 'customer_returns' ? (
                      <>
                        <tr className="hover:bg-blue-50">
                          <td className="border-r border-slate-300 px-3 py-1.5 text-center text-slate-400">1</td>
                          <td className="border-r border-slate-300 px-3 py-1.5">2022-10-12</td>
                          <td className="border-r border-slate-300 px-3 py-1.5 text-blue-600">ORD-9912</td>
                          <td className="border-r border-slate-300 px-3 py-1.5 font-mono text-[10px]">SKU-AUDIO-001</td>
                          <td className="border-r border-slate-300 px-3 py-1.5">Premium Wireless Headphones</td>
                          <td className="border-r border-slate-300 px-3 py-1.5 text-rose-600">Item Defective</td>
                          <td className="border-r border-slate-300 px-3 py-1.5 italic">"Left earbud has no sound"</td>
                          <td className="border-r border-slate-300 px-3 py-1.5 text-right">{currency}150.00</td>
                        </tr>
                        <tr className="hover:bg-blue-50">
                          <td className="border-r border-slate-300 px-3 py-1.5 text-center text-slate-400">2</td>
                          <td className="border-r border-slate-300 px-3 py-1.5">2022-10-11</td>
                          <td className="border-r border-slate-300 px-3 py-1.5 text-blue-600">ORD-9884</td>
                          <td className="border-r border-slate-300 px-3 py-1.5 font-mono text-[10px]">SKU-HOME-045</td>
                          <td className="border-r border-slate-300 px-3 py-1.5">Smart LED Bulb</td>
                          <td className="border-r border-slate-300 px-3 py-1.5 text-amber-600">Ordered wrong item</td>
                          <td className="border-r border-slate-300 px-3 py-1.5 italic">"Wanted bayonet not screw"</td>
                          <td className="border-r border-slate-300 px-3 py-1.5 text-right">{currency}12.50</td>
                        </tr>
                        <tr className="hover:bg-blue-50">
                          <td className="border-r border-slate-300 px-3 py-1.5 text-center text-slate-400">3</td>
                          <td className="border-r border-slate-300 px-3 py-1.5">2022-10-10</td>
                          <td className="border-r border-slate-300 px-3 py-1.5 text-blue-600">ORD-9821</td>
                          <td className="border-r border-slate-300 px-3 py-1.5 font-mono text-[10px]">SKU-AUDIO-001</td>
                          <td className="border-r border-slate-300 px-3 py-1.5">Premium Wireless Headphones</td>
                          <td className="border-r border-slate-300 px-3 py-1.5 text-rose-600">Item Defective</td>
                          <td className="border-r border-slate-300 px-3 py-1.5 italic">"Won't charge"</td>
                          <td className="border-r border-slate-300 px-3 py-1.5 text-right">{currency}150.00</td>
                        </tr>
                      </>
                    ) : (
                      <>
                        <tr className="hover:bg-blue-50">
                          <td className="border-r border-slate-300 px-3 py-1.5 text-center text-slate-400">1</td>
                          <td className="border-r border-slate-300 px-3 py-1.5">2022-10-12 14:22</td>
                          <td className="border-r border-slate-300 px-3 py-1.5 text-blue-600">ORD-9988</td>
                          <td className="border-r border-slate-300 px-3 py-1.5">Amazon</td>
                          <td className="border-r border-slate-300 px-3 py-1.5">2</td>
                          <td className="border-r border-slate-300 px-3 py-1.5"><span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">Processed</span></td>
                          <td className="border-r border-slate-300 px-3 py-1.5 text-right">{currency}45.99</td>
                        </tr>
                        <tr className="hover:bg-blue-50">
                          <td className="border-r border-slate-300 px-3 py-1.5 text-center text-slate-400">2</td>
                          <td className="border-r border-slate-300 px-3 py-1.5">2022-10-12 15:05</td>
                          <td className="border-r border-slate-300 px-3 py-1.5 text-blue-600">ORD-9989</td>
                          <td className="border-r border-slate-300 px-3 py-1.5">eBay</td>
                          <td className="border-r border-slate-300 px-3 py-1.5">1</td>
                          <td className="border-r border-slate-300 px-3 py-1.5"><span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">Processed</span></td>
                          <td className="border-r border-slate-300 px-3 py-1.5 text-right">{currency}12.50</td>
                        </tr>
                        <tr className="hover:bg-blue-50">
                          <td className="border-r border-slate-300 px-3 py-1.5 text-center text-slate-400">3</td>
                          <td className="border-r border-slate-300 px-3 py-1.5">2022-10-12 16:30</td>
                          <td className="border-r border-slate-300 px-3 py-1.5 text-blue-600">ORD-9990</td>
                          <td className="border-r border-slate-300 px-3 py-1.5">Website</td>
                          <td className="border-r border-slate-300 px-3 py-1.5">5</td>
                          <td className="border-r border-slate-300 px-3 py-1.5"><span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Pending</span></td>
                          <td className="border-r border-slate-300 px-3 py-1.5 text-right">{currency}240.00</td>
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
