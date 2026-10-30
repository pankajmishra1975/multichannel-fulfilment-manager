import React, { useState, useMemo } from 'react';
import { Search, Plus, MapPin, Clock, Tag, FileText, Star, Package, Users, Mail, Phone, ShoppingBag, PlusCircle, X } from 'lucide-react';
import { Order } from '../types';
import { useCrm } from '../hooks/useCrm';

interface CustomerDirectoryProps {
  orders: Order[];
}

interface CrmCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postcode?: string;
  country?: string;
  imageUrl?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  notes: string;
  tags: string[];
  isManual?: boolean;
  source?: string;
}

export default function CustomerDirectory({ orders }: CustomerDirectoryProps) {
  const { customers: crmOverrides, updateCustomer } = useCrm();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', addressLine1: '', addressLine2: '', city: '', postcode: '', country: '', imageUrl: '' });

  const allCustomers = useMemo(() => {
    const cmap = new Map<string, CrmCustomer>();
    
    // Aggregation from orders
    orders.forEach(order => {
      const id = order.buyerEmail || order.buyerName;
      if (!id) return;
      
      if (!cmap.has(id)) {
        cmap.set(id, {
          id,
          name: order.buyerName,
          email: order.buyerEmail || '',
          phone: order.shippingAddress?.phone || '',
          addressLine1: order.shippingAddress?.addressLine1 || '',
          addressLine2: order.shippingAddress?.addressLine2 || '',
          city: order.shippingAddress?.city || '',
          postcode: order.shippingAddress?.postalCode || '',
          country: order.shippingAddress?.countryCode || '',
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: order.orderDate,
          notes: '',
          tags: [],
          source: order.source
        });
      }
      
      const c = cmap.get(id)!;
      c.totalOrders++;
      c.totalSpent += order.totalAmount;
      if (new Date(order.orderDate) > new Date(c.lastOrderDate)) {
        c.lastOrderDate = order.orderDate;
      }
    });

    // Add manual customers and overrides
    Object.keys(crmOverrides).forEach(id => {
      const override = crmOverrides[id];
      if (override.isManual && !cmap.has(id)) {
        cmap.set(id, {
          id,
          name: override.name || 'Unknown',
          email: override.email || '',
          phone: override.phone || '',
          addressLine1: override.addressLine1 || '',
          addressLine2: override.addressLine2 || '',
          city: override.city || '',
          postcode: override.postcode || '',
          country: override.country || '',
          imageUrl: override.imageUrl || '',
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: new Date().toISOString(),
          notes: '',
          tags: [],
          source: 'Manual',
          ...override
        });
      } else if (cmap.has(id)) {
        const existing = cmap.get(id)!;
        cmap.set(id, { ...existing, ...override });
      }
    });

    return Array.from(cmap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders, crmOverrides]);

  const filteredCustomers = allCustomers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCustomer = allCustomers.find(c => c.id === selectedCustomerId) || null;

  const handleAddManualCustomer = () => {
    if (!newCustomer.name) return;
    const id = newCustomer.email || newCustomer.name + '_' + Date.now();
    updateCustomer(id, {
      ...newCustomer,
      isManual: true,
      tags: [],
      notes: ''
    });
    setNewCustomer({ name: '', email: '', phone: '', addressLine1: '', addressLine2: '', city: '', postcode: '', country: '', imageUrl: '' });
    setShowAddModal(false);
    setSelectedCustomerId(id);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex w-full h-full bg-[#18181b] overflow-hidden">
      
      {/* Left List */}
      <div className="w-[320px] flex flex-col border-r border-[#2a2a30] bg-[#1c1c1f] shrink-0">
        <div className="p-4 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-white font-bold text-lg tracking-wide flex items-center gap-2">
              <Users className="w-5 h-5 text-[#E47F37]" /> Directory
            </h2>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-[#27272a] hover:bg-[#3f3f46] text-white p-1.5 rounded-md transition-colors"
              title="Add Customer Manually"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#27272a] border border-[#3f3f46] rounded-md pl-9 pr-3 py-2 text-sm text-slate-200 outline-none focus:border-slate-500 placeholder-slate-500" 
              placeholder="Search customers..." 
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-4 custom-scrollbar">
          {filteredCustomers.map(customer => (
            <div 
              key={customer.id}
              onClick={() => setSelectedCustomerId(customer.id)}
              className={`p-3 rounded-lg cursor-pointer flex gap-3 transition-colors ${
                selectedCustomerId === customer.id 
                  ? 'bg-[#28282c] border border-[#E47F37]' 
                  : 'bg-transparent border border-transparent hover:bg-[#28282c]'
              }`}
            >
              <div className="flex-shrink-0 relative">
                {customer.imageUrl ? (
                  <img src={customer.imageUrl} alt={customer.name} className="w-9 h-9 rounded-full object-cover shadow-sm border border-[#3f3f46]" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#3f3f46] text-white flex items-center justify-center text-sm font-bold shadow-sm">
                    {getInitials(customer.name || 'U')}
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex justify-between items-center mb-1">
                  <h3 className={`text-sm truncate pr-2 ${selectedCustomerId === customer.id ? 'text-white font-bold' : 'text-slate-200 font-medium'}`}>
                    {customer.name}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 truncate mb-1">{customer.email || 'No email'}</p>
                <div className="flex justify-between items-center text-[11px] text-slate-500">
                  <span className="font-bold text-emerald-400">€{customer.totalSpent.toFixed(2)}</span>
                  <span>{customer.totalOrders} {customer.totalOrders === 1 ? 'order' : 'orders'}</span>
                </div>
              </div>
            </div>
          ))}
          {filteredCustomers.length === 0 && (
            <div className="text-center p-6 text-slate-500 text-sm">
              No customers found.
            </div>
          )}
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 flex flex-col bg-[#18181b] overflow-y-auto custom-scrollbar p-6">
        {selectedCustomer ? (
          <div className="max-w-5xl mx-auto w-full space-y-6">
            
            {/* Header Profile */}
            <div className="bg-[#1c1c1f] rounded-xl border border-[#3f3f46] p-6 flex items-start gap-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#E47F37]/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
              {selectedCustomer.imageUrl ? (
                <img src={selectedCustomer.imageUrl} alt={selectedCustomer.name} className="w-20 h-20 rounded-full object-cover shadow-lg flex-shrink-0 border-2 border-[#E47F37]" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E47F37] to-[#d97736] text-white flex items-center justify-center text-3xl font-black shadow-lg flex-shrink-0">
                  {getInitials(selectedCustomer.name || 'U')}
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-black text-white mb-1 truncate">{selectedCustomer.name}</h2>
                    <div className="flex items-center gap-2 mb-4">
                      {selectedCustomer.source && (
                        <span className="bg-[#3f3f46] text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {selectedCustomer.source}
                        </span>
                      )}
                      {selectedCustomer.isManual && (
                        <span className="bg-indigo-900/50 text-indigo-300 border border-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                          Manual Entry
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Lifetime Value</p>
                    <p className="text-3xl font-black text-[#E47F37]">€{selectedCustomer.totalSpent.toFixed(2)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-slate-300">
                  <div className="flex items-center gap-2 bg-[#27272a] px-3 py-2 rounded-lg border border-[#3f3f46]">
                    <Mail className="w-4 h-4 text-slate-500 shrink-0" /> 
                    <span className="truncate">{selectedCustomer.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#27272a] px-3 py-2 rounded-lg border border-[#3f3f46]">
                    <Phone className="w-4 h-4 text-slate-500 shrink-0" /> 
                    <span className="truncate">{selectedCustomer.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-start gap-2 bg-[#27272a] px-3 py-2 rounded-lg border border-[#3f3f46]">
                    <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" /> 
                    <div className="flex flex-col truncate">
                      <span className="truncate">{selectedCustomer.addressLine1 || 'No address provided'}</span>
                      {selectedCustomer.addressLine2 && <span className="truncate text-xs text-slate-400">{selectedCustomer.addressLine2}</span>}
                      <span className="truncate text-xs text-slate-400">
                        {[selectedCustomer.city, selectedCustomer.postcode, selectedCustomer.country].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="mt-5 flex flex-wrap gap-2 items-center">
                  <Tag className="w-4 h-4 text-slate-500" />
                  {selectedCustomer.tags.map((tag, i) => (
                    <span key={i} className="bg-[#27272a] text-slate-300 border border-[#3f3f46] text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1.5 uppercase tracking-wider">
                      {tag}
                      <button 
                        title="Remove tag"  
                        onClick={() => {
                          const newTags = selectedCustomer.tags.filter(t => t !== tag);
                          updateCustomer(selectedCustomer.id, { tags: newTags });
                        }} 
                        className="hover:text-rose-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <button 
                    title="Add Tag"
                    onClick={() => {
                      const tag = prompt("Enter new tag (e.g. VIP, Wholesale):");
                      if (tag && !selectedCustomer.tags.includes(tag)) {
                        const newTags = [...selectedCustomer.tags, tag];
                        updateCustomer(selectedCustomer.id, { tags: newTags });
                      }
                    }}
                    className="text-[10px] font-bold text-slate-400 hover:text-white bg-[#27272a] hover:bg-[#3f3f46] px-2 py-1 rounded border border-[#3f3f46] border-dashed transition-colors flex items-center gap-1 uppercase tracking-wider"
                  >
                    <Plus className="w-3 h-3" /> Add Tag
                  </button>
                </div>

              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left Col: Notes */}
              <div className="md:col-span-1 space-y-6">
                <div className="bg-[#1c1c1f] rounded-xl border border-[#3f3f46] p-5 shadow-sm flex flex-col h-[300px]">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Internal Notes
                  </h3>
                  <textarea 
                    value={selectedCustomer.notes || ''}
                    onChange={(e) => updateCustomer(selectedCustomer.id, { notes: e.target.value })}
                    placeholder="Add private notes about this customer..."
                    className="flex-1 w-full text-sm border border-[#3f3f46] rounded-lg p-3 bg-[#27272a] text-slate-200 focus:outline-none focus:border-[#E47F37] resize-none custom-scrollbar"
                  ></textarea>
                  <p className="text-[10px] text-slate-500 mt-2 text-right">Notes are saved automatically.</p>
                </div>
                
                <div className="bg-[#1c1c1f] rounded-xl border border-[#3f3f46] p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" /> Engagement
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-[#27272a] p-3 rounded-lg border border-[#3f3f46]">
                      <span className="text-sm font-medium text-slate-300">Total Orders</span>
                      <span className="text-lg font-black text-white">{selectedCustomer.totalOrders}</span>
                    </div>
                    <div className="flex justify-between items-center bg-[#27272a] p-3 rounded-lg border border-[#3f3f46]">
                      <span className="text-sm font-medium text-slate-300">Average Order</span>
                      <span className="text-lg font-black text-emerald-400">
                        €{(selectedCustomer.totalSpent / Math.max(1, selectedCustomer.totalOrders)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-[#27272a] p-3 rounded-lg border border-[#3f3f46]">
                      <span className="text-sm font-medium text-slate-300">Last Order</span>
                      <span className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-500" /> 
                        {selectedCustomer.totalOrders > 0 ? new Date(selectedCustomer.lastOrderDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Col: Order History */}
              <div className="md:col-span-2 bg-[#1c1c1f] rounded-xl border border-[#3f3f46] p-5 shadow-sm flex flex-col min-h-[500px]">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4" /> Order History
                </h3>
                <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
                  {orders.filter(o => (o.buyerEmail || o.buyerName) === selectedCustomer.id).length > 0 ? (
                    orders.filter(o => (o.buyerEmail || o.buyerName) === selectedCustomer.id).sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()).map(order => (
                      <div key={order.id} className="flex flex-col p-4 border border-[#3f3f46] bg-[#27272a] rounded-xl hover:border-slate-500 transition-colors gap-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-[#3f3f46] text-slate-300 w-10 h-10 rounded flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                              {order.source.substring(0,2)}
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm tracking-wide">{order.id}</p>
                              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                                <Clock className="w-3 h-3" /> {new Date(order.orderDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-[#E47F37] text-lg">€{order.totalAmount.toFixed(2)}</p>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase mt-1 inline-block tracking-widest ${
                              order.status === 'shipped' ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-800' :
                              order.status === 'cancelled' ? 'bg-rose-900/50 text-rose-400 border border-rose-800' :
                              'bg-amber-900/50 text-amber-400 border border-amber-800'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                        <div className="border-t border-[#3f3f46] pt-3">
                          <div className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">Items ({order.items.length})</div>
                          <div className="space-y-2">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-sm">
                                <span className="text-slate-300 truncate pr-4">{item.quantity}x {item.title}</span>
                                <span className="text-white font-medium shrink-0">€{item.price.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3 pb-10">
                      <ShoppingBag className="w-12 h-12 opacity-20" />
                      <p className="text-sm font-medium">No order history available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 h-full">
            <div className="w-24 h-24 bg-[#1c1c1f] border border-[#3f3f46] rounded-full flex items-center justify-center mb-6 shadow-sm">
              <Users className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">Customer Directory</h3>
            <p className="text-sm max-w-md text-center text-slate-400 leading-relaxed">
              Select a customer from the sidebar to view their complete profile, order history, engagement metrics, and CRM notes.
            </p>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1f] border border-[#3f3f46] rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center p-5 border-b border-[#3f3f46]">
              <h2 className="text-lg font-bold text-white tracking-wide">Add Manual Customer</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name *</label>
                <input 
                  type="text" 
                  value={newCustomer.name}
                  onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                  className="w-full bg-[#27272a] border border-[#3f3f46] rounded px-3 py-2 text-sm text-white outline-none focus:border-[#E47F37]"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  value={newCustomer.email}
                  onChange={e => setNewCustomer({...newCustomer, email: e.target.value})}
                  className="w-full bg-[#27272a] border border-[#3f3f46] rounded px-3 py-2 text-sm text-white outline-none focus:border-[#E47F37]"
                  placeholder="e.g. john@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                <input 
                  type="text" 
                  value={newCustomer.phone}
                  onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
                  className="w-full bg-[#27272a] border border-[#3f3f46] rounded px-3 py-2 text-sm text-white outline-none focus:border-[#E47F37]"
                  placeholder="e.g. +1 234 567 8900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Picture / Logo URL</label>
                <input 
                  type="text" 
                  value={newCustomer.imageUrl}
                  onChange={e => setNewCustomer({...newCustomer, imageUrl: e.target.value})}
                  className="w-full bg-[#27272a] border border-[#3f3f46] rounded px-3 py-2 text-sm text-white outline-none focus:border-[#E47F37]"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex justify-between">
                  <span>Picture / Logo Upload</span>
                </label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setNewCustomer({...newCustomer, imageUrl: event.target?.result as string});
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full bg-[#27272a] border border-[#3f3f46] rounded px-3 py-1.5 text-sm text-slate-400 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-[#3f3f46] file:text-white hover:file:bg-[#52525b] outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Address Line 1</label>
                  <input 
                    type="text" 
                    value={newCustomer.addressLine1}
                    onChange={e => setNewCustomer({...newCustomer, addressLine1: e.target.value})}
                    className="w-full bg-[#27272a] border border-[#3f3f46] rounded px-3 py-2 text-sm text-white outline-none focus:border-[#E47F37]"
                    placeholder="123 Main St"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Address Line 2</label>
                  <input 
                    type="text" 
                    value={newCustomer.addressLine2}
                    onChange={e => setNewCustomer({...newCustomer, addressLine2: e.target.value})}
                    className="w-full bg-[#27272a] border border-[#3f3f46] rounded px-3 py-2 text-sm text-white outline-none focus:border-[#E47F37]"
                    placeholder="Apt 4B"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">City</label>
                  <input 
                    type="text" 
                    value={newCustomer.city}
                    onChange={e => setNewCustomer({...newCustomer, city: e.target.value})}
                    className="w-full bg-[#27272a] border border-[#3f3f46] rounded px-3 py-2 text-sm text-white outline-none focus:border-[#E47F37]"
                    placeholder="London"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Postcode</label>
                  <input 
                    type="text" 
                    value={newCustomer.postcode}
                    onChange={e => setNewCustomer({...newCustomer, postcode: e.target.value})}
                    className="w-full bg-[#27272a] border border-[#3f3f46] rounded px-3 py-2 text-sm text-white outline-none focus:border-[#E47F37]"
                    placeholder="SW1A 1AA"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Country</label>
                  <input 
                    type="text" 
                    value={newCustomer.country}
                    onChange={e => setNewCustomer({...newCustomer, country: e.target.value})}
                    className="w-full bg-[#27272a] border border-[#3f3f46] rounded px-3 py-2 text-sm text-white outline-none focus:border-[#E47F37]"
                    placeholder="UK"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-[#3f3f46] bg-[#27272a]/30">
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-bold text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddManualCustomer}
                disabled={!newCustomer.name}
                className="bg-[#E47F37] hover:bg-[#d97736] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold px-4 py-2 rounded transition-colors"
              >
                Create Customer
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #3f3f46;
          border-radius: 20px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: #52525b;
        }
      `}} />
    </div>
  );
}
