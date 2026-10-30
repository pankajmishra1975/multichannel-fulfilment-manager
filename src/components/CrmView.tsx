import React, { useState, useRef, useMemo, useEffect } from "react";
import { Search, Bold, Italic, Underline, Paperclip, FileText, Send, MoreVertical, LayoutTemplate, Plus, X, Edit2, Trash2 } from 'lucide-react';
import { Order } from '../types';
import CustomerDirectory from './CustomerDirectory';

interface CrmViewProps {
  orders: Order[];
}

interface Message {
  id: string;
  sender: string;
  isSelf: boolean;
  content: string;
  time: string;
  attachments?: string[];
}

interface Ticket {
  id: string;
  customerName: string;
  topic: string;
  marketplace: string;
  timeAgo: string;
  unread: boolean;
  messages: Message[];
  
  // Right panel details
  orderId: string;
  orderTotal: number;
  orderCreated: string;
  orderShipBy: string;
  orderStatus: string;
  email: string;
  phone: string;
  address: string;
  trackingCarrier: string;
  trackingNumber: string;
  items: {
    name: string;
    sku: string;
    qty: number;
    price: number;
    statusTag?: { label: string; color: string };
  }[];
}

interface ReplyTemplate {
  id: string;
  title: string;
  content: string;
}

const DEFAULT_TEMPLATES: ReplyTemplate[] = [
  { id: '1', title: 'Where is my order?', content: 'Hi {name},\n\nYour order {orderId} is currently being processed and will be shipped soon. You should receive tracking information shortly.\n\nPlease let us know if you have any further questions.\n\nThanks,\nSupport Team' },
  { id: '2', title: 'Return Instructions', content: 'Hi {name},\n\nWe are sorry to hear you want to return your item. Please return it to:\nWarehouse Returns\nUnit 5, Enterprise Trade Estate\nLondon, UK\n\nPlease include your order number: {orderId} inside the package.\n\nThanks,\nSupport Team' },
  { id: '3', title: 'Out of Stock Apology', content: 'Hi {name},\n\nWe apologize, but the item from your order {orderId} is currently out of stock. We have issued a full refund to your original payment method.\n\nThanks,\nSupport Team' }
];

const MOCK_TICKETS: Ticket[] = [
  {
    id: 't1',
    customerName: 'Benjamin Miller',
    topic: 'Tracking number not working',
    marketplace: 'Decathlon',
    timeAgo: 'yesterday',
    unread: true,
    messages: [],
    orderId: 'ORD-100293',
    orderTotal: 120.50,
    orderCreated: '10:00 AM - Dec 1, 2025',
    orderShipBy: '10:00 AM - Dec 3, 2025',
    orderStatus: 'SHIPPED',
    email: 'benjamin.miller@example.com',
    phone: '+44 7700 900077',
    address: '10 Downing Street\nLondon, UK',
    trackingCarrier: 'Royal Mail',
    trackingNumber: 'RM123456789GB',
    items: [
      { name: 'Running Shoes X1', sku: 'RS-X1-42', qty: 1, price: 120.50 }
    ]
  },
  {
    id: 't2',
    customerName: 'Isabella Garcia',
    topic: 'Return Request - Product Defect',
    marketplace: 'Decathlon',
    timeAgo: '5 days ago',
    unread: false,
    messages: [],
    orderId: 'ORD-765780',
    orderTotal: 299.99,
    orderCreated: '1:00 PM - Nov 28, 2025',
    orderShipBy: '1:00 PM - Nov 30, 2025',
    orderStatus: 'DELIVERED',
    email: 'isabella.garcia@demo-email.com',
    phone: '+40 517 2383118',
    address: '89 Kärtner Strasse\n1010 Vienna\nAustria',
    trackingCarrier: 'DPD',
    trackingNumber: 'TRK5554623840',
    items: [
      { name: 'Camping Tent 4-Person', sku: 'TENT-4P', qty: 1, price: 299.99 }
    ]
  },
  {
    id: 't3',
    customerName: 'Emma Thompson',
    topic: 'Tracking number not working',
    marketplace: 'Decathlon',
    timeAgo: '5 days ago',
    unread: false,
    messages: [],
    orderId: 'ORD-812391',
    orderTotal: 45.00,
    orderCreated: '9:30 AM - Nov 28, 2025',
    orderShipBy: '9:30 AM - Nov 30, 2025',
    orderStatus: 'SHIPPED',
    email: 'emma.t@example.com',
    phone: '+44 7700 900123',
    address: '15 High Street\nManchester, UK',
    trackingCarrier: 'Hermes',
    trackingNumber: 'H123456789',
    items: [
      { name: 'Yoga Mat Pro', sku: 'YM-PRO-BLK', qty: 1, price: 45.00 }
    ]
  },
  {
    id: 't4',
    customerName: 'James Wilson',
    topic: 'Return Request - Product Defect',
    marketplace: 'Decathlon',
    timeAgo: 'last week',
    unread: false,
    messages: [],
    orderId: 'ORD-901234',
    orderTotal: 89.99,
    orderCreated: '2:15 PM - Nov 20, 2025',
    orderShipBy: '2:15 PM - Nov 22, 2025',
    orderStatus: 'DELIVERED',
    email: 'james.wilson@demo-email.com',
    phone: '+44 7700 900456',
    address: '22 Baker Street\nLondon, UK',
    trackingCarrier: 'Royal Mail',
    trackingNumber: 'RM987654321GB',
    items: [
      { name: 'Cycling Helmet Aerox', sku: 'CH-AERO-M', qty: 1, price: 89.99 }
    ]
  },
  {
    id: 't5',
    customerName: 'James Wilson',
    topic: 'Warranty claim inquiry',
    marketplace: 'MediaMarkt',
    timeAgo: '37 minutes ago',
    unread: true,
    messages: [
      {
        id: 'm1',
        sender: 'Fashion Hub FR',
        isSelf: true,
        content: 'Thank you for contacting us! I\'ve checked your order and it\'s currently being processed. You should receive shipping confirmation within 24-48 hours.',
        time: 'Fashion Hub FR - in 2 hours'
      },
      {
        id: 'm2',
        sender: 'Isabella Garcia',
        isSelf: false,
        content: 'Good afternoon, when will my order be shipped? I need it before next week.',
        time: 'Isabella Garcia - in 5 hours'
      },
      {
        id: 'm3',
        sender: 'Fashion Hub FR',
        isSelf: true,
        content: 'I\'ve updated your delivery address as requested. The new address will be reflected on your shipment confirmation.',
        time: 'Fashion Hub FR - in 7 hours'
      },
      {
        id: 'm4',
        sender: 'Isabella Garcia',
        isSelf: false,
        content: 'Hello, I\'d like to know if this item is covered under warranty and what the process is.',
        time: 'Isabella Garcia - in 7 hours'
      },
      {
        id: 'm5',
        sender: 'Fashion Hub FR',
        isSelf: true,
        content: 'Your order has been prioritized and will ship tomorrow. You\'ll receive tracking information via email once it\'s dispatched.',
        time: 'Fashion Hub FR - in 8 hours',
        attachments: ['document_173.pdf']
      },
      {
        id: 'm6',
        sender: 'Isabella Garcia',
        isSelf: false,
        content: 'Hello, I need to change the delivery address for my order. Is that still possible?',
        time: 'Isabella Garcia - in 11 hours'
      }
    ].reverse(), // Reverse to show chronologically if we want it to look exactly like the screenshot where the top one was in 2 hours, wait, I will just leave it standard chronological. Let's make it standard chat order (oldest at top).
    orderId: 'ORD-765782',
    orderTotal: 669.94,
    orderCreated: '4:58 PM - December 15, 2025',
    orderShipBy: '5:43 PM - December 16, 2025',
    orderStatus: 'RECEIVED',
    email: 'isabella.garcia@demo-email.com',
    phone: '+40 517 2383118',
    address: '89 Kärtner Strasse\n1010 Vienna\nAustria',
    trackingCarrier: 'DPD',
    trackingNumber: 'TRK5554623840',
    items: [
      { name: 'Smart Fitness Watch Series 5', sku: 'SFW-S5-003', qty: 2, price: 499.98, statusTag: { label: 'INCIDENT OPEN', color: 'bg-rose-900/50 border border-rose-800 text-rose-300' } },
      { name: 'Wireless Charging Pad Fast', sku: 'WCP-FST-008', qty: 1, price: 39.99, statusTag: { label: 'WAITING DEBIT', color: 'bg-orange-900/50 border border-orange-800 text-orange-300' } },
      { name: 'USB-C Hub 7-in-1 Adapter', sku: 'HUB-71-USB', qty: 1, price: 129.97 }
    ]
  },
  {
    id: 't6',
    customerName: 'Sofia Martinez',
    topic: 'Return Request - Product Defect',
    marketplace: 'El Corte Inglés',
    timeAgo: '4 hours ago',
    unread: false,
    messages: [],
    orderId: 'ORD-334455',
    orderTotal: 150.00,
    orderCreated: '10:00 AM - Dec 2, 2025',
    orderShipBy: '10:00 AM - Dec 4, 2025',
    orderStatus: 'DELIVERED',
    email: 'sofia.m@demo-email.com',
    phone: '+34 600 123 456',
    address: 'Calle Gran Vía 12\n28013 Madrid\nSpain',
    trackingCarrier: 'Correos',
    trackingNumber: 'ES987654321',
    items: [
      { name: 'Leather Handbag Classic', sku: 'LHB-CLS-BRN', qty: 1, price: 150.00 }
    ]
  },
  {
    id: 't7',
    customerName: 'William Brown',
    topic: 'Request for invoice copy',
    marketplace: 'El Corte Inglés',
    timeAgo: 'last week',
    unread: false,
    messages: [],
    orderId: 'ORD-112233',
    orderTotal: 85.50,
    orderCreated: '11:15 AM - Nov 25, 2025',
    orderShipBy: '11:15 AM - Nov 27, 2025',
    orderStatus: 'DELIVERED',
    email: 'william.brown@demo-email.com',
    phone: '+34 600 987 654',
    address: 'Plaza Mayor 1\n28012 Madrid\nSpain',
    trackingCarrier: 'Correos',
    trackingNumber: 'ES123456789',
    items: [
      { name: 'Men\'s Formal Shirt', sku: 'MFS-WHT-L', qty: 2, price: 85.50 }
    ]
  }
];

export default function CrmView({ orders }: CrmViewProps) {
  // Generate tickets from real orders
  const realTickets: Ticket[] = useMemo(() => {
    return orders.map((order, i) => ({
      id: `real_t_${order.id}`,
      customerName: order.buyerName || 'Unknown Customer',
      topic: `Order Inquiry: ${order.id}`,
      marketplace: order.source.charAt(0).toUpperCase() + order.source.slice(1),
      timeAgo: new Date(order.orderDate).toLocaleDateString(),
      unread: i === 0,
      messages: [
        {
          id: `real_m_${order.id}`,
          sender: order.buyerName || 'Customer',
          isSelf: false,
          content: `Hello, I'm checking the status of my order ${order.id}. Can you provide an update?`,
          time: new Date(order.orderDate).toLocaleDateString()
        }
      ],
      orderId: order.id,
      orderTotal: order.totalAmount,
      orderCreated: new Date(order.orderDate).toLocaleString(),
      orderShipBy: order.shippingDate ? new Date(order.shippingDate).toLocaleString() : 'TBD',
      orderStatus: order.status.toUpperCase(),
      email: order.buyerEmail || 'N/A',
      phone: order.shippingAddress?.phone || 'N/A',
      address: `${order.shippingAddress?.addressLine1 || ''}\n${order.shippingAddress?.city || ''}, ${order.shippingAddress?.countryCode || ''}`.trim(),
      trackingCarrier: order.carrier || 'Pending',
      trackingNumber: order.trackingNumber || 'Pending',
      items: order.items.map(item => ({
        name: item.title,
        sku: item.sku,
        qty: item.quantity,
        price: item.price
      }))
    }));
  }, [orders]);

  const initialTickets = useMemo(() => [...realTickets, ...MOCK_TICKETS], [realTickets]);
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  
  // Keep tickets updated if real tickets change (e.g., new order comes in)
  useEffect(() => {
    setTickets(prev => {
      // Merge real tickets while keeping mock tickets and local message state
      const existingMap = new Map(prev.map(t => [t.id, t]));
      const newTickets = realTickets.map(rt => existingMap.has(rt.id) ? existingMap.get(rt.id)! : rt);
      const mockTickets = prev.filter(t => !t.id.startsWith('real_t_'));
      return [...newTickets, ...mockTickets];
    });
  }, [realTickets]);

  const [selectedTicketId, setSelectedTicketId] = useState<string>(initialTickets[0]?.id || 't5');
  const [replyText, setReplyText] = useState('');
  
  const [templates, setTemplates] = useState<ReplyTemplate[]>(DEFAULT_TEMPLATES);
  const [showTemplatesDropdown, setShowTemplatesDropdown] = useState(false);
  const [showManageTemplates, setShowManageTemplates] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ReplyTemplate | null>(null);
  
  const [activeTab, setActiveTab] = useState<'messages' | 'customers'>('messages');

  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || tickets[0];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const insertTemplate = (template: ReplyTemplate) => {
    let text = template.content;
    text = text.replace(/{name}/g, selectedTicket.customerName);
    text = text.replace(/{orderId}/g, selectedTicket.orderId);
    setReplyText(prev => prev ? prev + '\n' + text : text);
    setShowTemplatesDropdown(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleSend = () => {
    if (!replyText.trim()) return;
    
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'Fashion Hub FR',
      isSelf: true,
      content: replyText,
      time: 'Fashion Hub FR - just now'
    };
    
    setTickets(prev => prev.map(t => {
      if (t.id === selectedTicketId) {
        return { ...t, messages: [...t.messages, newMsg] };
      }
      return t;
    }));
    
    setReplyText('');
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#18181b] text-slate-300 font-sans overflow-hidden">
      
      {/* HEADER TABS */}
      <div className="flex px-4 py-3 bg-[#1c1c1f] border-b border-[#2a2a30] gap-4 shrink-0">
        <button 
          onClick={() => setActiveTab('messages')}
          className={`px-5 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'messages' ? 'bg-[#E47F37] text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-[#27272a]'}`}
        >
          Messages
        </button>
        <button 
          onClick={() => setActiveTab('customers')}
          className={`px-5 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'customers' ? 'bg-[#E47F37] text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-[#27272a]'}`}
        >
          Customers Directory
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'messages' ? (
          <>
            {/* LEFT COLUMN: TICKETS LIST */}
            <div className="w-[320px] flex flex-col border-r border-[#2a2a30] bg-[#1c1c1f] shrink-0">
              <div className="p-4 flex flex-col gap-4">
                <h2 className="text-white font-bold text-lg tracking-wide">Messages</h2>
                
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input 
              className="w-full bg-[#27272a] border border-[#3f3f46] rounded-md pl-9 pr-3 py-2 text-sm text-slate-200 outline-none focus:border-slate-500 placeholder-slate-500" 
              placeholder="Search by topic or recipient..." 
            />
          </div>
          
          <div className="relative">
            <select className="w-full bg-[#27272a] border border-[#3f3f46] rounded-md px-3 py-2 text-sm text-slate-200 outline-none appearance-none focus:border-slate-500">
              <option>All Marketplaces</option>
              <option>Decathlon</option>
              <option>MediaMarkt</option>
              <option>El Corte Inglés</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-4 custom-scrollbar">
          {tickets.map(ticket => (
            <div 
              key={ticket.id}
              onClick={() => setSelectedTicketId(ticket.id)}
              className={`p-3 rounded-lg cursor-pointer flex gap-3 transition-colors ${
                selectedTicketId === ticket.id 
                  ? 'bg-[#28282c] border border-[#E47F37]' 
                  : 'bg-transparent border border-transparent hover:bg-[#28282c]'
              }`}
            >
              <div className="flex-shrink-0 relative">
                <div className="w-9 h-9 rounded-full bg-[#E47F37] text-white flex items-center justify-center text-sm font-bold shadow-sm">
                  {getInitials(ticket.customerName)}
                </div>
              </div>
              
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex justify-between items-center mb-1">
                  <h3 className={`text-sm truncate pr-2 ${selectedTicketId === ticket.id ? 'text-white font-bold' : 'text-slate-200 font-medium'}`}>
                    {ticket.customerName}
                  </h3>
                  {ticket.unread && (
                    <div className="w-2 h-2 rounded-full bg-[#E47F37] flex-shrink-0"></div>
                  )}
                </div>
                <p className="text-xs text-slate-400 truncate mb-1">{ticket.topic}</p>
                <div className="flex justify-between items-center text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    {ticket.marketplace}
                  </div>
                  <span>{ticket.timeAgo}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* CENTER COLUMN: CHAT VIEW */}
      <div className="flex-1 flex flex-col bg-[#18181b] relative min-w-0">
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar flex flex-col">
          {selectedTicket.messages.map((msg, i) => (
            <div key={msg.id || i} className={`flex flex-col max-w-[80%] ${msg.isSelf ? 'self-end items-end' : 'self-start items-start'}`}>
              
              <div className={`rounded-lg p-4 shadow-md ${
                msg.isSelf 
                  ? 'bg-[#E47F37] text-white' 
                  : 'bg-white text-slate-900'
              }`}>
                {!msg.isSelf && (
                  <div className="font-bold text-sm mb-1">{msg.sender}</div>
                )}
                {msg.isSelf && msg.sender !== 'Fashion Hub FR' && (
                  <div className="font-bold text-sm mb-1">{msg.sender}</div>
                )}
                <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {msg.attachments.map((att, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full text-xs font-medium w-fit">
                        <Paperclip className="w-3 h-3" />
                        {att}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-[10px] text-slate-500 mt-1.5 px-1 flex items-center gap-2 w-full justify-between">
                <span>{msg.time}</span>
                {msg.isSelf && <span className="flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider">To: Customer</span>}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Editor Area */}
        <div className="p-4 border-t border-[#2a2a30] bg-[#18181b]">
          <div className="bg-[#1c1c1f] border border-[#3f3f46] rounded-xl overflow-hidden flex flex-col focus-within:border-slate-500 transition-colors shadow-lg">
            
            <div className="px-4 py-2.5 border-b border-[#3f3f46] bg-[#27272a]/50">
              <select className="bg-transparent text-sm text-slate-300 outline-none font-medium appearance-none pr-4">
                <option>Customer</option>
                <option>Internal Note</option>
              </select>
            </div>
            
            <textarea 
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="w-full bg-transparent p-4 text-sm text-slate-200 resize-none outline-none min-h-[100px] placeholder-slate-600" 
              placeholder="Type your reply here..." 
            />
            
            <div className="flex justify-between items-center p-3 border-t border-[#3f3f46] bg-[#27272a]/50">
              <div className="flex gap-4 text-slate-400 px-2">
                <button className="hover:text-white transition-colors"><Bold className="w-4 h-4" /></button>
                <button className="hover:text-white transition-colors"><Underline className="w-4 h-4" /></button>
                <button className="hover:text-white transition-colors"><Italic className="w-4 h-4" /></button>
              </div>
              <div className="flex items-center gap-4">
                <button className="text-slate-400 hover:text-white transition-colors"><Paperclip className="w-4 h-4" /></button>
                <div className="relative">
                  <button 
                    onClick={() => setShowTemplatesDropdown(!showTemplatesDropdown)}
                    className={`transition-colors ${showTemplatesDropdown ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    <LayoutTemplate className="w-4 h-4" />
                  </button>
                  {showTemplatesDropdown && (
                    <div className="absolute bottom-full right-0 mb-2 w-64 bg-[#27272a] border border-[#3f3f46] rounded-xl shadow-xl overflow-hidden z-10 flex flex-col">
                      <div className="px-3 py-2 border-b border-[#3f3f46] flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Templates</span>
                        <button 
                          onClick={() => {
                            setShowTemplatesDropdown(false);
                            setShowManageTemplates(true);
                          }}
                          className="text-[11px] text-[#E47F37] hover:text-[#d97736] font-medium transition-colors"
                        >
                          Manage
                        </button>
                      </div>
                      <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                        {templates.map(template => (
                          <button
                            key={template.id}
                            onClick={() => insertTemplate(template)}
                            className="w-full text-left px-3 py-2.5 text-sm text-slate-300 hover:bg-[#3f3f46] hover:text-white transition-colors border-b border-[#3f3f46]/50 last:border-0 truncate"
                          >
                            {template.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button className="text-slate-400 hover:text-white transition-colors"><MoreVertical className="w-4 h-4" /></button>
                <button 
                  onClick={handleSend}
                  className="bg-[#E47F37] hover:bg-[#d97736] text-white text-sm font-bold px-5 py-2 rounded-lg flex items-center gap-2 transition-colors ml-2 shadow-sm"
                >
                  <Send className="w-4 h-4" /> Send
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </div>
      
      {/* RIGHT COLUMN: CONTEXT DETAILS */}
      <div className="w-[340px] flex flex-col border-l border-[#2a2a30] bg-[#1c1c1f] shrink-0 overflow-y-auto custom-scrollbar">
        <div className="p-6 space-y-8">
          
          {/* Thread Details */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-sm tracking-wide">Thread Details</h3>
            <div className="grid grid-cols-[110px_1fr] gap-y-2 text-sm">
              <div className="text-slate-400 font-medium">Title:</div>
              <div className="text-slate-200 truncate" title={selectedTicket.topic}>{selectedTicket.topic}</div>
              
              <div className="text-slate-400 font-medium">Marketplace:</div>
              <div className="text-slate-200">{selectedTicket.marketplace}</div>
              
              <div className="text-slate-400 font-medium">Topic Ref:</div>
              <div className="text-slate-200 font-mono">{selectedTicket.orderId}</div>
              
              <div className="text-slate-400 font-medium">Type:</div>
              <div className="text-slate-200">ORDER</div>
              
              <div className="text-slate-400 font-medium">Started:</div>
              <div className="text-slate-200">Dec 2, 2025</div>
            </div>
          </div>
          
          <div className="h-px bg-[#3f3f46] w-full"></div>
          
          {/* Order Details */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-white font-bold text-sm tracking-wide">Order Details</h3>
              <span className="bg-emerald-900/50 border border-emerald-800 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded">
                {selectedTicket.orderStatus}
              </span>
            </div>
            <div className="grid grid-cols-[110px_1fr] gap-y-2 text-sm">
              <div className="text-slate-400 font-medium">Order ID:</div>
              <div className="text-slate-200 font-mono text-right">{selectedTicket.orderId}</div>
              
              <div className="text-slate-400 font-medium">Total:</div>
              <div className="text-[#E47F37] font-bold text-right">€{selectedTicket.orderTotal.toFixed(2)}</div>
              
              <div className="text-slate-400 font-medium">Created:</div>
              <div className="text-slate-200 text-right">{selectedTicket.orderCreated.split('-')[0].trim()}</div>
              
              <div className="text-slate-400 font-medium">Ship by:</div>
              <div className="text-slate-200 text-right">{selectedTicket.orderShipBy.split('-')[0].trim()}</div>
            </div>
          </div>

          <div className="h-px bg-[#3f3f46] w-full"></div>

          {/* Customer */}
          <div className="space-y-3">
            <h3 className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">Customer</h3>
            <div className="text-sm text-slate-200 space-y-1">
              <div className="font-bold text-white mb-1">Ms. {selectedTicket.customerName}</div>
              <div className="text-slate-400 hover:text-[#E47F37] cursor-pointer transition-colors truncate">{selectedTicket.email}</div>
              <div className="text-slate-400 hover:text-[#E47F37] cursor-pointer transition-colors">{selectedTicket.phone}</div>
              <div className="whitespace-pre-wrap text-slate-400 mt-2 leading-relaxed">{selectedTicket.address}</div>
            </div>
          </div>

          <div className="h-px bg-[#3f3f46] w-full"></div>

          {/* Tracking */}
          <div className="space-y-3">
            <h3 className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">Tracking</h3>
            <div className="text-sm">
              <div className="text-slate-200 font-bold mb-0.5">{selectedTicket.trackingCarrier}</div>
              <div className="text-slate-400 font-mono">{selectedTicket.trackingNumber}</div>
            </div>
          </div>
          
          <div className="h-px bg-[#3f3f46] w-full"></div>

          {/* Items */}
          <div className="space-y-4">
            <h3 className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">Items ({selectedTicket.items.length})</h3>
            
            <div className="space-y-4">
              {selectedTicket.items.map((item, i) => (
                <div key={i} className="bg-[#27272a] rounded-lg p-3 border border-[#3f3f46] shadow-sm">
                  <div className="text-sm text-white font-medium mb-1 truncate" title={item.name}>{item.name}</div>
                  <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                    <span className="font-mono truncate mr-2">SKU: {item.sku}</span>
                    <span>Qty: {item.qty}</span>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    {item.statusTag ? (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.statusTag.color}`}>
                        {item.statusTag.label}
                      </span>
                    ) : <div></div>}
                    <span className="text-sm font-bold text-white">€{item.price.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
          </>
        ) : (
          <CustomerDirectory orders={orders} />
        )}
      </div>
      
      {/* MANAGE TEMPLATES MODAL */}
      {showManageTemplates && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1f] border border-[#3f3f46] rounded-xl shadow-2xl w-full max-w-3xl flex flex-col h-[600px] max-h-[85vh]">
            <div className="flex justify-between items-center p-5 border-b border-[#3f3f46]">
              <h2 className="text-lg font-bold text-white tracking-wide">Manage Templates</h2>
              <button 
                onClick={() => {
                  setShowManageTemplates(false);
                  setEditingTemplate(null);
                }} 
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-1 overflow-hidden min-h-0">
              <div className="w-1/3 border-r border-[#3f3f46] flex flex-col min-h-0">
                <div className="p-3 border-b border-[#3f3f46]">
                  <button 
                    onClick={() => setEditingTemplate({ id: Date.now().toString(), title: 'New Template', content: '' })}
                    className="w-full bg-[#27272a] hover:bg-[#3f3f46] text-white text-sm font-medium py-2 rounded flex items-center justify-center gap-2 transition-colors border border-[#3f3f46]"
                  >
                    <Plus className="w-4 h-4" /> Add Template
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                  {templates.map(template => (
                    <div 
                      key={template.id}
                      onClick={() => setEditingTemplate(template)}
                      className={`p-2.5 rounded cursor-pointer text-sm transition-colors flex justify-between items-center group ${
                        editingTemplate?.id === template.id ? 'bg-[#3f3f46] text-white' : 'text-slate-300 hover:bg-[#27272a]'
                      }`}
                    >
                      <span className="truncate pr-2">{template.title}</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this template?')) {
                            setTemplates(prev => prev.filter(t => t.id !== template.id));
                            if (editingTemplate?.id === template.id) setEditingTemplate(null);
                          }
                        }}
                        className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="w-2/3 flex flex-col bg-[#18181b] min-h-0">
                {editingTemplate ? (
                  <div className="flex flex-col h-full p-5 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Template Title</label>
                      <input 
                        type="text" 
                        value={editingTemplate.title}
                        onChange={e => setEditingTemplate({...editingTemplate, title: e.target.value})}
                        className="w-full bg-[#27272a] border border-[#3f3f46] rounded px-3 py-2 text-sm text-white outline-none focus:border-[#E47F37]"
                        placeholder="e.g. Out of Stock"
                      />
                    </div>
                    
                    <div className="flex-1 flex flex-col min-h-0">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex justify-between items-end">
                        <span>Content</span>
                        <span className="text-[10px] text-slate-500 font-normal normal-case">Use {"{name}"} or {"{orderId}"} for variables</span>
                      </label>
                      <textarea 
                        value={editingTemplate.content}
                        onChange={e => setEditingTemplate({...editingTemplate, content: e.target.value})}
                        className="w-full flex-1 bg-[#27272a] border border-[#3f3f46] rounded px-3 py-2 text-sm text-white resize-none outline-none focus:border-[#E47F37] custom-scrollbar"
                        placeholder="Write your template text here..."
                      />
                    </div>
                    
                    <div className="flex justify-end pt-2 border-t border-[#3f3f46]">
                      <button 
                        onClick={() => {
                          setTemplates(prev => {
                            const exists = prev.find(t => t.id === editingTemplate.id);
                            if (exists) return prev.map(t => t.id === editingTemplate.id ? editingTemplate : t);
                            return [...prev, editingTemplate];
                          });
                          setEditingTemplate(null);
                        }}
                        className="bg-[#E47F37] hover:bg-[#d97736] text-white text-sm font-bold px-4 py-2 rounded transition-colors"
                      >
                        Save Template
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-1 items-center justify-center flex-col text-slate-500 gap-3">
                    <Edit2 className="w-8 h-8 opacity-50" />
                    <p className="text-sm">Select a template to edit or create a new one</p>
                  </div>
                )}
              </div>
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
