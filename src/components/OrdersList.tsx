import React, { useState, useEffect, useMemo } from 'react';
import { Order, CarrierRate, Product, Category } from '../types';
import { useCrm } from '../hooks/useCrm';
import { 
  ShoppingBag, 
  MapPin, 
  Tag, 
  Sparkles, 
  Truck, 
  AlertTriangle, 
  CheckCircle, 
  Box, 
  ChevronRight, 
  Scale, 
  CornerDownRight,
  Info,
  ArrowUpDown,
  ExternalLink,
  Plus,
  X,
  RefreshCw,
  Printer,
  Check,
  Download,
  CheckCircle2,
  Settings, Search,
  FolderTree,
  Barcode
} from 'lucide-react';
import PackagePresetsManager from './PackagePresetsManager';

interface OrdersListProps {
  onUpdateSpecs?: (id: string, weightOz: number, dimensions: { length: number; width: number; height: number }) => Promise<void>;
  onBulkUpdateSpecs?: (ids: string[], weightOz: number, dimensions: { length: number; width: number; height: number }) => Promise<void>;
  onUpdateOrder?: (id: string, updates: Partial<Order>) => Promise<void>;
  unitSystem?: string;
  orders: Order[];
  selectedOrderIds: string[];
  onToggleSelectOrder: (id: string) => void;
  onToggleSelectAll: () => void;
  onSelectOrderDetails: (order: Order) => void;
  activeOrderId: string | null;
  onAnalyzeAddress: (order: Order) => void;
  onPackagingAdvise: (order: Order) => void;
  products: Product[];
  categories?: Category[];
  inventoryThreshold: number;
  onMergeOrders?: (orderIds: string[]) => Promise<void>;
  onBulkAction?: (action: 'cancel' | 'delete' | 'ship' | 'notify_channels', ids: string[]) => Promise<void>;
  onOpenDispatchConsole?: () => void;
}

export default function OrdersList({
  unitSystem,
  orders,
  selectedOrderIds,
  onToggleSelectOrder,
  onToggleSelectAll,
  onSelectOrderDetails,
  activeOrderId,
  onAnalyzeAddress,
  onPackagingAdvise,
  products,
  categories,
  inventoryThreshold,
  onMergeOrders,
  onBulkAction,
  onUpdateSpecs,
  onBulkUpdateSpecs,
  onUpdateOrder,
  onOpenDispatchConsole
}: OrdersListProps) {
  const { customers, tickets } = useCrm();
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'shipped'>('all');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [filterSpecs, setFilterSpecs] = useState<'all' | 'valid' | 'missing'>('all');
  const [filterLowStock, setFilterLowStock] = useState<'all' | 'low_stock'>('all');
  const [filterQty, setFilterQty] = useState<'all' | 'single' | 'multi' | 'bulk'>('all');
  const [filterBatchPrint, setFilterBatchPrint] = useState<'all' | 'ready_to_buy' | 'ready_to_print' | 'printed'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Compute available categories and matching order counts
  const availableCategories = useMemo(() => {
    if (categories && categories.length > 0) return categories;
    const catMap = new Map<string, { id: string; name: string }>();
    products.forEach(p => {
      if (p.categoryId) {
        catMap.set(p.categoryId, { id: p.categoryId, name: p.categoryId.replace(/_/g, ' ') });
      }
    });
    return Array.from(catMap.values());
  }, [categories, products]);

  const categoryOrderCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    availableCategories.forEach(cat => {
      counts[cat.id] = orders.filter(o => 
        o.items.some(it => {
          const cleanSku = (it.sku || '').toLowerCase().trim();
          const prod = products.find(p => 
            (p.sku && p.sku.toLowerCase().trim() === cleanSku) || 
            (p.mappedSku && p.mappedSku.toLowerCase().trim() === cleanSku)
          );
          return prod && (prod.categoryId === cat.id || (prod.categoryId && prod.categoryId.toLowerCase() === cat.id.toLowerCase()));
        })
      ).length;
    });
    // Uncategorized count
    counts['uncategorized'] = orders.filter(o => 
      o.items.some(it => {
        const cleanSku = (it.sku || '').toLowerCase().trim();
        const prod = products.find(p => 
          (p.sku && p.sku.toLowerCase().trim() === cleanSku) || 
          (p.mappedSku && p.mappedSku.toLowerCase().trim() === cleanSku)
        );
        return !prod || !prod.categoryId;
      })
    ).length;
    return counts;
  }, [orders, products, availableCategories]);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'state-asc' | 'state-desc' | 'cost-asc' | 'cost-desc' | 'value-desc' | 'value-asc'>('date-desc');
  const [mergingOrderIds, setMergingOrderIds] = useState<string[]>([]);
  const [packagePresets, setPackagePresets] = useState<any[]>([]);

  // Print modal states
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printTemplates, setPrintTemplates] = useState<any[]>([]);
  const [selectedPrintTemplate, setSelectedPrintTemplate] = useState<string>('');

  // Quick Print and Simulation States
  const [selectedPreviewOrder, setSelectedPreviewOrder] = useState<Order | null>(null);
  const [bulkPreviewOrders, setBulkPreviewOrders] = useState<Order[]>([]);
  const [selectedPreviewTemplate, setSelectedPreviewTemplate] = useState<any | null>(null);
  const [quickPrintNotification, setQuickPrintNotification] = useState<{ orderId: string; templateName: string } | null>(null);

  const loadPresets = () => {
    try {
      const saved = localStorage.getItem('appPackagePresets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          setPackagePresets(parsed);
          return;
        }
      }
    } catch(e){}
    setPackagePresets([
      { id: '1', name: 'Env (56g)', weight: 56, length: 15, width: 10, height: 1 },
      { id: '2', name: 'Small Box (225g)', weight: 225, length: 20, width: 15, height: 10 },
      { id: '3', name: 'Med Box (450g)', weight: 450, length: 30, width: 25, height: 15 },
      { id: '4', name: 'Large Box (900g)', weight: 900, length: 45, width: 35, height: 25 }
    ]);
  };

  useEffect(() => {
    loadPresets();
    window.addEventListener('presets_updated', loadPresets);
    return () => window.removeEventListener('presets_updated', loadPresets);
  }, []);

  const handleOpenPrintModal = () => {
    try {
      const saved = localStorage.getItem('appTemplates');
      if (saved) {
        const parsed = JSON.parse(saved);
        setPrintTemplates(parsed);
        if (parsed.length > 0) setSelectedPrintTemplate(parsed[0].id);
      }
    } catch(e) {}
    setIsPrintModalOpen(true);
  };

  const handlePrintSubmit = () => {
    // In a real app, this would generate PDFs based on the selectedPrintTemplate 
    // and send to the printer or open a new window for window.print()
    alert(`Generating labels using template ${selectedPrintTemplate} for ${selectedOrderIds.length} orders...`);
    setIsPrintModalOpen(false);
  };

  const getLatestTemplates = () => {
    try {
      const saved = localStorage.getItem('appTemplates');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) return parsed;
      }
    } catch(e) {}
    return [
      { id: 'shipping_label_4x6', name: 'Standard Shipping Label (4"x6")', type: 'label', width: 400, height: 600, elements: [
        { id: '1', type: 'text', x: 20, y: 20, width: 360, height: 40, content: 'Sellershub Express Delivery', fontSize: 14, fontWeight: 'black', align: 'center' },
        { id: '3', type: 'text', x: 20, y: 85, width: 180, height: 20, content: 'SHIP TO:', fontSize: 10, fontWeight: 'bold' },
        { id: '4', type: 'text', x: 20, y: 110, width: 360, height: 60, content: '{{BUYER_NAME}}\n{{SHIPPING_ADDRESS}}\n{{SHIPPING_CITY}}, {{POSTCODE}}', fontSize: 11, fontWeight: 'bold' },
        { id: '6', type: 'barcode', x: 50, y: 190, width: 300, height: 80, content: '{{ORDER_ID}}' },
        { id: '7', type: 'text', x: 20, y: 280, width: 360, height: 20, content: '*{{ORDER_ID}}*', fontSize: 10, align: 'center' },
        { id: '9', type: 'text', x: 20, y: 320, width: 170, height: 40, content: 'WEIGHT:\n{{TOTAL_WEIGHT}}', fontSize: 10, fontWeight: 'bold' }
      ]},
      { id: 'invoice_a4', name: 'Standard Commercial Invoice (A4)', type: 'invoice', width: 595, height: 842, elements: [
        { id: '1', type: 'text', x: 40, y: 250, width: 250, height: 30, content: 'SELLERSHUB HOLDINGS LTD', fontSize: 16, fontWeight: 'black' },
        { id: '2', type: 'text', x: 300, y: 40, width: 255, height: 30, content: 'COMMERCIAL INVOICE', fontSize: 16, fontWeight: 'black', align: 'right' },
        { id: '3', type: 'text', x: 40, y: 100, width: 250, height: 100, content: 'From:\nSellershub Warehouse\nSilicon Valley, CA\nUSA', fontSize: 10 },
        { id: '4', type: 'text', x: 300, y: 100, width: 255, height: 100, content: 'Bill To:\n{{BUYER_NAME}}\n{{SHIPPING_ADDRESS}}\n{{SHIPPING_CITY}}, {{POSTCODE}}', fontSize: 10, fontWeight: 'bold' },
        { id: '5', type: 'text', x: 40, y: 220, width: 515, height: 50, content: 'Order ID: {{ORDER_ID}}\nDate: {{CURRENT_DATE}}', fontSize: 10 },
        { id: '8', type: 'text', x: 300, y: 350, width: 255, height: 80, content: 'Subtotal: {{SUBTOTAL}}\nTax: {{TAX}}\nTotal Amount Paid: {{GRAND_TOTAL}}', fontSize: 11, fontWeight: 'bold', align: 'right' }
      ]},
      { id: 'packing_slip', name: 'Standard Packing Slip (A4)', type: 'slip', width: 595, height: 842, elements: [
        { id: '1', type: 'text', x: 40, y: 40, width: 250, height: 30, content: 'PACKING SLIP', fontSize: 16, fontWeight: 'black' },
        { id: '2', type: 'text', x: 300, y: 40, width: 255, height: 30, content: 'Order Ref: {{ORDER_ID}}', fontSize: 12, fontWeight: 'bold', align: 'right' },
        { id: '3', type: 'text', x: 40, y: 90, width: 250, height: 80, content: 'Ship To:\n{{BUYER_NAME}}\n{{SHIPPING_ADDRESS}}\n{{SHIPPING_CITY}}, {{POSTCODE}}', fontSize: 10, fontWeight: 'bold' },
        { id: '5', type: 'text', x: 40, y: 190, width: 515, height: 30, content: 'Please verify items upon receipt. Thank you for buying from us!', fontSize: 10, fontStyle: 'italic' }
      ]}
    ];
  };

  const renderElementContent = (content: string, order: Order) => {
    if (!content) return '';
    const addressStr = order.shippingAddress 
      ? `${order.shippingAddress.addressLine1 || ''}`
      : 'N/A';
    const cityStr = order.shippingAddress?.city || 'N/A';
    const postCodeStr = order.shippingAddress?.postalCode || 'N/A';
    const dateStr = new Date(order.orderDate || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const formattedTotal = new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency || 'USD' }).format(order.totalAmount);
    const formattedSubtotal = new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency || 'USD' }).format(order.totalAmount * 0.833);
    const formattedTax = new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency || 'USD' }).format(order.totalAmount * 0.167);

    return content
      .replace(/\{\{BUYER_NAME\}\}/g, order.buyerName || '')
      .replace(/\{\{ORDER_ID\}\}/g, order.id || '')
      .replace(/\{\{SHIPPING_ADDRESS\}\}/g, addressStr)
      .replace(/\{\{SHIPPING_CITY\}\}/g, cityStr)
      .replace(/\{\{POSTCODE\}\}/g, postCodeStr)
      .replace(/\{\{TOTAL_WEIGHT\}\}/g, order.weightOz ? `${order.weightOz} oz` : '8 oz')
      .replace(/\{\{SUBTOTAL\}\}/g, formattedSubtotal)
      .replace(/\{\{TAX\}\}/g, formattedTax)
      .replace(/\{\{GRAND_TOTAL\}\}/g, formattedTotal)
      .replace(/\{\{CURRENT_DATE\}\}/g, dateStr);
  };

  const handleQuickPrint = async (order: Order, template: any) => {
    setSelectedPreviewOrder(order);
    setSelectedPreviewTemplate(template);
    
    setQuickPrintNotification({ orderId: order.id, templateName: template.name });
    setTimeout(() => {
      setQuickPrintNotification(null);
    }, 4000);

    try {
      await fetch('/api/logs/create_quick_print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          templateName: template.name,
          templateType: template.type
        })
      });
    } catch(e) {
      console.error("Error logging quick print trigger", e);
    }
  };

  // Draggable columns state
  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('orders_deck_column_order_standard');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing standard column order from localStorage', e);
      }
    }
    return [
      'checkbox',
      'general_info',
      'shipping_method',
      'shipping_info',
      'customer',
      'folders',
      'fulfillment',
      'items',
      'totals'
    ];
  });
  const [draggedCol, setDraggedCol] = useState<string | null>(null);

  // Draggable columns state for PowerGrid view (ensuring Shipping Method appears before Weight by default)
  const [powerGridColumnOrder, setPowerGridColumnOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('orders_deck_column_order_powergrid');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing powergrid column order from localStorage', e);
      }
    }
    return [
      'checkbox',
      'order_info',
      'items',
      'recommendations',
      'shipping_method',
      'weight',
      'length',
      'width',
      'height',
      'postage_status'
    ];
  });
  const [draggedGridCol, setDraggedGridCol] = useState<string | null>(null);

  // Automatically persist layout preferences to local storage
  useEffect(() => {
    localStorage.setItem('orders_deck_column_order_standard', JSON.stringify(columnOrder));
  }, [columnOrder]);

  useEffect(() => {
    localStorage.setItem('orders_deck_column_order_powergrid', JSON.stringify(powerGridColumnOrder));
  }, [powerGridColumnOrder]);

  const [shippingPresets, setShippingPresets] = useState<any[]>([]);
  
  const fetchShippingPresets = async () => {
    try {
      const res = await fetch('/api/shipping-presets');
      if (res.ok) {
        const data = await res.json();
        setShippingPresets(data);
      }
    } catch (e) {
      console.error('Error fetching shipping presets:', e);
    }
  };

  useEffect(() => {
    fetchShippingPresets();
  }, []);

  const handleAddPreset = async (name: string, carrierName: string, serviceName: string, amount: number, deliveryDays: number) => {
    const newPreset = {
      id: 'preset_' + Math.random().toString(36).substring(2, 9),
      name,
      carrierName,
      serviceName,
      amount,
      currency: 'USD',
      deliveryDays,
      shippingType: 'buy_shipping'
    };
    const updated = [...shippingPresets, newPreset];
    setShippingPresets(updated);
    try {
      await fetch('/api/shipping-presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (e) {}
  };

  const handleDeletePreset = async (presetId: string) => {
    const updated = shippingPresets.filter(p => p.id !== presetId);
    setShippingPresets(updated);
    try {
      await fetch('/api/shipping-presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (e) {}
  };

  const handleBulkApplyShippingPreset = async (preset: any) => {
    if (selectedOrderIds.length === 0) return;
    try {
      const res = await fetch('/api/orders/bulk-update-shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedOrderIds, selectedRate: preset })
      });
      if (res.ok) {
        // Simple success note or rely on parent updates
      }
    } catch (e) {
      console.error("Error bulk updating shipping:", e);
    }
  };

  const handleDragStart = (e: React.DragEvent, colName: string) => {
    setDraggedCol(colName);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, targetCol: string) => {
    e.preventDefault();
    if (!draggedCol || draggedCol === targetCol) return;
    
    // Move draggedCol to targetCol position
    const newOrder = [...columnOrder];
    const draggedIdx = newOrder.indexOf(draggedCol);
    const targetIdx = newOrder.indexOf(targetCol);
    
    newOrder.splice(draggedIdx, 1);
    newOrder.splice(targetIdx, 0, draggedCol);
    setColumnOrder(newOrder);
  };

  const handleDragEnd = () => {
    setDraggedCol(null);
  };

  const handleGridDragStart = (e: React.DragEvent, colName: string) => {
    if (colName === 'checkbox') return;
    setDraggedGridCol(colName);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleGridDragOver = (e: React.DragEvent, targetCol: string) => {
    e.preventDefault();
    if (targetCol === 'checkbox') return;
    if (!draggedGridCol || draggedGridCol === targetCol) return;
    
    const newOrder = [...powerGridColumnOrder];
    const draggedIdx = newOrder.indexOf(draggedGridCol);
    const targetIdx = newOrder.indexOf(targetCol);
    
    if (draggedIdx !== -1 && targetIdx !== -1) {
      newOrder.splice(draggedIdx, 1);
      newOrder.splice(targetIdx, 0, draggedGridCol);
      setPowerGridColumnOrder(newOrder);
    }
  };

  const handleGridDragEnd = () => {
    setDraggedGridCol(null);
  };

  // --- EXCEL POWER GRID EXTRAORDINARY BULK EDIT ENGINE STATES & LOGIC ---
  const [viewMode, setViewMode] = useState<'standard' | 'powerGrid'>('powerGrid'); // Default to powerGrid for unmatched convenience
  const [gridSpecs, setGridSpecs] = useState<Record<string, { weightOz?: number; length?: number; width?: number; height?: number }>>({});
  const [gridStatus, setGridStatus] = useState<string | null>(null);
  const [showPresetsModal, setShowPresetsModal] = useState(false);

  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [createOrderForm, setCreateOrderForm] = useState({
    buyerName: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    phone: '',
    itemSku: '',
    itemTitle: '',
    itemQty: 1,
    itemPrice: 0,
    shippingPaid: 0,
  });
  const [crmSearchQuery, setCrmSearchQuery] = useState('');
  const [showCrmDropdown, setShowCrmDropdown] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  const allCustomers = React.useMemo(() => {
    const cmap = new Map<string, any>();
    
    orders.forEach(order => {
      const id = order.buyerEmail || order.buyerName;
      if (!id) return;
      if (!cmap.has(id)) {
        cmap.set(id, {
          id,
          name: order.buyerName,
          email: order.buyerEmail || '',
          phone: order.shippingAddress?.phone || '',
          address: order.shippingAddress?.addressLine1 || '',
          city: order.shippingAddress?.city || '',
          zip: order.shippingAddress?.postalCode || '',
          country: order.shippingAddress?.countryCode || ''
        });
      }
    });

    Object.keys(customers).forEach(id => {
      const override = customers[id];
      if (override.isManual && !cmap.has(id)) {
        cmap.set(id, {
          id,
          name: override.name || '',
          email: override.email || '',
          phone: override.phone || '',
          address: override.addressLine1 || '',
          city: override.city || '',
          zip: override.postcode || '',
          country: override.country || ''
        });
      } else if (cmap.has(id)) {
        const existing = cmap.get(id)!;
        cmap.set(id, { 
          ...existing, 
          name: override.name || existing.name,
          email: override.email || existing.email,
          phone: override.phone || existing.phone,
          address: override.addressLine1 || existing.address,
          city: override.city || existing.city,
          zip: override.postcode || existing.zip,
        });
      }
    });

    return Array.from(cmap.values());
  }, [orders, customers]);

  // Synchronize local specs dictionary whenever incoming orders list updates
  useEffect(() => {
    const specs: Record<string, { weightOz?: number; length?: number; width?: number; height?: number }> = {};
    orders.forEach(o => {
      specs[o.id] = {
        weightOz: o.weightOz,
        length: o.dimensions?.length,
        width: o.dimensions?.width,
        height: o.dimensions?.height
      };
    });
    setGridSpecs(specs);
  }, [orders]);

  // Parse product sizing strings, e.g., "12x8x4"
  const parseSize = (sizeStr: string) => {
    if (!sizeStr) return null;
    const clean = sizeStr.toLowerCase().replace(/\s+/g, '');
    const parts = clean.split('x');
    if (parts.length === 3) {
      const length = parseFloat(parts[0]) || 0;
      const width = parseFloat(parts[1]) || 0;
      const height = parseFloat(parts[2]) || 0;
      return { length, width, height };
    }
    return null;
  };

  // Retrieve intelligent specs recommendation from catalog
  const computeSpecsFromCatalog = (order: Order) => {
    let totalWeightOz = 0;
    let maxLength = 0;
    let maxWidth = 0;
    let totalHeight = 0;
    let foundAny = false;
    
    for (const item of order.items) {
      const prod = products.find(p => p.sku === item.sku || p.mappedSku === item.sku);
      if (prod) {
        foundAny = true;
        // Weight (multiplied by qty)
        const w = prod.weight || 0;
        totalWeightOz += w * item.quantity;
        
        // Dimensions (parse and stack or find max boundary)
        if (prod.size) {
          const dims = parseSize(prod.size);
          if (dims) {
            maxLength = Math.max(maxLength, dims.length);
            maxWidth = Math.max(maxWidth, dims.width);
            totalHeight += dims.height * item.quantity; // height stacks for simple shipping estimation
          }
        }
      }
    }
    
    if (!foundAny) return null;
    
    // Fill safe fallbacks if dims are completely missing but item matches
    if (maxLength === 0) maxLength = 8;
    if (maxWidth === 0) maxWidth = 6;
    if (totalHeight === 0) totalHeight = 2;
    
    return {
      weightOz: totalWeightOz || 8,
      length: maxLength,
      width: maxWidth,
      height: totalHeight
    };
  };

  // 1-Click Master Autofill for all incomplete orders
  const handleAutoFillAllGrid = async () => {
    const updatedSpecs = { ...gridSpecs };
    const ordersToUpdate: { id: string; w: number; dims: any }[] = [];
    
    filteredOrders.forEach(order => {
      if (order.status !== 'pending') return;
      
      const hasWeight = order.weightOz !== undefined && order.weightOz > 0;
      const hasDims = order.dimensions && order.dimensions.length > 0 && order.dimensions.width > 0 && order.dimensions.height > 0;
      const isComplete = hasWeight && hasDims;
      
      if (!isComplete) {
        const computed = computeSpecsFromCatalog(order);
        if (computed) {
          updatedSpecs[order.id] = {
            weightOz: computed.weightOz,
            length: computed.length,
            width: computed.width,
            height: computed.height
          };
          ordersToUpdate.push({
            id: order.id,
            w: computed.weightOz,
            dims: { length: computed.length, width: computed.width, height: computed.height }
          });
        }
      }
    });
    
    // Set state immediately for extreme responsive satisfaction
    setGridSpecs(updatedSpecs);
    
    if (ordersToUpdate.length > 0) {
      setGridStatus(`Auto-filling ${ordersToUpdate.length} orders...`);
      try {
        await Promise.all(ordersToUpdate.map(item => 
          onUpdateSpecs ? onUpdateSpecs(item.id, item.w, item.dims) : Promise.resolve()
        ));
        setGridStatus(`✓ Successfully auto-filled and saved specs for ${ordersToUpdate.length} orders from Product Catalog!`);
      } catch (err) {
        console.error(err);
        setGridStatus(`Failed to auto-save some updates to server.`);
      }
      setTimeout(() => setGridStatus(null), 5000);
    } else {
      setGridStatus(`All visible pending orders are complete, or no matching SKU catalog specs found.`);
      setTimeout(() => setGridStatus(null), 3000);
    }
  };

  // Grid Cell Keyboard Navigation Helper
  const focusCell = (col: string, rowIdx: number) => {
    const el = document.getElementById(`grid-input-${col}-${rowIdx}`) as HTMLInputElement | null;
    if (el) {
      el.focus();
      el.select();
    }
  };

  const handleKeyDownGrid = (e: React.KeyboardEvent<HTMLInputElement>, col: string, rowIdx: number, maxRows: number) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusCell(col, Math.min(rowIdx + 1, maxRows - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusCell(col, Math.max(rowIdx - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      focusCell(col, Math.min(rowIdx + 1, maxRows - 1));
    } else if (e.key === 'ArrowRight' && e.currentTarget.selectionEnd === e.currentTarget.value.length) {
      const cols = ['weight', 'length', 'width', 'height'];
      const curIdx = cols.indexOf(col);
      if (curIdx !== -1 && curIdx < cols.length - 1) {
        e.preventDefault();
        focusCell(cols[curIdx + 1], rowIdx);
      }
    } else if (e.key === 'ArrowLeft' && e.currentTarget.selectionStart === 0) {
      const cols = ['weight', 'length', 'width', 'height'];
      const curIdx = cols.indexOf(col);
      if (curIdx > 0) {
        e.preventDefault();
        focusCell(cols[curIdx - 1], rowIdx);
      }
    }
  };

  const handleChangeValue = (orderId: string, field: 'weightOz' | 'length' | 'width' | 'height', valStr: string) => {
    const valNum = valStr === '' ? undefined : parseFloat(valStr);
    
    let finalVal: number | undefined = undefined;
    if (valNum !== undefined) {
      if (field === 'weightOz') {
        finalVal = unitSystem === 'metric' ? valNum / 28.3495 : valNum;
      } else {
        finalVal = unitSystem === 'metric' ? valNum / 2.54 : valNum;
      }
    }

    setGridSpecs(prev => ({
      ...prev,
      [orderId]: {
        ...prev[orderId] || {},
        [field]: finalVal
      }
    }));
  };

  const handleBlurField = async (orderId: string) => {
    const local = gridSpecs[orderId] || {};
    if (onUpdateSpecs) {
      const w = local.weightOz ?? 0;
      const dims = {
        length: local.length ?? 0,
        width: local.width ?? 0,
        height: local.height ?? 0
      };
      await onUpdateSpecs(orderId, w, dims);
    }
  };

  // Bulk Edit Specs States

  const [bulkWeight, setBulkWeight] = useState('');
  const [bulkLength, setBulkLength] = useState('');
  const [bulkWidth, setBulkWidth] = useState('');
  const [bulkHeight, setBulkHeight] = useState('');
  const [bulkSuccess, setBulkSuccess] = useState<string | null>(null);
  
  const [appTemplates, setAppTemplates] = useState<any[]>([]);
  const [bulkSelectedTemplateId, setBulkSelectedTemplateId] = useState<string>('');

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const localT = localStorage.getItem('appTemplates');
        if (localT) {
          const parsed = JSON.parse(localT);
          setAppTemplates(parsed);
          if (parsed.length > 0) setBulkSelectedTemplateId(parsed[0].id);
        } else {
          const res = await fetch('/api/templates');
          const data = await res.json();
          setAppTemplates(data);
          if (data.length > 0) setBulkSelectedTemplateId(data[0].id);
        }
      } catch (e) {}
    };
    fetchTemplates();
  }, []);
  
  const handleBulkPrint = () => {
    if (!bulkSelectedTemplateId || selectedOrderIds.length === 0) return;
    const t = appTemplates.find(x => x.id === bulkSelectedTemplateId);
    if (!t) return;
    setBulkSuccess(`Opening print dialog for ${selectedOrderIds.length} orders with ${t.name}...`);
    setTimeout(() => {
      setBulkSuccess(null);
      // We open the print modal for all selected orders. The activeOrder will be null or first one.
      // But wait, the system only supports printing ONE order at a time using `setSelectedPreviewTemplate`.
      // We can just open a combined print view or print them sequentially, but for now we'll just set it to the first order to show the modal, or add a special bulk print handling.
      // Let's just set the first order for now, as real bulk printing would require a separate modal or page.
      if (selectedOrderIds.length > 0) {
        setQuickPrintNotification({ orderId: selectedOrderIds[0], templateName: t.name });
        const ords = selectedOrderIds.map(id => filteredOrders.find(o => o.id === id)).filter(Boolean) as Order[];
        setSelectedPreviewOrder(ords[0]);
        setSelectedPreviewTemplate(t);
        setBulkPreviewOrders(ords);
      }
    }, 1000);
  };


  const handleApplyBulkSpecs = async () => {
    if (!onBulkUpdateSpecs || selectedOrderIds.length === 0) return;
    
    const weightVal = bulkWeight ? parseFloat(bulkWeight) : undefined;
    const lVal = bulkLength ? parseFloat(bulkLength) : undefined;
    const wVal = bulkWidth ? parseFloat(bulkWidth) : undefined;
    const hVal = bulkHeight ? parseFloat(bulkHeight) : undefined;

    // Convert values based on unitSystem back to ounces/inches for database
    const weightOz = weightVal !== undefined ? (unitSystem === 'metric' ? weightVal / 28.3495 : weightVal) : undefined;
    const dimensions = (lVal !== undefined || wVal !== undefined || hVal !== undefined) ? {
      length: lVal !== undefined ? (unitSystem === 'metric' ? lVal / 2.54 : lVal) : 0,
      width: wVal !== undefined ? (unitSystem === 'metric' ? wVal / 2.54 : wVal) : 0,
      height: hVal !== undefined ? (unitSystem === 'metric' ? hVal / 2.54 : hVal) : 0,
    } : undefined;

    await onBulkUpdateSpecs(selectedOrderIds, weightOz as any, dimensions as any);
    setBulkSuccess(`Successfully updated physical specs for ${selectedOrderIds.length} orders.`);
    setBulkWeight('');
    setBulkLength('');
    setBulkWidth('');
    setBulkHeight('');
    setTimeout(() => setBulkSuccess(null), 3000);
  };

  // Filtering
  const filteredOrders = orders.filter(o => {
    const matchesSource = filterSource === 'all' || o.source === filterSource;
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchesTag = filterTag === 'all' || (o.tags && o.tags.includes(filterTag));
    
    const hasWeight = o.weightOz !== undefined && o.weightOz > 0;
    const hasDims = o.dimensions !== undefined && o.dimensions.length > 0 && o.dimensions.width > 0 && o.dimensions.height > 0;
    const hasSpecs = hasWeight && hasDims;
    const matchesSpecs = filterSpecs === 'all' || (filterSpecs === 'valid' && hasSpecs) || (filterSpecs === 'missing' && !hasSpecs);

    const matchesLowStock = filterLowStock === 'all' || o.items.some(item => {
      const p = products.find(prod => prod.sku === item.sku || prod.mappedSku === item.sku);
      return p && p.stock <= inventoryThreshold;
    });

    // Quantity to filter
    const totalQty = o.items.reduce((sum, item) => sum + item.quantity, 0);
    const matchesQty = filterQty === 'all' ||
      (filterQty === 'single' && totalQty === 1) ||
      (filterQty === 'multi' && totalQty > 1) ||
      (filterQty === 'bulk' && totalQty >= 5);

    const matchesBatchPrint = filterBatchPrint === 'all' ||
      (filterBatchPrint === 'ready_to_buy' && o.status === 'pending' && hasSpecs && !o.selectedRate) ||
      (filterBatchPrint === 'ready_to_print' && o.status === 'pending' && !!o.selectedRate) ||
      (filterBatchPrint === 'printed' && o.status === 'shipped' && !!o.trackingNumber);

    const matchesCategory = filterCategory === 'all' || 
      (filterCategory === 'uncategorized'
        ? o.items.some(item => {
            const cleanSku = (item.sku || '').toLowerCase().trim();
            const p = products.find(prod => 
              (prod.sku && prod.sku.toLowerCase().trim() === cleanSku) || 
              (prod.mappedSku && prod.mappedSku.toLowerCase().trim() === cleanSku)
            );
            return !p || !p.categoryId;
          })
        : o.items.some(item => {
            const cleanSku = (item.sku || '').toLowerCase().trim();
            const p = products.find(prod => 
              (prod.sku && prod.sku.toLowerCase().trim() === cleanSku) || 
              (prod.mappedSku && prod.mappedSku.toLowerCase().trim() === cleanSku)
            );
            return p && (p.categoryId === filterCategory || (p.categoryId && p.categoryId.toLowerCase() === filterCategory.toLowerCase()));
          })
      );

    const matchesSearch = 
      (o.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.buyerName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.shippingAddress.city || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.items.some(item => (item.title || "").toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.tags && o.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
      
    return matchesSource && matchesStatus && matchesTag && matchesSpecs && matchesLowStock && matchesSearch && matchesQty && matchesBatchPrint && matchesCategory;
  });

  // Find potential same customer orders that can be merged
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const mergeableGroups: { [key: string]: Order[] } = {};
  pendingOrders.forEach(o => {
    const nameKey = (o.buyerName || "").toLowerCase().trim();
    const addrKey = (o.shippingAddress.addressLine1 || "").toLowerCase().trim();
    const postalKey = (o.shippingAddress.postalCode || '').toLowerCase().trim();
    const key = `${nameKey}|${addrKey}|${postalKey}`;
    if (!mergeableGroups[key]) {
      mergeableGroups[key] = [];
    }
    mergeableGroups[key].push(o);
  });

  const mergeablePairs = Object.entries(mergeableGroups)
    .filter(([_, group]) => group.length >= 2)
    .map(([key, group]) => ({
      key,
      customerName: group[0].buyerName,
      address: `${group[0].shippingAddress.addressLine1}, ${group[0].shippingAddress.city}`,
      orders: group
    }));

  const selectedPendingOrders = orders.filter(o => selectedOrderIds.includes(o.id) && o.status === 'pending');
  const canMergeSelected = selectedPendingOrders.length >= 2 && (() => {
    const first = selectedPendingOrders[0];
    const mismatchName = selectedPendingOrders.some(o => 
      (o.buyerName || "").toLowerCase().trim() !== (first.buyerName || "").toLowerCase().trim()
    );
    const mismatchAddress = selectedPendingOrders.some(o => 
      (o.shippingAddress.addressLine1 || "").toLowerCase().trim() !== (first.shippingAddress.addressLine1 || "").toLowerCase().trim() ||
      (o.shippingAddress.postalCode || "").toLowerCase().trim() !== (first.shippingAddress.postalCode || "").toLowerCase().trim()
    );
    return !mismatchName && !mismatchAddress;
  })();

  // Sorting
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
      case 'date-asc':
        return new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();
      case 'state-asc':
        return (a.shippingAddress.stateOrRegion || '').localeCompare(b.shippingAddress.stateOrRegion || '');
      case 'state-desc':
        return (b.shippingAddress.stateOrRegion || '').localeCompare(a.shippingAddress.stateOrRegion || '');
      case 'cost-asc': {
        const costA = a.selectedRate?.amount ?? 0;
        const costB = b.selectedRate?.amount ?? 0;
        return costA - costB;
      }
      case 'cost-desc': {
        const costA = a.selectedRate?.amount ?? 0;
        const costB = b.selectedRate?.amount ?? 0;
        return costB - costA;
      }
      case 'value-desc':
        return b.totalAmount - a.totalAmount;
      case 'value-asc':
        return a.totalAmount - b.totalAmount;
      default:
        return 0;
    }
  });

  const allSelectedOnPage = sortedOrders.length > 0 && sortedOrders.every(o => selectedOrderIds.includes(o.id));

  const completePendingCount = pendingOrders.filter(o => o.weightOz !== undefined && o.weightOz > 0 && o.dimensions && o.dimensions.length > 0 && o.dimensions.width > 0 && o.dimensions.height > 0).length;
  const totalPendingCount = pendingOrders.length;
  const percentComplete = totalPendingCount > 0 ? Math.round((completePendingCount / totalPendingCount) * 100) : 100;

  const handleSelectIncomplete = () => {
    const incompleteIds = sortedOrders
      .filter(o => o.status === 'pending')
      .filter(o => {
        const hasWeight = o.weightOz !== undefined && o.weightOz > 0;
        const hasDims = o.dimensions && o.dimensions.length > 0 && o.dimensions.width > 0 && o.dimensions.height > 0;
        return !(hasWeight && hasDims);
      })
      .map(o => o.id);

    incompleteIds.forEach(id => {
      if (!selectedOrderIds.includes(id)) {
        onToggleSelectOrder(id);
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full" id="orders-list-component">
      {/* Search and Filters Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3" id="filters-header-container">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex gap-2 w-full md:w-auto items-center flex-1">
            <div className="relative w-full md:max-w-xs">
              <input
                type="text"
                placeholder="Search ID, buyer, city, tag or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 bg-white"
                id="order-search-input"
              />
            </div>
            <button 
              onClick={() => setIsCreatingOrder(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[11px] px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
              title="Create a manual direct order (e.g. Phone, Walk-in)"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Direct Order
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            {/* Category Filter Dropdown */}
            <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-white shadow-2xs hover:border-orange-300 transition-colors">
              <FolderTree className="w-3.5 h-3.5 text-orange-500 ml-2 mr-0.5 shrink-0" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-transparent text-[11px] font-bold text-slate-700 outline-none px-2 py-1 cursor-pointer"
                id="primary-category-filter-select"
                title="Isolate and view only orders associated with a specific selected product category"
              >
                <option value="all">All Categories ({orders.length})</option>
                {availableCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({categoryOrderCounts[cat.id] || 0})
                  </option>
                ))}
                <option value="uncategorized">Uncategorized ({categoryOrderCounts['uncategorized'] || 0})</option>
              </select>
            </div>

            {/* Launch Dispatch Station Button */}
            {onOpenDispatchConsole && (
              <button
                type="button"
                onClick={onOpenDispatchConsole}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
                title="Open Handheld Dispatch & Scan Station (Scan items, auto-generate labels, or confirm pre-printed orders)"
                id="open-dispatch-station-header-btn"
              >
                <Barcode className="w-3.5 h-3.5" />
                Dispatch Console
              </button>
            )}

            {/* Channel Selector */}
            <div className="flex border border-slate-200 rounded-lg p-0.5 bg-white">
              <select
                value={filterSource}
                onChange={(e: any) => setFilterSource(e.target.value)}
                className="bg-transparent text-[11px] font-bold text-slate-700 outline-none px-2 py-1 cursor-pointer"
              >
                <option value="all">All Channels</option>
                <option value="amazon">Amazon Stores</option>
                <option value="ebay">eBay Stores</option>
                <option value="shopify">Shopify Stores</option>
                <option value="prestashop">Prestashop Stores</option>
                <option value="onbuy">OnBuy Marketplace</option>
                <option value="etsy">Etsy Shop</option>
                <option value="temu">Temu Stores</option>
                <option value="tiktok">TikTok Shop</option>
              </select>
            </div>

            {/* Status Selector */}
            <div className="flex border border-slate-200 rounded-lg p-0.5 bg-white">
              <button title="Show all orders" 
                onClick={() => setFilterStatus('all')}
                className={`px-2 py-1 text-[11px] rounded-md font-medium transition-colors ${
                  filterStatus === 'all' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Status
              </button>
              <button title="Show pending orders" 
                onClick={() => setFilterStatus('pending')}
                className={`px-2 py-1 text-[11px] rounded-md font-medium transition-colors ${
                  filterStatus === 'pending' ? 'bg-orange-500 text-white' : 'text-slate-600 hover:text-orange-600'
                }`}
              >
                Pending
              </button>
              <button title="Show shipped orders" 
                onClick={() => setFilterStatus('shipped')}
                className={`px-2 py-1 text-[11px] rounded-md font-medium transition-colors ${
                  filterStatus === 'shipped' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-emerald-600'
                }`}
              >
                Shipped
              </button>
              <button title="Show parked orders" 
                onClick={() => setFilterStatus('parked')}
                className={`px-2 py-1 text-[11px] rounded-md font-medium transition-colors ${
                  filterStatus === 'parked' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:text-rose-600'
                }`}
              >
                Parked
              </button>
            </div>

            {/* Low Stock Quick Filter */}
            <button title="Toggle low stock warning filter" 
              onClick={() => setFilterLowStock(filterLowStock === 'all' ? 'low_stock' : 'all')}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 border ${
                filterLowStock === 'low_stock'
                  ? 'bg-rose-500 text-white border-rose-400'
                  : 'bg-white text-rose-600 border-rose-200 hover:bg-rose-50'
              }`}
              id="low-stock-filter-toggle"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Low Stock Orders
              {orders.filter(o => o.status === 'pending' && o.items.some(item => {
                const p = products.find(prod => prod.sku === item.sku || prod.mappedSku === item.sku);
                return p && p.stock <= inventoryThreshold;
              })).length > 0 && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${
                  filterLowStock === 'low_stock' ? 'bg-white text-rose-600' : 'bg-rose-600 text-white'
                }`}>
                  {orders.filter(o => o.status === 'pending' && o.items.some(item => {
                    const p = products.find(prod => prod.sku === item.sku || prod.mappedSku === item.sku);
                    return p && p.stock <= inventoryThreshold;
                  })).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* New Row of Filters for Tags and Weight/Dimensions checking */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100/80 text-xs">
          {availableCategories.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <FolderTree className="w-3 h-3 text-orange-500" /> Category:
              </span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-700 focus:outline-none text-xs"
                id="category-filter-select"
              >
                <option value="all">All Categories ({orders.length})</option>
                {availableCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({categoryOrderCounts[cat.id] || 0})
                  </option>
                ))}
                <option value="uncategorized">Uncategorized ({categoryOrderCounts['uncategorized'] || 0})</option>
              </select>
            </div>
          )}
          
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Channel Tag:</span>
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-700 focus:outline-none text-xs"
              id="tag-filter-select"
            >
              <option value="all">All Tags (Prime, Paid, etc.)</option>
              <option value="Prime Orders">Prime Orders (Amazon)</option>
              <option value="Extra Next Day Delivery">Extra Next Day Delivery (Paid)</option>
              <option value="Standard Delivery">Standard Delivery</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Physical Specs Check:</span>
            <select
              value={filterSpecs}
              onChange={(e: any) => setFilterSpecs(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-700 focus:outline-none text-xs"
              id="specs-filter-select"
            >
              <option value="all">All Orders Specs</option>
              <option value="valid">✓ Specs Complete (Ready for Shipping API)</option>
              <option value="missing">⚠️ Specs Incomplete (Weights & Dimensions Missing)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Item Qty:</span>
            <select
              value={filterQty}
              onChange={(e: any) => setFilterQty(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-700 focus:outline-none text-xs"
              id="qty-filter-select"
            >
              <option value="all">All Quantities</option>
              <option value="single">Single Item (Qty = 1)</option>
              <option value="multi">Multi-Item (Qty &gt; 1)</option>
              <option value="bulk">Bulk (Qty &ge; 5)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Batch Print Status:</span>
            <select
              value={filterBatchPrint}
              onChange={(e: any) => setFilterBatchPrint(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-700 focus:outline-none text-xs"
              id="batch-print-filter-select"
            >
              <option value="all">All Printing States</option>
              <option value="ready_to_buy">Ready to Batch-Buy Labels (Pending + Specs)</option>
              <option value="ready_to_print">Ready to Batch-Print (Pending + Selected Courier)</option>
              <option value="printed">Completed / Shipped Labels</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 md:ml-auto bg-slate-100/60 px-2 py-1 rounded-lg border border-slate-200/50">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500 font-semibold text-[11px]">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-white border border-slate-200 rounded-md px-2 py-0.5 font-bold text-slate-700 focus:outline-none text-xs shadow-xs"
              id="orders-sort-select"
            >
              <option value="date-desc">Date Created (Newest First)</option>
              <option value="date-asc">Date Created (Oldest First)</option>
              <option value="state-asc">Destination State (A-Z)</option>
              <option value="state-desc">Destination State (Z-A)</option>
              <option value="cost-asc">Shipping Cost (Lowest First)</option>
              <option value="cost-desc">Shipping Cost (Highest First)</option>
              <option value="value-desc">Order Value (Highest First)</option>
              <option value="value-asc">Order Value (Lowest First)</option>
            </select>
          </div>
        </div>

        {/* Active Category Isolation Banner */}
        {filterCategory !== 'all' && (
          <div className="flex items-center justify-between bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-lg text-xs animate-fadeIn">
            <div className="flex items-center gap-2 text-orange-950 font-bold">
              <FolderTree className="w-4 h-4 text-orange-600 shrink-0" />
              <span>
                Isolated Category: <span className="underline decoration-orange-400 font-extrabold">{availableCategories.find(c => c.id === filterCategory)?.name || (filterCategory === 'uncategorized' ? 'Uncategorized' : filterCategory)}</span>
              </span>
              <span className="bg-orange-200/80 text-orange-900 text-[10px] px-2 py-0.5 rounded-full font-black">
                {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} isolated
              </span>
            </div>
            <button 
              type="button"
              onClick={() => setFilterCategory('all')}
              className="text-orange-700 hover:text-orange-950 font-extrabold flex items-center gap-1 hover:underline text-[11px] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Clear Category Isolation
            </button>
          </div>
        )}
      </div>

      {/* Consolidation Suggestions Alert */}
      {onMergeOrders && mergeablePairs.length > 0 && (
        <div className="mx-4 mt-3 p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex flex-col gap-2.5 shadow-sm shrink-0" id="mergeable-orders-alert">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-slate-800 block mb-0.5">💡 Customer Order Consolidation Suggestions</span>
              <p className="text-slate-600 leading-normal">
                We detected multiple separate pending orders from the same buyer shipping to the same address. Consolidating these orders can save up to 45% in carrier postage fees and reduce packaging waste!
              </p>
            </div>
          </div>
          
          <div className="divide-y divide-indigo-100/50 bg-white border border-indigo-100/60 rounded-lg overflow-hidden">
            {mergeablePairs.map((pair) => {
              const orderIds = pair.orders.map(o => o.id);
              const isMerging = orderIds.every(id => mergingOrderIds.includes(id));

              return (
                <div key={pair.key} className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-800">{pair.customerName}</span>
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded-full">
                        {pair.orders.length} duplicate orders found
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] font-medium">📍 {pair.address}</p>
                    <div className="flex flex-wrap gap-1.5 pt-0.5 font-mono text-[10px]">
                      {pair.orders.map(o => (
                        <span key={o.id} className="bg-slate-100 text-slate-600 px-1 rounded">
                          {o.id} ({o.items.reduce((s, i) => s + i.quantity, 0)} items)
                        </span>
                      ))}
                    </div>
                  </div>

                  <button title="Print document"
                  type="button"
                  onClick={handleOpenPrintModal}
                  className="bg-purple-100 hover:bg-purple-200 text-purple-800 font-extrabold text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Box className="w-3.5 h-3.5" /> Print
                </button>
                <button title="Refresh data"
                    onClick={async () => {
                      setMergingOrderIds(prev => [...prev, ...orderIds]);
                      try {
                        await onMergeOrders(orderIds);
                      } catch (e) {
                        console.error("Consolidation error:", e);
                      } finally {
                        setMergingOrderIds(prev => prev.filter(id => !orderIds.includes(id)));
                      }
                    }}
                    disabled={isMerging}
                    className="self-start sm:self-center shrink-0 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-extrabold text-[11px] px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                  >
                    {isMerging ? 'Merging...' : 'Consolidate Orders'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {selectedOrderIds.length > 0 && (
        <div className="mx-4 mt-3 flex flex-col gap-2 shrink-0 animate-fade-in" id="bulk-edit-panel">
          <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl flex flex-col sm:flex-row items-center gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                <Box className="w-4 h-4" />
              </span>
              <div className="text-xs">
                <span className="font-extrabold text-slate-800 block">Bulk Edit Specs ({selectedOrderIds.length} orders selected)</span>
                <p className="text-slate-500 text-[10px] mb-1">Apply identical dimensions and weight to all selected orders.</p>
                
                {/* Quick Presets row */}
                <div className="flex flex-wrap gap-1 items-center">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Presets:</span>
                  {packagePresets.map(preset => (
                    <button title="Apply package preset to selected orders" 
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setBulkWeight(String(preset.weight));
                        setBulkLength(String(preset.length));
                        setBulkWidth(String(preset.width));
                        setBulkHeight(String(preset.height));
                      }}
                      className="text-[9px] bg-white border border-slate-200 hover:bg-slate-50 font-extrabold px-1.5 py-0.5 rounded cursor-pointer text-slate-600 transition-colors shadow-2xs"
                    >
                      📦 {preset.name}
                    </button>
                  ))}
                  <button title="Manage Presets" type="button" onClick={() => setShowPresetsModal(true)} className="text-[9px] text-indigo-600 hover:text-indigo-800 font-extrabold flex items-center gap-0.5 ml-2 transition-colors">
                    <Settings className="w-3 h-3" /> Manage
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
              {/* Weight Input */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1">
                <span className="text-[10px] font-bold text-slate-400">Weight:</span>
                <input
                  type="number"
                  placeholder={unitSystem === 'metric' ? 'grams' : 'oz'}
                  value={bulkWeight}
                  onChange={(e) => setBulkWeight(e.target.value)}
                  className="w-16 text-xs font-mono bg-transparent outline-none text-center font-bold"
                />
                <span className="text-[10px] font-bold text-slate-500">{unitSystem === 'metric' ? 'g' : 'oz'}</span>
              </div>
              {/* Length Input */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1">
                <span className="text-[10px] font-bold text-slate-400">L:</span>
                <input
                  type="number"
                  placeholder="Length"
                  value={bulkLength}
                  onChange={(e) => setBulkLength(e.target.value)}
                  className="w-12 text-xs font-mono bg-transparent outline-none text-center font-bold"
                />
              </div>
              {/* Width Input */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1">
                <span className="text-[10px] font-bold text-slate-400">W:</span>
                <input
                  type="number"
                  placeholder="Width"
                  value={bulkWidth}
                  onChange={(e) => setBulkWidth(e.target.value)}
                  className="w-12 text-xs font-mono bg-transparent outline-none text-center font-bold"
                />
              </div>
              {/* Height Input */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1">
                <span className="text-[10px] font-bold text-slate-400">H:</span>
                <input
                  type="number"
                  placeholder="Height"
                  value={bulkHeight}
                  onChange={(e) => setBulkHeight(e.target.value)}
                  className="w-12 text-xs font-mono bg-transparent outline-none text-center font-bold"
                />
              </div>
              <span className="text-[10px] font-bold text-slate-500">{unitSystem === 'metric' ? 'cm' : 'in'}</span>
              
              <button title="Execute ApplyBulkSpecs"
                type="button"
                onClick={handleApplyBulkSpecs}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[11px] px-3.5 py-1.5 rounded-lg transition-colors shadow-xs"
              >
                Apply Specs
              </button>
            </div>
          </div>
          
          <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl flex flex-col sm:flex-row items-center gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                <Printer className="w-4 h-4" />
              </span>
              <div className="text-xs">
                <span className="font-extrabold text-slate-800 block">Bulk Print Templates</span>
                <p className="text-slate-500 text-[10px] mb-1">Select a saved template (e.g. AMZ SWA LABELS, Packing Slip) to print for all selected orders.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:ml-auto">
              <select
                value={bulkSelectedTemplateId}
                onChange={(e) => setBulkSelectedTemplateId(e.target.value)}
                className="bg-white border border-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg outline-none"
              >
                {appTemplates.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.type})</option>
                ))}
              </select>
              
              <button title="Print document"
                type="button"
                onClick={handleBulkPrint}
                disabled={!bulkSelectedTemplateId}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-extrabold text-[11px] px-3.5 py-1.5 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Bulk Print ({selectedOrderIds.length})
              </button>
            </div>
          </div>
          
          {bulkSuccess && (
            <div className="w-full text-xs text-emerald-600 font-bold mt-1 text-center sm:text-right">
              {bulkSuccess}
            </div>
          )}
        </div>
      )}


      {/* View Mode Switcher Tab Bar */}
      <div className="mx-4 mt-3 border-b border-slate-200/60 pb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">Fulfillment Workspace Mode:</span>
          {gridStatus && (
            <span className="text-[11px] font-extrabold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-3xs animate-pulse">
              {gridStatus}
            </span>
          )}
        </div>
        <div className="flex gap-1 self-stretch sm:self-auto justify-end">
          <button title="Perform action" 
            type="button"
            onClick={() => setViewMode('standard')}
            className={`px-3 py-1.5 text-xs font-extrabold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer shadow-3xs ${
              viewMode === 'standard'
                ? 'bg-white text-slate-800 border-slate-200 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 border-transparent bg-transparent'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
            Standard Deck Rows
          </button>
          <button title="Perform action" 
            type="button"
            onClick={() => setViewMode('powerGrid')}
            className={`px-3 py-1.5 text-xs font-extrabold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer shadow-3xs ${
              viewMode === 'powerGrid'
                ? 'bg-slate-900 text-emerald-400 border-slate-800 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 border-transparent bg-transparent'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            ⚡ Power Grid Spec Editor (High Density)
          </button>
        </div>
      </div>

      {/* Draggable Shipping Presets Ribbon */}
      <div className="mx-4 mt-2 bg-gradient-to-r from-indigo-950 to-slate-900 border border-indigo-900/60 p-3 rounded-xl shadow-md shrink-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-white font-bold text-xs">
            <Truck className="w-4 h-4 text-indigo-400 animate-bounce" />
            <span className="tracking-wide">DRAGGABLE SHIPPING PRESETS TOOLBAR</span>
          </div>
          <p className="text-[10px] text-slate-300">
            Drag a preset card and <strong>drop it</strong> directly onto any order's <strong>Shipping Method</strong> cell! Or select orders and click a preset to apply in bulk.
          </p>
        </div>
        
        {/* Preset list */}
        <div className="flex flex-wrap items-center gap-2 max-h-[80px] overflow-y-auto pr-2">
          {shippingPresets.map((preset) => (
            <div
              key={preset.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/json', JSON.stringify(preset));
              }}
              onClick={() => {
                if (selectedOrderIds.length > 0) {
                  handleBulkApplyShippingPreset(preset);
                }
              }}
              className="px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-800/90 border border-indigo-500/40 hover:border-indigo-400 rounded-lg text-white text-[10.5px] cursor-grab active:cursor-grabbing transition-all flex items-center gap-2 group relative select-none shadow-sm"
              title="Drag onto cell or select orders and click to bulk apply"
            >
              <div className="flex flex-col text-left">
                <span className="font-bold text-[10px] text-indigo-300 flex items-center gap-1">
                  {preset.name}
                  {selectedOrderIds.length > 0 && (
                    <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1 rounded">Apply Bulk</span>
                  )}
                </span>
                <span className="text-[8.5px] text-slate-400 font-mono truncate max-w-[120px]">{preset.serviceName}</span>
              </div>
              <span className="font-black text-indigo-400 font-mono text-[10px] bg-indigo-500/10 px-1.5 py-0.5 rounded">${preset.amount}</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePreset(preset.id);
                }}
                className="text-slate-500 hover:text-rose-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity ml-1.5 text-[11px] cursor-pointer"
                title="Delete Preset"
              >
                ×
              </button>
            </div>
          ))}

          {/* Quick Creator Button */}
          <button title="Perform action" 
            onClick={() => {
              const name = prompt("Enter Preset Name (e.g. USPS Ground)", "USPS Ground");
              if (!name) return;
              const carrier = prompt("Enter Carrier Name (e.g. Amazon Buy Shipping)", "Amazon Buy Shipping");
              if (!carrier) return;
              const service = prompt("Enter Service Class (e.g. USPS Ground Advantage (via Amazon))", "USPS Ground Advantage (via Amazon)");
              if (!service) return;
              const amtStr = prompt("Enter Amount / Rate ($)", "4.85");
              if (!amtStr) return;
              handleAddPreset(name, carrier, service, parseFloat(amtStr), 3);
            }}
            className="px-2 py-1 bg-indigo-950/40 hover:bg-indigo-950/70 border border-dashed border-indigo-500/40 rounded-lg text-indigo-300 hover:text-indigo-200 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Add Preset
          </button>
        </div>
      </div>

      {/* Orders Table/List */}
      <div className="flex-1 overflow-y-auto" id="orders-scroll-area">
        {sortedOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <ShoppingBag className="w-12 h-12 mx-auto stroke-[1.5] mb-3 text-slate-300" />
            <p className="font-medium text-sm text-slate-600">No matching orders found</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting search filters or manual order synchronization.</p>
          </div>
        ) : viewMode === 'powerGrid' ? (
          <div className="p-4" id="power-grid-view-wrapper">
            <div className="bg-slate-900/5 border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
              {/* Quick instructions / actions bar */}
              <div className="bg-slate-900 px-4 py-2.5 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-2 border-b border-slate-800">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-slate-200 font-bold text-xs tracking-wide">
                      Spreadsheet Spec Quick-Entry Workspace
                    </span>
                    <span className="text-slate-400 text-[10px] hidden md:inline">
                      (Use ↑, ↓, Enter or Tab to navigate cells)
                    </span>
                  </div>
                  
                  {/* Progress Meter */}
                  <div className="flex items-center gap-2 text-[10.5px] border-l border-slate-800 pl-3">
                    <span className="text-slate-400 font-medium">Specs Progress:</span>
                    <div className="w-20 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/50">
                      <div className="bg-emerald-400 h-full transition-all duration-500" style={{ width: `${percentComplete}%` }}></div>
                    </div>
                    <span className="text-emerald-400 font-bold font-mono">{completePendingCount}/{totalPendingCount} ({percentComplete}%)</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 w-full xl:w-auto justify-end">
                  <button
                    type="button"
                    onClick={handleSelectIncomplete}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[11px] px-3 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer border border-indigo-500"
                    title="Select all pending orders missing weight or dimension metrics"
                  >
                    Select Incomplete ({totalPendingCount - completePendingCount})
                  </button>
                  <button title="Execute AutoFillAllGrid"
                    type="button"
                    onClick={handleAutoFillAllGrid}
                    className="bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 font-extrabold text-[11px] px-3.5 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                    ✨ 1-Click Auto-Fill Specs from SKU Catalog
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1250px] text-xs" id="power-grid-sheet-table">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-mono text-[10px] tracking-wider uppercase">
                      {powerGridColumnOrder.map((col) => {
                        if (col === 'checkbox') {
                          return (
                            <th key={col} className="w-12 py-3 px-3 text-center border-r border-slate-200/60">
                              <input
                                type="checkbox"
                                checked={allSelectedOnPage}
                                onChange={onToggleSelectAll}
                                className="rounded text-emerald-500 focus:ring-emerald-500 cursor-pointer w-3.5 h-3.5"
                              />
                            </th>
                          );
                        }

                        const gridColLabels: Record<string, string> = {
                          order_info: 'Order ID & Date',
                          items: 'Items & SKUs',
                          recommendations: 'Auto-Match Recommendations',
                          shipping_method: 'Shipping Method / Service',
                          weight: `Weight (${unitSystem === 'metric' ? 'g' : 'oz'})`,
                          length: `Length (${unitSystem === 'metric' ? 'cm' : 'in'})`,
                          width: `Width (${unitSystem === 'metric' ? 'cm' : 'in'})`,
                          height: `Height (${unitSystem === 'metric' ? 'cm' : 'in'})`,
                          postage_status: 'Postage Status / Presets'
                        };

                        const gridColWidths: Record<string, string> = {
                          order_info: 'w-48',
                          items: 'w-64',
                          recommendations: 'w-56',
                          shipping_method: 'w-52 text-center bg-indigo-50/15 border-dashed border border-indigo-200/30',
                          weight: 'w-36 text-center bg-indigo-50/20',
                          length: 'w-24 text-center',
                          width: 'w-24 text-center',
                          height: 'w-24 text-center',
                          postage_status: 'text-center'
                        };

                        return (
                          <th
                            key={col}
                            draggable
                            onDragStart={(e) => handleGridDragStart(e, col)}
                            onDragOver={(e) => handleGridDragOver(e, col)}
                            onDragEnd={handleGridDragEnd}
                            className={`py-3 px-3 border-r border-slate-200/60 font-extrabold select-none cursor-grab active:cursor-grabbing hover:bg-slate-100 transition-colors ${gridColWidths[col] || ''}`}
                            style={{ opacity: draggedGridCol === col ? 0.4 : 1 }}
                          >
                            <div className="flex items-center gap-1.5 justify-center">
                              <span className="text-[10px] text-slate-300 font-sans">⋮⋮</span>
                              <span className="truncate">{gridColLabels[col]}</span>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {sortedOrders.map((order, rowIdx) => {
                      const computed = computeSpecsFromCatalog(order);
                      const isSelected = selectedOrderIds.includes(order.id);
                      
                      const localSpecs = gridSpecs[order.id] || {
                        weightOz: order.weightOz,
                        length: order.dimensions?.length,
                        width: order.dimensions?.width,
                        height: order.dimensions?.height
                      };

                      const displayWeight = localSpecs.weightOz !== undefined 
                        ? (unitSystem === 'metric' ? Math.round(localSpecs.weightOz * 28.3495) : localSpecs.weightOz) 
                        : '';

                      const displayLength = localSpecs.length !== undefined
                        ? (unitSystem === 'metric' ? Math.round(localSpecs.length * 2.54) : localSpecs.length)
                        : '';

                      const displayWidth = localSpecs.width !== undefined
                        ? (unitSystem === 'metric' ? Math.round(localSpecs.width * 2.54) : localSpecs.width)
                        : '';

                      const displayHeight = localSpecs.height !== undefined
                        ? (unitSystem === 'metric' ? Math.round(localSpecs.height * 2.54) : localSpecs.height)
                        : '';

                      const isComplete = order.weightOz !== undefined && order.weightOz > 0 &&
                        order.dimensions && order.dimensions.length > 0 && order.dimensions.width > 0 && order.dimensions.height > 0;

                      return (
                        <tr
                          key={order.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isSelected ? 'bg-indigo-50/20' : ''
                          } ${!isComplete ? 'bg-amber-50/10' : ''}`}
                        >
                          {powerGridColumnOrder.map((col) => {
                            switch (col) {
                              case 'checkbox':
                                return (
                                  <td key={col} className="py-2.5 px-3 text-center border-r border-slate-200 bg-slate-50/35">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => onToggleSelectOrder(order.id)}
                                      className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer w-3.5 h-3.5"
                                    />
                                  </td>
                                );
                              case 'order_info':
                                return (
                                  <td key={col} className="py-2.5 px-3 border-r border-slate-200">
                                    <div className="flex items-center gap-2">
                                      {order.source === 'amazon' && (
                                        <span className="bg-amber-100 text-amber-800 font-extrabold text-[9px] px-1.5 py-0.5 rounded-md uppercase tracking-wider">AMZ</span>
                                      )}
                                      {order.source === 'ebay' && (
                                        <span className="bg-blue-100 text-blue-800 font-extrabold text-[9px] px-1.5 py-0.5 rounded-md uppercase tracking-wider">eBay</span>
                                      )}
                                      {order.source === 'shopify' && (
                                        <span className="bg-green-100 text-green-800 font-extrabold text-[9px] px-1.5 py-0.5 rounded-md uppercase tracking-wider">SHPFY</span>
                                      )}
                                      {!['amazon', 'ebay', 'shopify'].includes(order.source) && (
                                        <span className="bg-purple-100 text-purple-800 font-extrabold text-[9px] px-1.5 py-0.5 rounded-md uppercase tracking-wider">{order.source}</span>
                                      )}
                                      <span className="font-mono font-bold text-slate-800">{order.id}</span>
                                      <button  
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onSelectOrderDetails(order);
                                        }}
                                        className="text-indigo-600 hover:text-indigo-800 inline-flex items-center" 
                                        title="Open order workspace tab"
                                      >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    <div className="text-slate-400 text-[10px] mt-0.5 flex flex-wrap gap-x-2">
                                      <span>{order.orderDate}</span>
                                      <span className="text-slate-500 font-semibold">{order.buyerName || order.shippingAddress?.name}</span>
                                      <span className="text-slate-400 font-mono">({order.shippingAddress?.stateOrRegion})</span>
                                    </div>
                                  </td>
                                );
                              case 'items':
                                return (
                                  <td key={col} className="py-2.5 px-3 border-r border-slate-200">
                                    <div className="space-y-1">
                                      {order.items.map((it, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-[11px]">
                                          <span className="text-slate-700 font-medium truncate max-w-[150px]" title={it.title}>
                                            {it.title}
                                          </span>
                                          <span className="font-mono font-bold bg-slate-100 text-slate-700 px-1 py-0.2 rounded text-[10px] ml-1.5 shrink-0">
                                            {it.quantity}x {it.sku}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </td>
                                );
                              case 'recommendations':
                                return (
                                  <td key={col} className="py-2.5 px-3 border-r border-slate-200">
                                    {computed ? (
                                      <button
                                        type="button"
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          setGridSpecs(prev => ({
                                            ...prev,
                                            [order.id]: {
                                              weightOz: computed.weightOz,
                                              length: computed.length,
                                              width: computed.width,
                                              height: computed.height
                                            }
                                          }));
                                          if (onUpdateSpecs) {
                                            await onUpdateSpecs(order.id, computed.weightOz, {
                                              length: computed.length,
                                              width: computed.width,
                                              height: computed.height
                                            });
                                          }
                                        }}
                                        className="w-full inline-flex items-center justify-between gap-1.5 bg-emerald-50/50 hover:bg-emerald-100 border border-emerald-200 hover:border-emerald-300 text-emerald-800 font-extrabold text-[10px] px-2 py-1 rounded-lg cursor-pointer transition-colors"
                                        title="Click to instantly auto-fill specs from Product database values"
                                      >
                                        <span className="flex items-center gap-1">
                                          <Sparkles className="w-3 h-3 text-emerald-500 animate-pulse" />
                                          Ready in Catalog
                                        </span>
                                        <span className="font-mono bg-emerald-100/75 text-emerald-800 px-1 py-0.2 rounded">
                                          {unitSystem === 'metric' ? `${Math.round(computed.weightOz * 28.3495)}g` : `${computed.weightOz}oz`}
                                        </span>
                                      </button>
                                    ) : (
                                      <span className="text-slate-400 text-[10px] font-medium flex items-center gap-1.5 pl-1.5">
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                        No SKU specs in database
                                      </span>
                                    )}
                                  </td>
                                );
                              case 'shipping_method':
                                return (
                                  <td 
                                    key={col}
                                    className="py-2 px-2 border-r border-slate-200 bg-indigo-50/[0.03] transition-colors"
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                      e.currentTarget.classList.add('bg-indigo-50/40');
                                    }}
                                    onDragLeave={(e) => {
                                      e.currentTarget.classList.remove('bg-indigo-50/40');
                                    }}
                                    onDrop={async (e) => {
                                      e.preventDefault();
                                      e.currentTarget.classList.remove('bg-indigo-50/40');
                                      try {
                                        const presetData = JSON.parse(e.dataTransfer.getData('application/json'));
                                        if (presetData && presetData.serviceName) {
                                          if (onUpdateOrder) {
                                            await onUpdateOrder(order.id, { 
                                              selectedRate: presetData,
                                              carrier: presetData.carrierName,
                                              serviceClass: presetData.serviceName
                                            });
                                          }
                                        }
                                      } catch (err) {
                                        console.error("Error parsing drop data:", err);
                                      }
                                    }}
                                  >
                                    <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
                                      {order.selectedRate ? (
                                        <div className="bg-white border border-indigo-100 rounded-md p-1.5 flex flex-col gap-0.5 relative group shadow-3xs">
                                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-800">
                                            <span className="truncate max-w-[80px]">{order.selectedRate.carrierName}</span>
                                            <span className="text-indigo-600 font-mono">${order.selectedRate.amount}</span>
                                          </div>
                                          <div className="text-[9px] text-slate-500 truncate">{order.selectedRate.serviceName}</div>
                                          <button title="Refresh data"
                                            onClick={async (e) => {
                                              e.stopPropagation();
                                              if (onUpdateOrder) await onUpdateOrder(order.id, { selectedRate: undefined });
                                            }}
                                            className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                          >
                                            <X className="w-2.5 h-2.5" />
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="border border-dashed border-slate-200 rounded-md py-1.5 px-2 text-center text-[9px] text-slate-400 bg-white/50">
                                          Drag Preset...
                                        </div>
                                      )}
                                      
                                      <select
                                        value={order.selectedRate ? order.selectedRate.id : ''}
                                        onChange={async (e) => {
                                          const val = e.target.value;
                                          if (!val) {
                                            if (onUpdateOrder) await onUpdateOrder(order.id, { selectedRate: undefined });
                                          } else {
                                            const found = shippingPresets.find(p => p.id === val);
                                            if (found && onUpdateOrder) {
                                              await onUpdateOrder(order.id, { 
                                                selectedRate: found,
                                                carrier: found.carrierName,
                                                serviceClass: found.serviceName
                                              });
                                            }
                                          }
                                        }}
                                        className="w-full bg-white border border-slate-200 rounded text-[9.5px] p-0.5 outline-none font-mono text-slate-700 cursor-pointer"
                                      >
                                        <option value="">-- Apply Preset --</option>
                                        {shippingPresets.map(preset => (
                                          <option key={preset.id} value={preset.id}>
                                            {preset.name} (${preset.amount})
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </td>
                                );
                              case 'weight':
                                return (
                                  <td key={col} className="py-2 px-2 border-r border-slate-200 bg-slate-50/15">
                                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded px-1.5 py-1 shadow-2xs focus-within:ring-2 focus-within:ring-emerald-400 focus-within:border-emerald-400 transition-all">
                                      <input
                                        id={`grid-input-weight-${rowIdx}`}
                                        type="number"
                                        value={displayWeight}
                                        placeholder="0"
                                        onKeyDown={(e) => handleKeyDownGrid(e, 'weight', rowIdx, sortedOrders.length)}
                                        onChange={(e) => {
                                          handleChangeValue(order.id, 'weightOz', e.target.value);
                                        }}
                                        onBlur={() => handleBlurField(order.id)}
                                        className={`w-full font-mono text-center font-extrabold outline-none bg-transparent ${
                                          !displayWeight ? 'text-amber-500 bg-amber-50/20' : 'text-slate-800'
                                        }`}
                                      />
                                      <span className="text-[9px] font-bold text-slate-400 select-none">{unitSystem === 'metric' ? 'g' : 'oz'}</span>
                                    </div>
                                  </td>
                                );
                              case 'length':
                                return (
                                  <td key={col} className="py-2 px-2 border-r border-slate-200">
                                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded px-1.5 py-1 shadow-2xs focus-within:ring-2 focus-within:ring-emerald-400 focus-within:border-emerald-400 transition-all">
                                      <input
                                        id={`grid-input-length-${rowIdx}`}
                                        type="number"
                                        value={displayLength}
                                        placeholder="0"
                                        onKeyDown={(e) => handleKeyDownGrid(e, 'length', rowIdx, sortedOrders.length)}
                                        onChange={(e) => {
                                          handleChangeValue(order.id, 'length', e.target.value);
                                        }}
                                        onBlur={() => handleBlurField(order.id)}
                                        className={`w-full font-mono text-center font-extrabold outline-none bg-transparent ${
                                          !displayLength ? 'text-amber-500 bg-amber-50/20' : 'text-slate-800'
                                        }`}
                                      />
                                    </div>
                                  </td>
                                );
                              case 'width':
                                return (
                                  <td key={col} className="py-2 px-2 border-r border-slate-200">
                                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded px-1.5 py-1 shadow-2xs focus-within:ring-2 focus-within:ring-emerald-400 focus-within:border-emerald-400 transition-all">
                                      <input
                                        id={`grid-input-width-${rowIdx}`}
                                        type="number"
                                        value={displayWidth}
                                        placeholder="0"
                                        onKeyDown={(e) => handleKeyDownGrid(e, 'width', rowIdx, sortedOrders.length)}
                                        onChange={(e) => {
                                          handleChangeValue(order.id, 'width', e.target.value);
                                        }}
                                        onBlur={() => handleBlurField(order.id)}
                                        className={`w-full font-mono text-center font-extrabold outline-none bg-transparent ${
                                          !displayWidth ? 'text-amber-500 bg-amber-50/20' : 'text-slate-800'
                                        }`}
                                      />
                                    </div>
                                  </td>
                                );
                              case 'height':
                                return (
                                  <td key={col} className="py-2 px-2 border-r border-slate-200">
                                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded px-1.5 py-1 shadow-2xs focus-within:ring-2 focus-within:ring-emerald-400 focus-within:border-emerald-400 transition-all">
                                      <input
                                        id={`grid-input-height-${rowIdx}`}
                                        type="number"
                                        value={displayHeight}
                                        placeholder="0"
                                        onKeyDown={(e) => handleKeyDownGrid(e, 'height', rowIdx, sortedOrders.length)}
                                        onChange={(e) => {
                                          handleChangeValue(order.id, 'height', e.target.value);
                                        }}
                                        onBlur={() => handleBlurField(order.id)}
                                        className={`w-full font-mono text-center font-extrabold outline-none bg-transparent ${
                                          !displayHeight ? 'text-amber-500 bg-amber-50/20' : 'text-slate-800'
                                        }`}
                                      />
                                      <span className="text-[9px] font-bold text-slate-400 select-none">{unitSystem === 'metric' ? 'cm' : 'in'}</span>
                                    </div>
                                  </td>
                                );
                              case 'postage_status':
                                return (
                                  <td key={col} className="py-2 px-3">
                                    <div className="flex items-center justify-between gap-2">
                                      {order.selectedRate ? (
                                        <div className="text-[10px] font-mono">
                                          <span className="font-extrabold text-slate-800">{order.selectedRate.carrierName}</span>
                                          <span className="text-slate-400 block">{order.selectedRate.serviceName} - <strong>{order.selectedRate.amount} {order.selectedRate.currency}</strong></span>
                                        </div>
                                      ) : isComplete ? (
                                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-emerald-150">
                                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                          Ready
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-amber-150 animate-pulse">
                                          <AlertTriangle className="w-3 h-3 text-amber-500" />
                                          Needs Specs
                                        </span>
                                      )}
                                      
                                      {/* Quick print shortcut */}
                                      <div className="relative group/grid-print shrink-0">
                                        <button 
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const templatesList = getLatestTemplates();
                                            if (templatesList.length > 0) {
                                              handleQuickPrint(order, templatesList[0]);
                                            }
                                          }}
                                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                                          title="Quick Print Template (Hover for options)"
                                        >
                                          <Printer className="w-3.5 h-3.5" />
                                        </button>
                                        
                                        {/* Hover Dropdown Menu */}
                                        <div className="absolute right-0 bottom-full mb-1 w-56 bg-white rounded-xl shadow-xl border border-slate-200/80 py-1.5 hidden group-hover/grid-print:block z-50 text-left">
                                          <div className="px-3 py-1 border-b border-slate-100 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                                            Quick Print Shortcut
                                          </div>
                                          <div className="max-h-40 overflow-y-auto py-1">
                                            {getLatestTemplates().map((t: any) => (
                                              <button title="Print document" 
                                                key={t.id}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleQuickPrint(order, t);
                                                }}
                                                className="w-full text-left px-3 py-1 hover:bg-slate-50 flex flex-col transition-colors border-b border-slate-50 last:border-0"
                                              >
                                                <span className="text-[10.5px] font-extrabold text-slate-800 truncate">{t.name}</span>
                                                <span className="text-[8px] text-slate-400 uppercase font-mono tracking-wider">{t.type} • {t.width}x{t.height}px</span>
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Inline Quick Box presets selector */}
                                      <select
                                        onChange={async (e) => {
                                          const val = e.target.value;
                                          if (!val) return;
                                          let w = 8;
                                          let d = { length: 10, width: 8, height: 4 };
                                          if (val === 'bubble') {
                                            w = 2; d = { length: 8, width: 6, height: 0.5 };
                                          } else if (val === 'small') {
                                            w = 8; d = { length: 10, width: 8, height: 4 };
                                          } else if (val === 'medium') {
                                            w = 16; d = { length: 15, width: 12, height: 10 };
                                          } else if (val === 'large') {
                                            w = 32; d = { length: 24, width: 18, height: 12 };
                                          }
                                          
                                          setGridSpecs(prev => ({
                                            ...prev,
                                            [order.id]: { weightOz: w, length: d.length, width: d.width, height: d.height }
                                          }));
                                          if (onUpdateSpecs) {
                                            await onUpdateSpecs(order.id, w, d);
                                          }
                                          e.target.value = '';
                                        }}
                                        className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-[9px] font-bold text-slate-500 focus:outline-none cursor-pointer transition-colors"
                                      >
                                        <option value="">Quick Pack...</option>
                                        <option value="bubble">{unitSystem === "metric" ? "Envelope (56g)" : "Envelope (2oz)"}</option>
                                        <option value="small">{unitSystem === "metric" ? "Small Box (225g)" : "Small Box (8oz)"}</option>
                                        <option value="medium">{unitSystem === "metric" ? "Med Box (450g)" : "Med Box (16oz)"}</option>
                                        <option value="large">{unitSystem === "metric" ? "Large Box (900g)" : "Large Box (32oz)"}</option>
                                      </select>
                                    </div>
                                  </td>
                                );
                              default:
                                return null;
                            }
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="divide-y divide-slate-100 min-w-[1550px] bg-white">
              {/* Table Header for Desktop with Draggable Column Headers */}
              <div className="hidden md:flex items-center px-4 py-3 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10 font-mono border-b border-slate-100">
                {columnOrder.map((col) => {
                  if (col === 'checkbox') {
                    return (
                      <div key={col} className="w-12 flex justify-center shrink-0">
                        <input
                          type="checkbox"
                          checked={allSelectedOnPage}
                          onChange={onToggleSelectAll}
                          className="rounded text-slate-900 focus:ring-slate-900 cursor-pointer"
                        />
                      </div>
                    );
                  }

                  const colLabels: Record<string, string> = {
                    general_info: 'General Info',
                    shipping_method: 'Shipping Method / Service',
                    shipping_info: 'Shipping Information',
                    customer: 'Customer',
                    folders: 'Folders',
                    fulfillment: 'Fulfillment',
                    items: 'Items',
                    totals: 'Totals'
                  };

                  return (
                    <div
                      key={col}
                      draggable
                      onDragStart={(e) => handleDragStart(e, col)}
                      onDragOver={(e) => handleDragOver(e, col)}
                      onDragEnd={handleDragEnd}
                      className={`px-3 py-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono select-none cursor-grab active:cursor-grabbing hover:bg-slate-100/80 rounded transition-colors shrink-0 flex items-center gap-1.5 border-r border-slate-200/50 last:border-0 ${
                        col === 'general_info' ? 'w-56' :
                        col === 'shipping_method' ? 'w-56 bg-indigo-50/25 border-dashed border border-indigo-200/50' :
                        col === 'shipping_info' ? 'w-48' :
                        col === 'customer' ? 'w-56' :
                        col === 'folders' ? 'w-32' :
                        col === 'fulfillment' ? 'w-32 justify-center text-center' :
                        col === 'items' ? 'flex-1 min-w-[280px]' :
                        col === 'totals' ? 'w-40 justify-end text-right' : 'w-28'
                      }`}
                      style={{ opacity: draggedCol === col ? 0.4 : 1 }}
                    >
                      <span className="text-[10px] text-slate-300 font-sans">⋮⋮</span>
                      <span className="truncate">{colLabels[col]}</span>
                      {col === 'id' && sortBy.startsWith('date') && <span className="text-indigo-600 text-[9px]">({sortBy === 'date-desc' ? '▼' : '▲'})</span>}
                      {col === 'buyer' && sortBy.startsWith('state') && <span className="text-indigo-600 text-[9px]">({sortBy === 'state-desc' ? '▼' : '▲'})</span>}
                      {col === 'value' && sortBy.startsWith('value') && <span className="text-indigo-600 text-[9px]">({sortBy === 'value-desc' ? '▼' : '▲'})</span>}
                      {col === 'status' && sortBy.startsWith('cost') && <span className="text-indigo-600 text-[9px]">({sortBy === 'cost-desc' ? '▼' : '▲'})</span>}
                    </div>
                  );
                })}
                <div className="w-12 shrink-0"></div>
              </div>

              {/* Order Items */}
              {sortedOrders.map((order) => {
                const isSelected = selectedOrderIds.includes(order.id);
                const isActive = activeOrderId === order.id;

                const orderHasLowStock = order.items.some(item => {
                  const prod = products.find(p => p.sku === item.sku || p.mappedSku === item.sku);
                  return prod && prod.stock <= inventoryThreshold;
                });

                return (
                  <div
                    key={order.id}
                    id={`order-row-${order.id}`}
                    onClick={() => onSelectOrderDetails(order)}
                    className={`flex flex-col md:flex-row md:items-center px-4 py-4 transition-all cursor-pointer border-l-4 ${
                      isActive 
                        ? 'bg-slate-50 border-slate-950 font-semibold' 
                        : orderHasLowStock
                          ? 'bg-rose-500/[0.02] border-rose-500 hover:bg-rose-500/[0.05]'
                          : isSelected 
                            ? 'bg-indigo-50/20 border-indigo-400' 
                            : 'hover:bg-slate-50/50 border-transparent'
                    }`}
                  >
                    {columnOrder.map((col) => {
                      switch (col) {
                        case 'checkbox':
                          return (
                            <div key={col} className="border-r border-slate-200/50 w-12 flex justify-center shrink-0" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => onToggleSelectOrder(order.id)}
                                className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:opacity-30"
                              />
                            </div>
                          );
                        case 'general_info':
                          return (
                            <div key={col} className="border-r border-slate-200/50 w-56 px-3 shrink-0 flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                {/* Channel Badge */}
                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                  order.source === 'amazon' ? 'bg-amber-100 text-amber-800' :
                                  order.source === 'ebay' ? 'bg-blue-100 text-blue-800' :
                                  order.source === 'shopify' ? 'bg-emerald-100 text-emerald-800' :
                                  order.source === 'etsy' ? 'bg-orange-100 text-orange-800' :
                                  'bg-slate-100 text-slate-800'
                                }`}>
                                  {order.source}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 mt-1">
                                <button  
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectOrderDetails(order);
                                  }}
                                  className="text-indigo-600 font-bold hover:text-indigo-800 text-xs truncate" 
                                  title="Open order workspace tab"
                                >
                                  #{order.id}
                                </button>
                                <span className="text-[10px] text-slate-400">via {order.source}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 truncate">
                                Reference: {order.id.split('-').reverse()[0]}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                Date: {new Date(order.orderDate).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          );
                        case 'shipping_method': {
                          const rate = order.selectedRate;
                          return (
                            <div 
                              key={col} 
                              className="border-r border-slate-200/50 w-56 px-3 shrink-0 flex flex-col justify-center gap-1.5 transition-colors"
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.currentTarget.classList.add('bg-indigo-50/40');
                              }}
                              onDragLeave={(e) => {
                                e.currentTarget.classList.remove('bg-indigo-50/40');
                              }}
                              onDrop={async (e) => {
                                e.preventDefault();
                                e.currentTarget.classList.remove('bg-indigo-50/40');
                                try {
                                  const presetData = JSON.parse(e.dataTransfer.getData('application/json'));
                                  if (presetData && presetData.serviceName) {
                                    if (onUpdateOrder) {
                                      await onUpdateOrder(order.id, { 
                                        selectedRate: presetData,
                                        carrier: presetData.carrierName,
                                        serviceClass: presetData.serviceName
                                      });
                                    }
                                  }
                                } catch (err) {
                                  console.error("Error parsing drop data:", err);
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {rate ? (
                                <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-1.5 flex flex-col gap-0.5 relative group">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-800 truncate block max-w-[120px]">{rate.carrierName}</span>
                                    <span className="text-[10px] font-black text-indigo-600 font-mono">${rate.amount}</span>
                                  </div>
                                  <span className="text-[9px] text-slate-500 truncate block">{rate.serviceName}</span>
                                  <span className="text-[8px] text-slate-400 font-mono block mt-0.5">Est. {rate.deliveryDays} Days</span>
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      if (onUpdateOrder) {
                                        await onUpdateOrder(order.id, { selectedRate: undefined });
                                      }
                                    }}
                                    className="absolute -top-1 -right-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    title="Remove Shipping Method"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="border border-dashed border-slate-200 rounded-lg p-2 text-center text-slate-400 group-hover:border-indigo-400 transition-all flex flex-col items-center justify-center min-h-[56px] bg-slate-50/30">
                                  <Truck className="w-4 h-4 text-slate-300 mb-1 animate-pulse" />
                                  <span className="text-[9px] text-slate-400 font-medium">Drag Preset or Click...</span>
                                </div>
                              )}
                              
                              {/* Manual Select Dropdown */}
                              <select
                                value={rate ? rate.id : ''}
                                onChange={async (e) => {
                                  const val = e.target.value;
                                  if (!val) {
                                    if (onUpdateOrder) await onUpdateOrder(order.id, { selectedRate: undefined });
                                  } else {
                                    const found = shippingPresets.find(p => p.id === val);
                                    if (found && onUpdateOrder) {
                                      await onUpdateOrder(order.id, { 
                                        selectedRate: found,
                                        carrier: found.carrierName,
                                        serviceClass: found.serviceName
                                      });
                                    }
                                  }
                                }}
                                className="w-full bg-white border border-slate-200 rounded text-[9px] font-mono p-1 outline-none text-slate-700 cursor-pointer"
                              >
                                <option value="">-- Apply Preset --</option>
                                {shippingPresets.map(preset => (
                                  <option key={preset.id} value={preset.id}>
                                    {preset.name} (${preset.amount})
                                  </option>
                                ))}
                              </select>
                            </div>
                          );
                        }
                        case 'shipping_info':
                          return (
                            <div key={col} className="border-r border-slate-200/50 w-48 px-3 shrink-0 flex flex-col gap-1.5">
                              <div className="flex items-center gap-1.5">
                                <Truck className="w-3.5 h-3.5 text-slate-500" />
                                <span className="text-[11px] font-bold text-slate-700 truncate">{order.carrier || 'ROYAL MAIL'}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Tag className="w-3 h-3 text-slate-400" />
                                <span className="text-[10px] text-slate-600 font-mono truncate">{order.trackingNumber || 'Unassigned'}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Box className="w-3 h-3 text-slate-400" />
                                <span className="text-[10px] text-slate-600 truncate">{order.serviceClass || 'Default'}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Scale className="w-3 h-3 text-slate-400" />
                                {order.weightOz ? (
                                  <span className="text-[10px] text-slate-600 font-mono">
                                    {unitSystem === 'metric' ? Math.round(order.weightOz * 28.3495) + 'g' : order.weightOz + 'oz'}
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold text-red-600 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> No weight
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        case 'customer':
                          return (
                            <div key={col} className="border-r border-slate-200/50 w-56 px-3 shrink-0 flex flex-col gap-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-700">Shipping Address</span>
                                <button title="Copy address to clipboard"  className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-semibold hover:bg-indigo-100 transition-colors">
                                  - Copy
                                </button>
                              </div>
                              <div className="text-xs text-slate-900 truncate font-semibold mt-1">
                                {order.buyerName}
                              </div>
                              <div className="text-[11px] text-slate-600 truncate uppercase">
                                {order.shippingAddress.city}
                              </div>
                              <div className="text-[11px] text-slate-600 font-mono uppercase">
                                {order.shippingAddress.postalCode}
                              </div>
                            </div>
                          );
                        case 'folders':
                          return (
                            <div key={col} className="border-r border-slate-200/50 w-32 px-3 shrink-0 flex flex-col gap-1">
                              <span className="text-[10px] font-bold text-slate-700 mb-1">Folders</span>
                              {/* Read from CRM if available */}
                              {(() => {
                                const customerEmail = order.buyerEmail || order.buyerName;
                                const crmData = customers[customerEmail];
                                if (crmData && crmData.tags && crmData.tags.length > 0) {
                                  return crmData.tags.map((t: string, i: number) => (
                                    <span key={i} className="text-[10px] flex items-center gap-1 text-slate-600 font-medium">
                                      <Box className="w-3 h-3 text-slate-400" /> {t}
                                    </span>
                                  ));
                                }
                                return (
                                  <span className="text-[10px] flex items-center gap-1 text-slate-600 font-medium">
                                    <Box className="w-3 h-3 text-slate-400" /> General
                                  </span>
                                );
                              })()}
                            </div>
                          );
                        case 'fulfillment':
                          return (
                            <div key={col} className="border-r border-slate-200/50 w-32 px-3 shrink-0 flex flex-col justify-center">
                              {orderHasLowStock ? (
                                <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-1 rounded text-center">
                                  Low Stock
                                </span>
                              ) : (
                                <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-2 py-1 rounded text-center">
                                  Sufficient Stock
                                </span>
                              )}
                            </div>
                          );
                        case 'items':
                          return (
                            <div key={col} className="border-r border-slate-200/50 flex-1 px-3 min-w-[280px] flex flex-col gap-2">
                              {order.items.map((item, idx) => {
                                const prod = products.find(p => p.sku === item.sku || p.mappedSku === item.sku);
                                return (
                                  <div key={idx} className="flex items-start gap-2 border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                                    <div className="w-8 h-8 rounded bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                                      {prod?.image ? (
                                        <img src={prod.image} alt={item.title} className="w-full h-full object-cover" />
                                      ) : (
                                        <Box className="w-4 h-4 text-slate-300" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex justify-between items-start gap-2">
                                        <span className="text-[11px] text-slate-900 leading-tight">
                                          {item.quantity} x {item.title}
                                        </span>
                                        <span className="text-[10px] text-slate-500 whitespace-nowrap">
                                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency }).format(item.price)} discount
                                        </span>
                                      </div>
                                      <div className="text-[10px] text-indigo-600 font-mono mt-0.5">
                                        {item.sku}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        case 'totals':
                          return (
                            <div key={col} className="border-r border-slate-200/50 w-40 px-3 shrink-0 flex flex-col items-end gap-0.5">
                              <div className="text-[10px] text-slate-600 flex justify-between w-full">
                                <span className="font-semibold">Sub Total:</span>
                                <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency }).format(order.totalAmount * 0.8)}</span>
                              </div>
                              <div className="text-[10px] text-slate-600 flex justify-between w-full">
                                <span className="font-semibold">Tax:</span>
                                <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency }).format(order.totalAmount * 0.2)}</span>
                              </div>
                              <div className="text-[11px] text-slate-900 flex justify-between w-full mt-1 font-bold">
                                <span>Total:</span>
                                <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency }).format(order.totalAmount)}</span>
                              </div>
                            </div>
                          );

                        default:
                          return null;
                      }
                    })}
                    {/* Actions / Info Arrow & Print Hover Shortcut */}
                    <div className="hidden md:flex items-center gap-2 w-20 justify-end shrink-0 px-2" onClick={(e) => e.stopPropagation()}>
                      {/* Printer Hover Shortcut */}
                      <div className="relative group/print-shortcut">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            // By default, quick print using the first template
                            const templatesList = getLatestTemplates();
                            if (templatesList.length > 0) {
                              handleQuickPrint(order, templatesList[0]);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all"
                          title="Quick Print (Hover for options)"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        
                        {/* Hover Dropdown Menu */}
                        <div className="absolute right-0 bottom-full mb-1 w-64 bg-white rounded-xl shadow-xl border border-slate-200/80 py-2 hidden group-hover/print-shortcut:block z-50 text-left">
                          <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                            Choose Preset Template
                          </div>
                          <div className="max-h-48 overflow-y-auto py-1">
                            {getLatestTemplates().map((t: any) => (
                              <button title="Print document" 
                                key={t.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickPrint(order, t);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex flex-col transition-colors border-b border-slate-50 last:border-0"
                              >
                                <span className="text-[11px] font-extrabold text-slate-800">{t.name}</span>
                                <span className="text-[9px] text-slate-400 uppercase font-mono tracking-wider">{t.type} • {t.width}x{t.height}px</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div 
                        onClick={() => onSelectOrderDetails(order)}
                        className="cursor-pointer p-1"
                      >
                        <ChevronRight className={`w-5 h-5 transition-transform ${isActive ? 'text-slate-900 translate-x-1' : 'text-slate-300'}`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info bar */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
        <div>
          Showing <span className="font-semibold text-slate-700">{sortedOrders.length}</span> of <span className="font-semibold text-slate-700">{orders.length}</span> multi-channel sales orders.
        </div>
        {selectedOrderIds.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
              <CheckCircle className="w-3.5 h-3.5" />
              {selectedOrderIds.length} orders queued
            </span>
            {onMergeOrders && canMergeSelected && (
              <button title="Refresh data"
                onClick={async () => {
                  const sIds = selectedPendingOrders.map(o => o.id);
                  setMergingOrderIds(prev => [...prev, ...sIds]);
                  try {
                    await onMergeOrders(sIds);
                  } catch (e) {
                    console.error("Merging selected orders failed:", e);
                  } finally {
                    setMergingOrderIds(prev => prev.filter(id => !sIds.includes(id)));
                  }
                }}
                disabled={mergingOrderIds.length > 0}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-md transition-all shadow-xs shrink-0 flex items-center gap-1"
              >
                {mergingOrderIds.length > 0 ? 'Merging...' : '🔀 Merge Selected Orders'}
              </button>
            )}
            {onBulkAction && (
              <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                <button title="Perform action" 
                  type="button"
                  onClick={() => onBulkAction('notify_channels', selectedOrderIds)}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-extrabold text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Notify Channels
                </button>
                <button title="Cancel and close" 
                  type="button"
                  onClick={() => onBulkAction('ship', selectedOrderIds)}
                  className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-extrabold text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Truck className="w-3.5 h-3.5" /> Ship
                </button>
                <button title="Cancel and close" 
                  type="button"
                  onClick={() => onBulkAction('cancel', selectedOrderIds)}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-800 font-extrabold text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5" /> Cancel
                </button>
                <button title="Perform action" 
                  type="button"
                  onClick={() => onBulkAction('delete', selectedOrderIds)}
                  className="bg-rose-100 hover:bg-rose-200 text-rose-800 font-extrabold text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isCreatingOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <h3 className="text-lg font-black tracking-tight">Create Direct Order</h3>
              <button title="Close"  
                onClick={() => setIsCreatingOrder(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Customer Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 relative">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Search CRM (Optional)</label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                      <input 
                        type="text" 
                        value={crmSearchQuery}
                        onChange={e => {
                          setCrmSearchQuery(e.target.value);
                          setShowCrmDropdown(true);
                        }}
                        onFocus={() => setShowCrmDropdown(true)}
                        onBlur={() => setTimeout(() => setShowCrmDropdown(false), 200)}
                        className="w-full text-xs pl-8 p-2 border border-slate-200 rounded-lg focus:border-slate-900 outline-none bg-slate-50"
                        placeholder="Search by customer name, company, or postcode..."
                      />
                    </div>
                    {showCrmDropdown && crmSearchQuery.trim() !== '' && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
                        {allCustomers
                          .filter(c => 
                            (c.name || '').toLowerCase().includes(crmSearchQuery.toLowerCase()) || 
                            (c.email || '').toLowerCase().includes(crmSearchQuery.toLowerCase()) ||
                            (c.zip || '').toLowerCase().includes(crmSearchQuery.toLowerCase())
                          )
                          .map(c => (
                            <div 
                              key={c.id} 
                              onClick={() => {
                                setCreateOrderForm({
                                  ...createOrderForm,
                                  buyerName: c.name || '',
                                  phone: c.phone || '',
                                  address: c.address || '',
                                  city: c.city || '',
                                  zip: c.zip || '',
                                  email: c.email || ''
                                });
                                setCrmSearchQuery('');
                                setShowCrmDropdown(false);
                              }}
                              className="p-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 text-xs transition-colors"
                            >
                              <div className="font-bold text-slate-800">{c.name}</div>
                              <div className="text-slate-500 mt-0.5">{[c.email, c.zip].filter(Boolean).join(' • ')}</div>
                            </div>
                          ))}
                        {allCustomers.filter(c => 
                            (c.name || '').toLowerCase().includes(crmSearchQuery.toLowerCase()) || 
                            (c.email || '').toLowerCase().includes(crmSearchQuery.toLowerCase()) ||
                            (c.zip || '').toLowerCase().includes(crmSearchQuery.toLowerCase())
                          ).length === 0 && (
                            <div className="p-3 text-xs text-slate-500 text-center">No customers found</div>
                          )}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Buyer Name</label>
                    <input 
                      type="text" 
                      value={createOrderForm.buyerName} 
                      onChange={e => setCreateOrderForm({...createOrderForm, buyerName: e.target.value})}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:border-slate-900 outline-none"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Phone</label>
                    <input 
                      type="text" 
                      value={createOrderForm.phone} 
                      onChange={e => setCreateOrderForm({...createOrderForm, phone: e.target.value})}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:border-slate-900 outline-none"
                      placeholder="e.g. +1 555-0199"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Address</label>
                    <input 
                      type="text" 
                      value={createOrderForm.address} 
                      onChange={e => setCreateOrderForm({...createOrderForm, address: e.target.value})}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:border-slate-900 outline-none"
                      placeholder="e.g. 123 Main St"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">City</label>
                    <input 
                      type="text" 
                      value={createOrderForm.city} 
                      onChange={e => setCreateOrderForm({...createOrderForm, city: e.target.value})}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:border-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Zip / Postal</label>
                    <input 
                      type="text" 
                      value={createOrderForm.zip} 
                      onChange={e => setCreateOrderForm({...createOrderForm, zip: e.target.value})}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:border-slate-900 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Order Items</h4>
                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-4 relative">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Search Products (Optional)</label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                      <input 
                        type="text" 
                        value={productSearchQuery}
                        onChange={e => {
                          setProductSearchQuery(e.target.value);
                          setShowProductDropdown(true);
                        }}
                        onFocus={() => setShowProductDropdown(true)}
                        onBlur={() => setTimeout(() => setShowProductDropdown(false), 200)}
                        className="w-full text-xs pl-8 p-2 border border-slate-200 rounded-lg focus:border-slate-900 outline-none bg-slate-50"
                        placeholder="Search by SKU, Name, or mapped SKU..."
                      />
                    </div>
                    {showProductDropdown && productSearchQuery.trim() !== '' && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
                        {products
                          .filter(p => 
                            (p.sku || '').toLowerCase().includes(productSearchQuery.toLowerCase()) || 
                            (p.name || '').toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                            (p.mappedSku || '').toLowerCase().includes(productSearchQuery.toLowerCase())
                          )
                          .map(p => (
                            <div 
                              key={p.sku} 
                              onClick={() => {
                                setCreateOrderForm({
                                  ...createOrderForm,
                                  itemSku: p.sku || '',
                                  itemTitle: p.name || '',
                                  itemPrice: p.sellingPrice || 0
                                });
                                setProductSearchQuery('');
                                setShowProductDropdown(false);
                              }}
                              className="p-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 text-xs transition-colors"
                            >
                              <div className="font-bold text-slate-800">{p.sku}</div>
                              <div className="text-slate-500 mt-0.5">{p.name}</div>
                            </div>
                          ))}
                        {products.filter(p => 
                            (p.sku || '').toLowerCase().includes(productSearchQuery.toLowerCase()) || 
                            (p.name || '').toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                            (p.mappedSku || '').toLowerCase().includes(productSearchQuery.toLowerCase())
                          ).length === 0 && (
                            <div className="p-3 text-xs text-slate-500 text-center">No products found</div>
                          )}
                      </div>
                    )}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">SKU</label>
                    <input 
                      type="text" 
                      value={createOrderForm.itemSku} 
                      onChange={e => setCreateOrderForm({...createOrderForm, itemSku: e.target.value})}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:border-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Qty</label>
                    <input 
                      type="number" 
                      value={createOrderForm.itemQty} 
                      onChange={e => setCreateOrderForm({...createOrderForm, itemQty: Number(e.target.value)})}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:border-slate-900 outline-none"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Unit Price</label>
                    <input 
                      type="number" 
                      value={createOrderForm.itemPrice} 
                      onChange={e => setCreateOrderForm({...createOrderForm, itemPrice: Number(e.target.value)})}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:border-slate-900 outline-none"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="col-span-4">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Item Title</label>
                    <input 
                      type="text" 
                      value={createOrderForm.itemTitle} 
                      onChange={e => setCreateOrderForm({...createOrderForm, itemTitle: e.target.value})}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:border-slate-900 outline-none"
                      placeholder="e.g. Premium Widget"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Financials</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Shipping Paid By Customer</label>
                    <input 
                      type="number" 
                      value={createOrderForm.shippingPaid} 
                      onChange={e => setCreateOrderForm({...createOrderForm, shippingPaid: Number(e.target.value)})}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:border-slate-900 outline-none"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <div className="text-xs font-bold text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      Total: ${(createOrderForm.itemQty * createOrderForm.itemPrice + createOrderForm.shippingPaid).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 shrink-0">
              <button title="Cancel and close"  
                onClick={() => setIsCreatingOrder(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button title="Refresh data" 
                onClick={async () => {
                  if (!createOrderForm.buyerName || !createOrderForm.itemSku) {
                    alert('Buyer Name and Item SKU are required');
                    return;
                  }
                  try {
                    const res = await fetch('/api/orders/create', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(createOrderForm)
                    });
                    if (res.ok) {
                      setIsCreatingOrder(false);
                      setCreateOrderForm({
                        buyerName: '', email: '', address: '', city: '', zip: '', phone: '',
                        itemSku: '', itemTitle: '', itemQty: 1, itemPrice: 0, shippingPaid: 0,
                      });
                      // If App.tsx polling is enabled it will auto refresh, or we can reload
                      window.location.reload();
                    } else {
                      const data = await res.json();
                      alert(data.error || 'Failed to create order');
                    }
                  } catch (e) {
                    alert('Network error');
                  }
                }}
                className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-lg transition-colors shadow-sm"
              >
                Create Order
              </button>
            </div>
          </div>
        </div>
      )}
      {isPrintModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-100 overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <h3 className="text-lg font-black tracking-tight">Print Labels / Invoices</h3>
              <button title="Close"  onClick={() => setIsPrintModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-4">
                Select a template to print for {selectedOrderIds.length} selected order(s):
              </p>
              {printTemplates.length === 0 ? (
                <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100 mb-4">
                  No templates found. Please create one in the Template Designer first.
                </div>
              ) : (
                <div className="space-y-2 mb-6 max-h-64 overflow-y-auto pr-2">
                  {printTemplates.map(t => (
                    <label key={t.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedPrintTemplate === t.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-300 bg-white'
                    }`}>
                      <input
                        type="radio"
                        name="print_template"
                        value={t.id}
                        checked={selectedPrintTemplate === t.id}
                        onChange={() => setSelectedPrintTemplate(t.id)}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <div className="font-bold text-sm text-slate-900">{t.name}</div>
                        <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">{t.type} &bull; {t.width}x{t.height}px</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button title="Print document" 
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button title="Print document"
                  type="button"
                  onClick={handlePrintSubmit}
                  disabled={!selectedPrintTemplate}
                  className="px-6 py-2 text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:text-slate-500 rounded-lg shadow-sm transition-all flex items-center gap-2"
                >
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Print Notification Toast */}
      {quickPrintNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl p-4 flex items-center gap-3 animate-slide-in-right max-w-sm">
          <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded-xl border border-emerald-500/30">
            <CheckCircle2 className="w-5 h-5 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-black uppercase tracking-wider text-slate-400">Quick Print Spooled</div>
            <div className="text-xs font-bold text-white truncate">Order {quickPrintNotification.orderId} queued!</div>
            <div className="text-[10px] text-slate-400 truncate mt-0.5">Printed with {quickPrintNotification.templateName}</div>
          </div>
          <button title="Close"  
            onClick={() => setQuickPrintNotification(null)}
            className="text-slate-500 hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Print Simulation Preview Modal */}
      {selectedPreviewOrder && selectedPreviewTemplate && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[60] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 text-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-extrabold text-xs text-slate-200">
                  Thermal Output Spool Simulation: {selectedPreviewOrder.id}
                </span>
              </div>
              <button title="Close dialog or panel"  
                onClick={() => {
                  setSelectedPreviewOrder(null);
                  setSelectedPreviewTemplate(null);
                  setBulkPreviewOrders([]);
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Content / Virtual Tape roll container */}
            <div className="p-6 overflow-y-auto bg-slate-950/40 flex-1 flex flex-col items-center justify-start gap-6">
              {/* Virtual Printer Feed Box */}
              <div className="relative bg-white text-slate-900 rounded shadow-2xl overflow-hidden p-6 select-none border border-slate-300"
                   style={{
                     width: `${Math.min(selectedPreviewTemplate.width || 400, 480)}px`,
                     minHeight: `${Math.min(selectedPreviewTemplate.height || 600, 680)}px`,
                     boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                   }}>
                
                {/* Simulated thermal output lines */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-b from-slate-200/50 to-transparent pointer-events-none" />
                
                {/* Template Elements absolute mapping */}
                <div className="relative w-full h-full min-h-[550px]">
                  {(selectedPreviewTemplate.elements || []).map((elem: any) => {
                    // Let's compute layout proportions to fit the screen
                    const scale = Math.min(selectedPreviewTemplate.width || 400, 480) / (selectedPreviewTemplate.width || 400);
                    const left = elem.x * scale;
                    const top = elem.y * scale;
                    const width = elem.width * scale;
                    const height = elem.height * scale;

                    return (
                      <div
                        key={elem.id}
                        style={{
                          position: 'absolute',
                          left: `${left}px`,
                          top: `${top}px`,
                          width: `${width}px`,
                          height: `${height}px`,
                        }}
                        className="overflow-hidden"
                      >
                        {elem.type === 'text' && (
                          <div 
                            style={{ 
                              fontSize: `${(elem.fontSize || 12) * scale}px`, 
                              fontWeight: elem.fontWeight === 'bold' ? 700 : elem.fontWeight === 'black' ? 900 : 400,
                              fontStyle: elem.fontStyle === 'italic' ? 'italic' : 'normal',
                              textAlign: elem.align || 'left',
                              whiteSpace: 'pre-wrap'
                            }}
                            className="text-slate-950 font-sans leading-tight w-full h-full"
                          >
                            {renderElementContent(elem.content, selectedPreviewOrder)}
                          </div>
                        )}

                        {elem.type === 'barcode' && (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-white">
                            {/* Simple simulated barcode */}
                            <div className="flex gap-0.5 items-end justify-center w-full h-3/4">
                              {Array.from({ length: 42 }).map((_, i) => (
                                <div
                                  key={i}
                                  className="bg-black"
                                  style={{
                                    width: `${i % 3 === 0 ? 3 : i % 5 === 0 ? 1 : 2}px`,
                                    height: '100%'
                                  }}
                                />
                              ))}
                            </div>
                            <div className="text-[10px] font-mono mt-1 text-center font-bold tracking-widest text-black">
                              {renderElementContent(elem.content, selectedPreviewOrder)}
                            </div>
                          </div>
                        )}

                        {elem.type === 'image' && (
                          <div className="w-full h-full flex items-center justify-center bg-white border border-dashed border-slate-200">
                            <img
                              src={elem.content}
                              alt="Template Asset"
                              className="max-w-full max-h-full object-contain filter grayscale contrast-125"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}

                        {elem.type === 'line' && (
                          <div 
                            className="bg-black w-full" 
                            style={{ height: `${Math.max(elem.height || 1, 1)}px` }} 
                          />
                        )}

                        {elem.type === 'table' && (
                          <div className="w-full text-[10px] font-mono text-black leading-tight">
                            <div className="border-b-2 border-black font-extrabold pb-0.5 mb-1 grid grid-cols-12 gap-1">
                              <span className="col-span-6">Item</span>
                              <span className="col-span-2 text-center">Qty</span>
                              <span className="col-span-4 text-right">Price</span>
                            </div>
                            {selectedPreviewOrder.items.map((item: any, i: number) => (
                              <div key={i} className="grid grid-cols-12 gap-1 border-b border-dashed border-slate-200 py-1">
                                <span className="col-span-6 font-semibold truncate">{item.title || item.sku}</span>
                                <span className="col-span-2 text-center font-bold">{item.quantity}</span>
                                <span className="col-span-4 text-right font-mono">
                                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: selectedPreviewOrder.currency || 'USD' }).format(item.price)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Simulated hardware spool actions footer */}
            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
              <div className="text-[11px] font-mono text-slate-500">
                Media: Thermal Paper &bull; Ready &bull; Online
              </div>
              <div className="flex gap-2">
                <button title="Perform action" 
                  type="button"
                  onClick={() => {
                    setSelectedPreviewOrder(null);
                    setSelectedPreviewTemplate(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-400 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Dismiss Spooler
                </button>
                <button title="Print document" 
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="px-5 py-2 text-xs font-black text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Trigger Hardware Print Dialog
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showPresetsModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-scale-up relative">
            <button title="Close dialog or panel" 
              onClick={() => setShowPresetsModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-4 sm:p-6 pb-2 sm:pb-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
              <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
                <Box className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">Quick Packaging Presets</h3>
                <p className="text-[11px] font-bold text-slate-500 mt-0.5">Manage commonly used package dimensions and weights.</p>
              </div>
            </div>
            <div className="p-2 sm:p-4 max-h-[80vh] overflow-y-auto">
              <PackagePresetsManager unitSystem={unitSystem || 'imperial'} />
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button 
                onClick={() => setShowPresetsModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
