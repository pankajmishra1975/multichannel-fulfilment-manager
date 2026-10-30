import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  HelpCircle, 
  Activity, 
  ShoppingBag, 
  Package, 
  Database, 
  Calculator, 
  Truck, 
  Building2, 
  Printer, 
  Globe, 
  Sliders, 
  CheckCircle, 
  Info, 
  Sparkles, 
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Layout
} from 'lucide-react';

interface GuideSection {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  category: 'Logistics' | 'Financials' | 'Infrastructure' | 'Getting Started' | 'Updates & Changelog';
  summary: string;
  proTip: string;
  steps: string[];
  features: { name: string; desc: string }[];
  faqs: { q: string; a: string }[];
}

export default function UserGuidesView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeGuideId, setActiveGuideId] = useState('changelog');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchFocused, setSearchFocused] = useState(false);

  const guides: GuideSection[] = [
    {
      id: 'changelog',
      title: 'Changelog & Feature Updates (Cron Log)',
      icon: Clock,
      color: 'text-fuchsia-500 bg-fuchsia-500/10 border-fuchsia-500/20',
      category: 'Updates & Changelog',
      summary: 'Chronological tracking of newly integrated features, fixes, and platform upgrades.',
      proTip: 'This module is updated regularly as part of a scheduled feature rollout. Check here to see recent additions!',
      steps: [
        'Added Template Designer allowing Drag & Drop for labels, packing slips, POs & invoice forms.',
        'Added dynamic item table grid support in Template Designer.',
        'Enabled Background Reference Image upload in the Template Designer.',
        'Fixed resizing functionality for elements within the designer.',
        'Added expansive list of dynamic placeholders across multiple perspectives (Customer, Product, Shipping).',
        'Removed redundant warnings from the Top Header & Reset Simulator area.'
      ],
      features: [
        { name: 'Template Designer', desc: 'Allows granular customization of printed documents.' },
        { name: 'Dynamic Tables', desc: 'Added support for inserting repeating data blocks such as SKUs, quantities, and prices.' },
        { name: 'Image Tracing', desc: 'Upload background references to trace your old label formats accurately.' }
      ],
      faqs: [
        { q: 'How often are new features added?', a: 'Features are continually pushed and this log acts as a living history of platform capabilities.' }
      ]
    },
    {
      id: 'dashboard',
      title: 'Overview Dashboard',
      icon: Activity,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      category: 'Logistics',
      summary: 'Your operational command center. Monitor real-time logistics health, low stock telemetry, and integration channel heartbeats.',
      proTip: 'The live latency meter at the top displays websocket status. Keep this tab open on a secondary monitor for real-time order alerts.',
      steps: [
        'Check "Active Shipments Today" to view daily carrier performance metrics.',
        'Review the "Low Stock Alerts" panel to prioritize reordering top-selling items.',
        'Verify the "API Gateway connection logs" at the bottom of your workspace to troubleshoot connection handshakes.',
        'Click the live "Sync Both Channels" button to manually pull incoming marketplace orders immediately.'
      ],
      features: [
        { name: 'Total Sales Tracking', desc: 'Displays real-time aggregated sales revenue across Amazon, eBay, and manual wholesale orders.' },
        { name: 'Average Dispatch Clock', desc: 'Measures time elapsed from order receipt to shipping label purchase, helping you maintain carrier SLAs.' },
        { name: 'Live Gateway Console', desc: 'Interactive console log printing live API telemetry feeds, sync status, and sandbox simulation flags.' }
      ],
      faqs: [
        { q: 'Why is the synchronization timer spinning?', a: 'When "Auto-Sync" is enabled, the background engine queries Amazon SP-API and eBay Fulfillment endpoints every 15 seconds to fetch fresh orders.' },
        { q: 'How do I read warning indicators?', a: 'Yellow indicators mean minor issues (e.g., incomplete order dimensions); Red indicators highlight critical failures (e.g., completely out of stock SKUs or address validation failures).' }
      ]
    },
    {
      id: 'orders',
      title: 'Orders Deck & Labeling',
      icon: ShoppingBag,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
      category: 'Logistics',
      summary: 'Centralized multi-channel order fulfillment hub. Select pending orders, validate destination addresses, merge duplicate buyers, and buy bulk postage.',
      proTip: 'Always check the "Duplicate Buyer" warning. Merging multiple orders to the same shipping address into one box will save up to 45% in courier surcharges!',
      steps: [
        'Select one or more orders from the scrollable list using the check boxes.',
        'View the "Postage Rates Deck" on the right sidebar to compare carrier rates automatically.',
        'Click "Address Validation" to cross-reference addresses against standard postcodes.',
        'Select a priority strategy (Cheapest, Express, or Amazon Buy Shipping) and click "Bulk Purchase & Auto-Print" to generate ZPL labels.'
      ],
      features: [
        { name: 'Order Merging Engine', desc: 'Automatically flags separate orders matching the exact same buyer address and lets you merge them with one click.' },
        { name: 'Multi-Strategy Rates Comparison', desc: 'Compares Royal Mail Tracked 48, DPD Next Day, and FedEx Ground instantly based on custom package volume and weight.' },
        { name: 'Amazon "Buy Shipping" Priority', desc: 'Direct integration with Amazon SP-API Merchant Fulfillment Network (MFN) to safeguard Amazon Seller performance metrics.' }
      ],
      faqs: [
        { q: 'What does "Address Mismatch" mean?', a: 'The smart parser flagged that the shipping city, postcode, or street address layout does not match courier validation guidelines. Use the edit feature in the Details panel to fix it prior to purchasing.' },
        { q: 'Can I cancel a shipping label?', a: 'Within the simulator, purchased labels are finalized instantly. In production, you have a 24-hour window to void unused postage labels through your carrier contract portal.' }
      ]
    },
    {
      id: 'products',
      title: 'Products & Bin Locations',
      icon: Package,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      category: 'Logistics',
      summary: 'Manage listings, link SKU variants across separate sales channels, and map physical warehouse coordinates for fast order picking.',
      proTip: 'Assigning accurate "Bin Locations" (e.g. Rack A-12, Shelf 3) speeds up pick-pack-and-ship time by up to 60%.',
      steps: [
        'Open the Products list to view active inventory, cost price, and wholesale supplier associations.',
        'Click on a product line to assign physical warehouse coordinates in the "Bin Location" field.',
        'Map Amazon ASINs and eBay Item IDs to your internal master SKU for exact multi-channel catalog sync.',
        'Use the CSV importer to upload bulk supplier price catalogs or bulk barcode updates.'
      ],
      features: [
        { name: 'Multi-Channel SKU Mapping', desc: 'Resolve different alias names on Amazon and eBay back to a single inventory record in your warehouse.' },
        { name: 'Warehouse Bin Coordinates', desc: 'Locate inventory items instantly on racks, corridors, or containers using alphabetical and numerical sector naming.' },
        { name: 'Supplier Price Logs', desc: 'Store procurement cost values for exact VAT margin calculations and gross profit audits.' }
      ],
      faqs: [
        { q: 'Why is there a "Unmapped SKU" warning?', a: 'This occurs when an imported order has a SKU identifier that doesn\'t exist in your master product catalog. Create the master item or link it to resolve.' },
        { q: 'How does stock allocation work?', a: 'When an order is downloaded, stock units are moved from "Available" to "Allocated" state, preventing double-selling.' }
      ]
    },
    {
      id: 'inventory',
      title: 'Inventory & Alerts',
      icon: Database,
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
      category: 'Logistics',
      summary: 'Control safety stock margins, set automated threshold warnings, and audit inventory values across your enterprise.',
      proTip: 'Set your global inventory alert threshold to at least 5 units to account for average supplier lead times and prevent out-of-stock events.',
      steps: [
        'Configure the low stock threshold limit using the slider or numeric input field.',
        'View the dynamic alert badges in the left sidebar showing exactly how many SKUs need attention.',
        'Trigger supplier replenishment alerts directly from the low-stock inventory dashboard.',
        'Check total capital tied up in inventory inside the summarized status overview panel.'
      ],
      features: [
        { name: 'Safety Stock Thresholds', desc: 'Receive automated notifications when stock drops below minimum safety parameters.' },
        { name: 'Supplier Purchase Triggers', desc: 'Generate wholesale purchase requests with pre-filled quantities to restore items to target stock levels.' },
        { name: 'Stock Valuation Audit', desc: 'Live calculations of total cost value of stock sitting in physical storage bins.' }
      ],
      faqs: [
        { q: 'How do I update stock levels manually?', a: 'Click the adjustment buttons next to any SKU inside the inventory grid. Enter your stock adjustment, and the audit log will record the change.' },
        { q: 'Can stock synchronize automatically back to eBay?', a: 'Yes! Our gateway transmits updated inventory counts to eBay and Amazon SP-API immediately when physical quantities are adjusted.' }
      ]
    },
    {
      id: 'profit_calculator',
      title: 'VAT & Profit Margin Tool',
      icon: Calculator,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      category: 'Financials',
      summary: 'Analyze real-time transaction net profits, calculate specific VAT duty statuses, and isolate fulfillment overheads per unit.',
      proTip: 'If your business is VAT Registered, select "VAT Registered" to reclaim purchase taxes (Input VAT) and accurately offset them against sales (Output VAT).',
      steps: [
        'Select a product preset from the drop-down to pre-fill standard procurement and packaging parameters.',
        'Toggle your company "VAT Registered" status to view different net yield models.',
        'Modify Fulfillment Fees, Courier costs, Labour picking rates, and Storage overheads to isolate unit costs.',
        'Read the detailed "VAT Duty Status" breakdown explaining your exactly payable or redeemable refund amounts.'
      ],
      features: [
        { name: 'Main VAT Duty Tracker', desc: 'Summarizes whether Output VAT collected exceeds reclaimable Input VAT, displaying payable custom duty or refund values.' },
        { name: 'Dynamic Margin & ROI Analytics', desc: 'Generates live percentages for Net Margins, Return on Investment, and Break-Even point analysis.' },
        { name: 'Cost Breakdown Stack', desc: 'Isolates every single overhead including commission percentages, packaging material, and storage fees.' }
      ],
      faqs: [
        { q: 'How does "VAT Exempt" status affect profits?', a: 'If you are not VAT registered, you cannot reclaim Input VAT paid on purchases. These taxes are added directly to procurement cost, reducing profit.' },
        { q: 'How is the platform commission calculated?', a: 'The calculator estimates average commission rates (default 15% for Amazon, 10% for eBay) based on your selected selling price.' }
      ]
    },
    {
      id: 'shipping',
      title: 'Courier & Shipping Rules',
      icon: Truck,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      category: 'Infrastructure',
      summary: 'Configure direct shipping provider contracts, manage rule engines, and specify weight-based postal routing rules.',
      proTip: 'Add weight-based routing rules so that any order weighing more than 2kg is automatically routed to DPD Next Day instead of Royal Mail Standard!',
      steps: [
        'Open the Courier config page to review active connections for Royal Mail, DPD, and FedEx.',
        'Toggle specific courier options ON or OFF to include/exclude them from the comparative rates deck.',
        'Create routing rule triggers (e.g., If Order Value > $100 -> Route to DPD Tracked with Signature).',
        'Input custom parcel templates to represent standard boxes used in your warehouse packing station.'
      ],
      features: [
        { name: 'Custom Rules Engine', desc: 'Build logical routing steps based on package weight, order value, carrier rate, or buyer destination.' },
        { name: 'Surcharges & Fuel Adjustments', desc: 'Add fuel or remote-area surcharges to ensure comparative rates match your actual invoices.' },
        { name: 'Box Size Presets', desc: 'Define Small Parcel, Medium Parcel, and Large Letter parameters to optimize dimensions calculations.' }
      ],
      faqs: [
        { q: 'Can I add custom courier providers?', a: 'We support Royal Mail, DPD, FedEx, and Amazon Ground as pre-integrated carriers out of the box. Contact Pankaj to map custom carrier APIs.' },
        { q: 'What is "Amazon Buy Shipping"?', a: 'Amazon\'s dedicated fulfillment service. Using this safeguards you from customer delivery disputes and counts positively towards seller performance.' }
      ]
    },
    {
      id: 'wms',
      title: 'Warehouse WMS & Suppliers',
      icon: Building2,
      color: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
      category: 'Logistics',
      summary: 'Manage suppliers, draft and approve formal Purchase Orders (POs), and receive wholesale stock shipments to automatically replenish bins.',
      proTip: 'Always mark a PO as "Received" immediately upon physical arrival. This triggers an automated stock intake and transfers items to their designated bins instantly.',
      steps: [
        'Add details of wholesale suppliers, lead times, and contact emails in the Suppliers database.',
        'Select "Create Purchase Order" and choose your target supplier.',
        'Add SKUs and quantities to draft your purchase items and automatically calculate wholesale order totals.',
        'Submit the PO to transition its state from "Draft" to "Sent". Once goods arrive, click "Receive Goods" to auto-increment stock.'
      ],
      features: [
        { name: 'Active PO Lifecycles', desc: 'Track procurement items dynamically across Draft, Sent, Partially Received, and Completed states.' },
        { name: 'Automated Supplier Cost Ledger', desc: 'Automatically matches wholesale product prices to PO line-items for zero-error procurement logs.' },
        { name: 'Direct Catalog Stock Sync', desc: 'Receiving PO items automatically recalculates available quantities and logs the inbound event in the system log.' }
      ],
      faqs: [
        { q: 'How do I cancel a sent Purchase Order?', a: 'You can revert a "Sent" PO back to "Draft" to edit quantities, or mark it as "Cancelled" to void the procurement transaction.' },
        { q: 'Can I link multiple suppliers to a single product SKU?', a: 'Yes! Inside the supplier list, you can define preferred alternate suppliers with variable lead times and cost matrices.' }
      ]
    },
    {
      id: 'printers',
      title: 'Printers & Spool Spitter',
      icon: Printer,
      color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
      category: 'Infrastructure',
      summary: 'Manage direct wireless label printing connections, control print queue spools, and adjust heat density configuration.',
      proTip: 'For thermal label printers, setting the heat print density to "10" is the sweet spot for razor-sharp barcodes that scanners will read instantly.',
      steps: [
        'Open the Printer Settings tab to select your active warehouse thermal printer (e.g. Zebra ZD420).',
        'Verify your connection channel (Wi-Fi, USB, or Network IP) and check the "Online" state.',
        'Run a "Test Print Label" to ensure proper alignment and calibrate thermal sensor ribbons.',
        'Monitor the spool history list to inspect past jobs, verify successful prints, or re-queue failed spool logs.'
      ],
      features: [
        { name: 'Virtual Thermal Spooler', desc: 'A real-time active print spool queue that monitors document rendering and hardware responses.' },
        { name: 'Heat & Speed Fine-Tuning', desc: 'Set density parameters (8 to 12 ips) to match carrier label requirements and maximize thermal printhead longevity.' },
        { name: 'ZPL & PDF Engine Native Support', desc: 'Supports ZPL direct code sequences for fast printing and standard PDF file formats for desk laser jets.' }
      ],
      faqs: [
        { q: 'Why did my label print blurry?', a: 'Blurs are typically caused by low print density settings or dirty printheads. Increase density parameters or run a cleaning cycle.' },
        { q: 'How do I clear a jammed print spool?', a: 'Click the "Purge Print Queue" button in the Spool Spitter panel to reset the print spool stack and restart active printing.' }
      ]
    },
    {
      id: 'integrations',
      title: 'Amazon & eBay Integrations',
      icon: Globe,
      color: 'text-emerald-600 bg-emerald-650/10 border-emerald-650/20',
      category: 'Getting Started',
      summary: 'Sync store orders without complex configurations. Learn the difference between pre-authorized delegated tokens and custom developer accounts.',
      proTip: 'Sellers credentials (Option A) are pre-certified and require no developer accounts. We strongly recommend this to avoid complex Amazon IAM setup.',
      steps: [
        'Toggle between "Option A: Seller ID Only" (Delegated) and "Option B: Custom Developer ID".',
        'Click "Connect Seller Store" or "Authorize eBay Account" to grant application access.',
        'Approve requested permissions on the official Amazon/eBay consent screen.',
        'Ensure Sandbox mode is configured in Settings if you wish to run secure mock transaction drills.'
      ],
      features: [
        { name: 'One-Click Handshake', desc: 'Avoid AWS developer accounts. Authenticate securely with pre-approved applications directly through Seller Central.' },
        { name: 'OAuth Token Auto-Renewer', desc: 'Refreshes background authorization keys dynamically without requiring regular manual re-authentications.' },
        { name: 'Live Webhook Listeners', desc: 'Immediate notification pushes from marketplaces whenever a customer completes a checkout.' }
      ],
      faqs: [
        { q: 'Is my data secure?', a: 'Yes! All client keys and tokens are fully encrypted. We never store credentials in plain text or share them with unauthorized clients.' },
        { q: 'What happens if a token expires?', a: 'The system auto-renews tokens during background synchronization tasks. If manual re-consent is ever required, you will receive an alert.' }
      ]
    },
    {
      id: 'template_designer',
      title: 'Form & Label Designer',
      icon: Layout,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      category: 'Infrastructure',
      summary: 'Fully interactive drag-and-drop document & thermal label layout designer. Customize commercial invoices, purchase orders, shipping labels, and packing slips.',
      proTip: 'Use bracket indicators like {{ORDER_ID}} or {{BUYER_NAME}} in text and barcode elements to inject dynamic customer database records automatically upon print.',
      steps: [
        'Open the "Template Designer" tab in the main application layout deck.',
        'Select a baseline document format preset (e.g., A4 Commercial Invoice or 4x6 Thermal Label).',
        'Add text, images, dividers, barcodes, or layout grids from the Tool Elements panel on the left.',
        'Click and hold elements on the interactive stage to drag and reposition them anywhere on the grid layout.',
        'Inspect elements to adjust properties (like font sizes, values, alignments, and widths) in the Live Properties Inspect sidebar.'
      ],
      features: [
        { name: 'Draggable Layout Canvas', desc: 'Precise mouse/pointer tracking to coordinate absolute positions for high-accuracy thermal printers.' },
        { name: 'Dynamic Field Mergers', desc: 'Embed database indicators for automated, zero-touch labels and packing slip content updates.' },
        { name: 'Multi-Format Stage Presets', desc: 'Pre-calibrated stages matching standard 4"x6" labels, A4 layouts, and custom supplier invoices.' }
      ],
      faqs: [
        { q: 'How do I align text blocks?', a: 'Select any text block on the canvas, then use the Properties Inspect panel to toggle between Left, Center, and Right alignment options.' },
        { q: 'Can I add a custom supplier logo?', a: 'Yes! Simply drag an Image element onto the canvas and paste your custom company public image URL into the Properties panel.' }
      ]
    }
  ];

  // Filter based on search term and category
  const filteredGuides = guides.filter(g => {
    const matchesSearch = (g.title || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (g.summary || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                          g.steps.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          g.features.some(f => (f.name || "").toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || g.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const activeGuide = guides.find(g => g.id === activeGuideId) || guides[1];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row overflow-hidden min-h-[680px]" id="enterprise-docs-workspace">
      
      {/* Sidebar - Search and List */}
      <div className="w-full lg:w-80 bg-slate-50 border-r border-slate-200 p-5 flex flex-col gap-4 shrink-0" id="docs-sidebar">
        
        {/* Header Title */}
        <div className="flex items-center gap-2 pb-1">
          <div className="bg-indigo-600 text-white p-2 rounded-xl">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Help Center & Docs</h3>
            <p className="text-[10px] text-slate-400">Master Logistics & WMS Features</p>
          </div>
        </div>

        {/* Search Field */}
        <div className={`relative transition-all duration-150 ${searchFocused ? 'ring-2 ring-indigo-500/20' : ''}`}>
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search guides, SKUs, WMS..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1.5 pb-1">
          {['all', 'Updates & Changelog', 'Getting Started', 'Logistics', 'Financials', 'Infrastructure'].map((cat) => (
            <button title="Perform action" 
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`text-[9.5px] px-2.5 py-1 rounded-full font-bold transition-all ${
                filterCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-500 hover:text-slate-800 border border-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Guides' : cat}
            </button>
          ))}
        </div>

        {/* List of Guides */}
        <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[420px] lg:max-h-none" id="guides-list-container">
          {filteredGuides.length === 0 ? (
            <div className="p-4 text-center text-slate-400 text-[11px] bg-white border border-dashed rounded-xl">
              <ShieldAlert className="w-5 h-5 mx-auto text-slate-300 mb-1" />
              No matching guides found. Try searching for "VAT", "Orders", or "POs".
            </div>
          ) : (
            filteredGuides.map((g) => {
              const GuideIcon = g.icon;
              const isActive = activeGuideId === g.id;
              return (
                <button title="Perform action" 
                  key={g.id}
                  onClick={() => setActiveGuideId(g.id)}
                  className={`w-full text-left p-3 rounded-xl border flex items-start gap-3 transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-white border-indigo-500 shadow-sm ring-1 ring-indigo-500/10' 
                      : 'bg-white/60 hover:bg-white border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 border ${g.color}`}>
                    <GuideIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 truncate">{g.title}</span>
                      <ChevronRight className={`w-3.5 h-3.5 text-slate-300 transition-transform ${isActive ? 'translate-x-0.5 text-indigo-500' : ''}`} />
                    </div>
                    <p className="text-[10px] text-slate-400 truncate leading-normal">{g.summary}</p>
                    <span className="inline-block text-[8.5px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-1.5 py-0.2 rounded mt-1">
                      {g.category}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Support Card Footer */}
        <div className="bg-slate-900 text-white p-3.5 rounded-2xl space-y-1.5 border border-slate-800 mt-auto">
          <h4 className="text-[10.5px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Need Assistance?
          </h4>
          <p className="text-[10px] text-slate-400 leading-normal">
            For advanced custom integrations, courier account provisioning, or custom logistics logic rules, contact Sellershub IT team.
          </p>
          <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px]">
            <span className="text-slate-400">Pankaj (Sellershub)</span>
            <a href="mailto:pankaj@sellershub.co.uk" className="text-emerald-400 font-bold hover:underline inline-flex items-center gap-1">
              Contact <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

      </div>

      {/* Guide Main Stage */}
      <div className="flex-1 p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto max-h-[680px] lg:max-h-none" id="guide-viewer-stage">
        
        {/* Active Title Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 border-slate-100">
          <div className="flex items-start gap-4">
            <div className={`p-3.5 rounded-2xl border ${activeGuide.color}`}>
              {React.createElement(activeGuide.icon, { className: "w-6 h-6" })}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-800">{activeGuide.title}</h2>
                <span className="text-[9.5px] font-extrabold uppercase tracking-widest bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">
                  {activeGuide.category} Module
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xl mt-1">
                {activeGuide.summary}
              </p>
            </div>
          </div>

          <div className="text-[11px] font-mono bg-slate-950 text-slate-400 border border-slate-800 px-3 py-1.5 rounded-xl shrink-0 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Last Updated: July 2026</span>
          </div>
        </div>

        {/* Two-Column Grid: Left Content, Right Features */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Flow Steps & FAQs */}
          <div className="xl:col-span-7 space-y-6">
            
            {/* Step-by-Step Interactive Workflows */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Step-by-Step Operator Workflow
              </h3>
              <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-200">
                {activeGuide.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs text-slate-600 leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Answers / FAQs */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-indigo-500" />
                Frequently Asked Questions
              </h3>
              <div className="space-y-3">
                {activeGuide.faqs.map((faq, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-xl p-3.5 space-y-1 bg-white hover:shadow-xs transition-shadow">
                    <h4 className="text-xs font-extrabold text-slate-800 flex items-start gap-1.5 leading-normal">
                      <span className="text-indigo-600 font-bold shrink-0">Q:</span>
                      {faq.q}
                    </h4>
                    <p className="text-[11.5px] text-slate-500 pl-4.5 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Capabilities & Pro-Tips */}
          <div className="xl:col-span-5 space-y-6">
            
            {/* Pro-Tip Highlight Card */}
            <div className="bg-amber-50/40 border border-amber-200/60 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-extrabold text-amber-800 uppercase tracking-wider text-[10px]">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                Warehouse Pro-Tip
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {activeGuide.proTip}
              </p>
            </div>

            {/* Major Capabilities Stack */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Core Capabilities Isolate
              </h3>
              <div className="space-y-2">
                {activeGuide.features.map((feat, idx) => (
                  <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                    <span className="text-[11px] font-black text-slate-700 uppercase tracking-wide block">
                      {feat.name}
                    </span>
                    <p className="text-[10.5px] text-slate-500 leading-normal">
                      {feat.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* General Warehouse Quick Checklists (Always Visible) */}
        <div className="border-t pt-6 border-slate-100 mt-auto space-y-4">
          <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 p-2.5 rounded-xl shrink-0">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold tracking-wide uppercase text-slate-200">Daily Dispatch Readiness Checklist</h4>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Ensure these 4 parameters are validated before running any bulk shipping queues.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center w-full md:w-auto">
              {[
                { title: 'Wi-Fi Thermal Printer On', status: '✓ Verified' },
                { title: 'Bulk Strategy Active', status: '✓ Checked' },
                { title: 'Credentials Synced', status: '✓ Online' },
                { title: 'Safety Threshold Safe', status: '✓ Calibrated' }
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl">
                  <span className="text-[9px] text-slate-500 uppercase font-black block tracking-wide">{item.title}</span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold mt-0.5 inline-block">{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
