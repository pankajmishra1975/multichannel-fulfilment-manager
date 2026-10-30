import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  FileText, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  X, 
  Package, 
  Trash2, 
  Edit, 
  ChevronRight, 
  AlertCircle,
  TrendingUp,
  FileCheck,
  Check,
  RefreshCw,
  Info,
  Warehouse
} from 'lucide-react';
import { Product, Supplier, PurchaseOrder } from '../types';

interface WmsViewProps {
  currency?: string;
  unitSystem?: string;
  products: Product[];
  onRefreshProducts: () => Promise<void>;
  onRefreshLogs: () => Promise<void>;
}

export default function WmsView({ products, onRefreshProducts, onRefreshLogs, currency = "USD", unitSystem = "imperial" }: WmsViewProps) {
  const currencySymbol = currency === "GBP" ? "£" : currency === "EUR" ? "€" : "$";
  const [activeSubTab, setActiveSubTab] = useState<'pos' | 'suppliers' | 'warehouses'>('pos');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Warehouse States
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('wh-main');
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<any | null>(null);
  const [whName, setWhName] = useState('');
  const [whCode, setWhCode] = useState('');
  const [whAddress, setWhAddress] = useState('');
  const [whIsDefault, setWhIsDefault] = useState(false);
  const [warehouseSearch, setWarehouseSearch] = useState('');
  const [updatingStockSku, setUpdatingStockSku] = useState<string | null>(null);

  // Search/Filter States
  const [poSearch, setPoSearch] = useState('');
  const [poStatusFilter, setPoStatusFilter] = useState<string>('all');
  const [supplierSearch, setSupplierSearch] = useState('');

  // Modals & Creation States
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  
  const [showPoModal, setShowPoModal] = useState(false);
  const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(null);
  const [isCreatingPo, setIsCreatingPo] = useState(false);

  // Supplier Form state
  const [supName, setSupName] = useState('');
  const [supCode, setSupCode] = useState('');
  const [supContact, setSupContact] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supAddress, setSupAddress] = useState('');
  const [supLeadTime, setSupLeadTime] = useState(7);

  // PO Creation Form State
  const [poSupplierId, setPoSupplierId] = useState('');
  const [poNotes, setPoNotes] = useState('');
  const [poExpectedDate, setPoExpectedDate] = useState('');
  const [poLines, setPoLines] = useState<{ sku: string; quantity: number; unitCost: number }[]>([
    { sku: '', quantity: 50, unitCost: 0 }
  ]);

  // Fetch initial data
  useEffect(() => {
    fetchSuppliers();
    fetchPOs();
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const res = await fetch('/api/wms/warehouses');
      const data = await res.json();
      setWarehouses(data);
      // Ensure selectedWarehouseId is valid, if not fall back to default
      if (data.length > 0 && !data.some((w: any) => w.id === selectedWarehouseId)) {
        const def = data.find((w: any) => w.isDefault);
        setSelectedWarehouseId(def ? def.id : data[0].id);
      }
    } catch (e) {
      console.error('Error fetching warehouses:', e);
    }
  };

  const handleOpenWarehouseModal = (wh: any | null = null) => {
    if (wh) {
      setEditingWarehouse(wh);
      setWhName(wh.name);
      setWhCode(wh.code);
      setWhAddress(wh.address);
      setWhIsDefault(wh.isDefault);
    } else {
      setEditingWarehouse(null);
      setWhName('');
      setWhCode('');
      setWhAddress('');
      setWhIsDefault(false);
    }
    setShowWarehouseModal(true);
  };

  const handleSaveWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whName || !whCode) {
      setError('Warehouse Name and Code are required.');
      return;
    }
    setError(null);
    try {
      const res = await fetch('/api/wms/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingWarehouse?.id,
          name: whName,
          code: whCode,
          address: whAddress,
          isDefault: whIsDefault
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Warehouse ${editingWarehouse ? 'updated' : 'created'} successfully!`);
        await fetchWarehouses();
        await onRefreshProducts();
        setShowWarehouseModal(false);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to save warehouse.');
      }
    } catch (e) {
      setError('An error occurred.');
    }
  };

  const handleDeleteWarehouse = async (id: string) => {
    const wh = warehouses.find(w => w.id === id);
    if (wh?.isDefault) {
      setError('Cannot delete the default warehouse. Choose another default warehouse first.');
      setTimeout(() => setError(null), 4000);
      return;
    }
    if (!window.confirm('Are you sure you want to delete this warehouse location? All inventory stocks recorded at this location will be discarded.')) return;
    try {
      const res = await fetch(`/api/wms/warehouses/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSuccess('Warehouse deleted successfully.');
        await fetchWarehouses();
        await onRefreshProducts();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to delete warehouse.');
      }
    } catch (e) {
      setError('An error occurred.');
    }
  };

  const handleUpdateWarehouseStock = async (sku: string, qty: number) => {
    setUpdatingStockSku(sku);
    try {
      const res = await fetch('/api/wms/warehouses/stock/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku,
          warehouseId: selectedWarehouseId,
          quantity: qty
        })
      });
      const data = await res.json();
      if (data.success) {
        await onRefreshProducts();
        await onRefreshLogs();
      } else {
        setError(data.error || 'Failed to update stock.');
        setTimeout(() => setError(null), 4000);
      }
    } catch (e) {
      console.error('Error updating stock:', e);
    } finally {
      setUpdatingStockSku(null);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/wms/suppliers');
      const data = await res.json();
      setSuppliers(data);
    } catch (e) {
      console.error('Error fetching suppliers:', e);
    }
  };

  const fetchPOs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/wms/purchase-orders');
      const data = await res.json();
      setPurchaseOrders(data);
    } catch (e) {
      console.error('Error fetching purchase orders:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSupplierModal = (sup: Supplier | null = null) => {
    if (sup) {
      setSelectedSupplier(sup);
      setSupName(sup.name);
      setSupCode(sup.code);
      setSupContact(sup.contactName);
      setSupEmail(sup.email);
      setSupPhone(sup.phone);
      setSupAddress(sup.address);
      setSupLeadTime(sup.leadTimeDays);
    } else {
      setSelectedSupplier(null);
      setSupName('');
      setSupCode('');
      setSupContact('');
      setSupEmail('');
      setSupPhone('');
      setSupAddress('');
      setSupLeadTime(7);
    }
    setShowSupplierModal(true);
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName || !supCode) {
      setError('Supplier Name and Code are required.');
      return;
    }
    setError(null);
    try {
      const res = await fetch('/api/wms/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedSupplier?.id,
          name: supName,
          code: supCode,
          contactName: supContact,
          email: supEmail,
          phone: supPhone,
          address: supAddress,
          leadTimeDays: supLeadTime
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Supplier ${selectedSupplier ? 'updated' : 'created'} successfully!`);
        fetchSuppliers();
        setShowSupplierModal(false);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to save supplier details.');
      }
    } catch (e) {
      setError('An error occurred while saving the supplier.');
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this supplier? This action is irreversible.')) return;
    try {
      const res = await fetch(`/api/wms/suppliers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSuccess('Supplier deleted successfully.');
        fetchSuppliers();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to delete supplier.');
      }
    } catch (e) {
      setError('An error occurred.');
    }
  };

  const handleOpenPoCreate = () => {
    setIsCreatingPo(true);
    setPoSupplierId(suppliers[0]?.id || '');
    setPoNotes('');
    
    // Set expected date to 7 days from now as default
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    setPoExpectedDate(defaultDate.toISOString().split('T')[0]);

    // Seed first line if products exist
    const defaultSku = products[0]?.sku || '';
    const defaultCost = products[0]?.buyingPrice || 10;
    setPoLines([{ sku: defaultSku, quantity: 50, unitCost: defaultCost }]);
    setShowPoModal(true);
  };

  const handleAddPoLine = () => {
    const defaultSku = products[0]?.sku || '';
    const defaultCost = products[0]?.buyingPrice || 10;
    setPoLines([...poLines, { sku: defaultSku, quantity: 50, unitCost: defaultCost }]);
  };

  const handleRemovePoLine = (index: number) => {
    if (poLines.length === 1) return;
    setPoLines(poLines.filter((_, idx) => idx !== index));
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    const updated = [...poLines];
    if (field === 'sku') {
      updated[index].sku = value;
      // Auto populate unit cost from product schema
      const prod = products.find(p => p.sku === value);
      if (prod) {
        updated[index].unitCost = prod.buyingPrice;
      }
    } else if (field === 'quantity') {
      updated[index].quantity = Math.max(1, parseInt(value) || 0);
    } else if (field === 'unitCost') {
      updated[index].unitCost = Math.max(0, parseFloat(value) || 0);
    }
    setPoLines(updated);
  };

  const handleCreatePOSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poSupplierId) {
      setError('Supplier must be selected.');
      return;
    }
    const invalidLines = poLines.some(line => !line.sku || line.quantity <= 0);
    if (invalidLines) {
      setError('All lines must have a selected product SKU and quantity greater than zero.');
      return;
    }

    try {
      const itemsFormatted = poLines.map(l => {
        const prod = products.find(p => p.sku === l.sku);
        return {
          sku: l.sku,
          name: prod?.name || 'Unknown SKU',
          quantity: l.quantity,
          unitCost: l.unitCost
        };
      });

      const res = await fetch('/api/wms/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: poSupplierId,
          items: itemsFormatted,
          expectedDeliveryDate: new Date(poExpectedDate).toISOString(),
          notes: poNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Purchase Order ${data.purchaseOrder.poNumber} created in Draft mode!`);
        fetchPOs();
        setShowPoModal(false);
        setIsCreatingPo(false);
        onRefreshLogs();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to create PO.');
      }
    } catch (e) {
      setError('Error occurred while creating Purchase Order.');
    }
  };

  const handleOpenPoDetails = (po: PurchaseOrder) => {
    setIsCreatingPo(false);
    setSelectedPo(po);
    setShowPoModal(true);
  };

  const handleUpdatePoStatus = async (poId: string, newStatus: 'ordered' | 'received' | 'cancelled') => {
    try {
      let payload: any = { id: poId, status: newStatus };
      
      // If receiving, we pass received quantities (matching PO ordered line qty by default)
      if (newStatus === 'received') {
        const po = purchaseOrders.find(p => p.id === poId);
        if (po) {
          payload.items = po.items.map(item => ({
            ...item,
            receivedQuantity: item.quantity // receive full ordered quantity
          }));
        }
      }

      const res = await fetch('/api/wms/purchase-orders/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`PO status updated successfully to ${newStatus.toUpperCase()}`);
        await fetchPOs();
        await onRefreshProducts();
        await onRefreshLogs();
        setShowPoModal(false);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to update PO status.');
      }
    } catch (e) {
      setError('Error changing PO status.');
    }
  };

  const handleUpdatePoExpectedDateAndNotes = async (poId: string, notes: string, expectedDate: string) => {
    try {
      const res = await fetch('/api/wms/purchase-orders/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: poId,
          notes,
          expectedDeliveryDate: new Date(expectedDate).toISOString()
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('PO Details updated successfully.');
        await fetchPOs();
        await onRefreshLogs();
        setShowPoModal(false);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to update PO details.');
      }
    } catch (e) {
      setError('Error editing PO.');
    }
  };

  // Filter Purchase Orders
  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch = (po.poNumber || "").toLowerCase().includes(poSearch.toLowerCase()) || 
                          (po.supplierName || "").toLowerCase().includes(poSearch.toLowerCase()) ||
                          po.items.some(i => (i.sku || "").toLowerCase().includes(poSearch.toLowerCase()));
    
    const matchesStatus = poStatusFilter === 'all' ? true : po.status === poStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter Suppliers
  const filteredSuppliers = suppliers.filter(s => {
    return (s.name || "").toLowerCase().includes(supplierSearch.toLowerCase()) ||
           (s.code || "").toLowerCase().includes(supplierSearch.toLowerCase()) ||
           (s.contactName || "").toLowerCase().includes(supplierSearch.toLowerCase());
  });

  return (
    <div className="space-y-6" id="wms-view-container">
      
      {/* Alert Notifications */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs animate-fade-in">
          <Check className="w-4.5 h-4.5 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-100 p-3.5 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2 shadow-xs animate-fade-in">
          <AlertCircle className="w-4.5 h-4.5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Sub tabs: Purchase Orders vs Suppliers vs Warehouses */}
      <div className="bg-white border border-slate-200 p-1.5 rounded-xl flex gap-2 w-full max-w-lg shrink-0 shadow-xs" id="wms-sub-tabs">
        <button title="Perform action" 
          onClick={() => setActiveSubTab('pos')}
          className={`flex-1 text-center py-2 text-xs font-black rounded-lg transition-all uppercase tracking-wider cursor-pointer ${
            activeSubTab === 'pos' 
              ? 'bg-indigo-600 text-white font-extrabold shadow-sm' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Purchase Orders
        </button>
        <button title="Perform action" 
          onClick={() => setActiveSubTab('suppliers')}
          className={`flex-1 text-center py-2 text-xs font-black rounded-lg transition-all uppercase tracking-wider cursor-pointer ${
            activeSubTab === 'suppliers' 
              ? 'bg-indigo-600 text-white font-extrabold shadow-sm' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Suppliers Directory
        </button>
        <button title="Perform action" 
          onClick={() => setActiveSubTab('warehouses')}
          className={`flex-1 text-center py-2 text-xs font-black rounded-lg transition-all uppercase tracking-wider cursor-pointer ${
            activeSubTab === 'warehouses' 
              ? 'bg-indigo-600 text-white font-extrabold shadow-sm' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Warehouses & Locations
        </button>
      </div>

      {activeSubTab === 'pos' ? (
        <div className="space-y-4">
          
          {/* Controls bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search POs by number, supplier, SKU..."
                value={poSearch}
                onChange={(e) => setPoSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-800"
              />
            </div>

            <div className="flex gap-3 w-full md:w-auto items-center justify-end">
              <select
                value={poStatusFilter}
                onChange={(e) => setPoStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
              >
                <option value="all">All PO Statuses</option>
                <option value="draft">Drafts</option>
                <option value="ordered">Ordered (Pending Delivery)</option>
                <option value="received">Received (Stocks Replenished)</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <button title="Execute OpenPoCreate"
                onClick={handleOpenPoCreate}
                disabled={suppliers.length === 0}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                <Plus className="w-4 h-4" />
                New Purchase Order
              </button>
            </div>
          </div>

          {suppliers.length === 0 && (
            <div className="bg-amber-50 border border-amber-200/60 text-amber-800 rounded-xl p-4 text-xs flex gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <strong>No suppliers configured:</strong> Please register at least one wholesale Supplier in the <strong>Suppliers Directory</strong> tab first before raising Purchase Orders.
              </div>
            </div>
          )}

          {/* List of Purchase Orders */}
          {loading ? (
            <div className="text-center py-10 bg-white rounded-xl border border-slate-200">
              <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-semibold">Loading logistics purchase logs...</p>
            </div>
          ) : filteredPOs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-500" />
              <p className="text-xs font-bold">No purchase orders found matching those parameters.</p>
              <p className="text-[10px] mt-1 text-slate-400">Click "New Purchase Order" to raise a wholesale restocking invoice.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-200">
                    <th className="py-3 px-4">PO Number</th>
                    <th className="py-3 px-4">Supplier Name</th>
                    <th className="py-3 px-4">Order Date</th>
                    <th className="py-3 px-4">Expected Date</th>
                    <th className="py-3 px-4 text-center">Items Ordered</th>
                    <th className="py-3 px-4 text-right">Total Cost</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredPOs.map((po) => {
                    const totalItems = po.items.reduce((sum, item) => sum + item.quantity, 0);
                    return (
                      <tr key={po.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-black text-slate-900">{po.poNumber}</td>
                        <td className="py-3.5 px-4 font-extrabold text-slate-800">{po.supplierName}</td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium">
                          {new Date(po.orderDate).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium">
                          {po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold">
                          {po.items.length} SKUs <span className="text-slate-400">({totalItems} units)</span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900">
                          ${po.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase leading-none ${
                            po.status === 'received' ? 'bg-emerald-50 text-emerald-700' :
                            po.status === 'ordered' ? 'bg-blue-50 text-blue-700 animate-pulse' :
                            po.status === 'cancelled' ? 'bg-slate-100 text-slate-500' :
                            'bg-amber-50 text-amber-700'
                          }`}>
                            {po.status === 'received' && <CheckCircle className="w-3 h-3" />}
                            {po.status === 'ordered' && <Clock className="w-3 h-3" />}
                            {po.status === 'draft' && <FileText className="w-3 h-3" />}
                            {po.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button title="Edit item" 
                            onClick={() => handleOpenPoDetails(po)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[10px] px-2.5 py-1.5 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            Update & Edit
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>
      ) : activeSubTab === 'suppliers' ? (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search suppliers by name, code..."
                value={supplierSearch}
                onChange={(e) => setSupplierSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-800"
              />
            </div>

            <button title="Add new item" 
              onClick={() => handleOpenSupplierModal(null)}
              className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Register Supplier
            </button>
          </div>

          {/* Suppliers Bento Directory */}
          {filteredSuppliers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-500" />
              <p className="text-xs font-bold">No suppliers registered yet in your WMS catalog.</p>
              <p className="text-[10px] mt-1 text-slate-400">Click "Register Supplier" to set up a new manufacturing distributor.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSuppliers.map((sup) => (
                <div key={sup.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 hover:border-indigo-250 transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                          Code: {sup.code}
                        </span>
                        <h4 className="text-sm font-black text-slate-950 mt-1">{sup.name}</h4>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 text-center text-slate-500 shrink-0">
                        <span className="block font-black text-xs text-slate-800">{sup.leadTimeDays}</span>
                        <span className="text-[8px] uppercase tracking-wider block font-bold text-slate-400">Days Lead</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1.5 border-t border-slate-50 text-xs">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Contact: <strong>{sup.contactName || 'N/A'}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{sup.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{sup.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-start gap-2 text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <span className="line-clamp-2 leading-normal">{sup.address || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-slate-50 mt-4 justify-end">
                    <button title="Edit item" 
                      onClick={() => handleOpenSupplierModal(sup)}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-600 font-extrabold text-[10px] px-3 py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                    >
                      Edit Profile
                    </button>
                    <button title="Perform action" 
                      onClick={() => handleDeleteSupplier(sup.id)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-[10px] px-3 py-1.5 rounded-lg border border-rose-100 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      ) : activeSubTab === 'warehouses' ? (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search warehouses..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                value={warehouseSearch}
                onChange={(e) => setWarehouseSearch(e.target.value)}
              />
            </div>
            <button title="Add new item" 
              onClick={() => handleOpenWarehouseModal()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-black text-xs uppercase tracking-wider flex items-center gap-2 shrink-0 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Warehouse
            </button>
          </div>

          <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 flex items-start gap-3">
            <Warehouse className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div className="text-sm text-slate-700">
              <p className="font-bold text-slate-900">Warehouse Inventory Sync</p>
              <p className="mt-1">Manage multiple physical locations. The default warehouse will be used as your main fulfillment center. Stock levels are automatically synced across mapped channel listings based on the total physical inventory available.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {warehouses.filter(w => (w.name || "").toLowerCase().includes(warehouseSearch.toLowerCase()) || (w.code || "").toLowerCase().includes(warehouseSearch.toLowerCase())).map((wh) => (
              <div key={wh.id} className={`bg-white rounded-xl shadow-xs border flex flex-col justify-between p-4 ${wh.isDefault ? 'border-indigo-400 shadow-indigo-100/50' : 'border-slate-200'}`}>
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                        Code: {wh.code}
                      </span>
                      <h4 className="text-sm font-black text-slate-950 mt-1">{wh.name}</h4>
                    </div>
                    {wh.isDefault && (
                      <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Check className="w-3 h-3" /> Default
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 pt-3 mt-3 border-t border-slate-50 text-xs">
                    <div className="flex items-start gap-2 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <span className="line-clamp-2 leading-normal">{wh.address || 'No address provided'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-50 mt-4 justify-end">
                  <button title="Edit item" 
                    onClick={() => handleOpenWarehouseModal(wh)}
                    className="bg-slate-50 hover:bg-slate-100 text-slate-600 font-extrabold text-[10px] px-3 py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteWarehouse(wh.id)}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-[10px] px-3 py-1.5 rounded-lg border border-rose-100 transition-colors cursor-pointer"
                    disabled={wh.isDefault}
                    title={wh.isDefault ? "Cannot delete default warehouse" : ""}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="font-black text-sm text-slate-900 mb-4 flex items-center gap-2">
              <Warehouse className="w-4 h-4 text-indigo-600" /> Stock Count by Warehouse
            </h3>
            
            <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
              {warehouses.map(wh => (
                <button title="Perform action" 
                  key={wh.id}
                  onClick={() => setSelectedWarehouseId(wh.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                    selectedWarehouseId === wh.id 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {wh.name} {wh.isDefault ? '(Main)' : ''}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-200">
                    <th className="py-2.5 px-3 font-bold text-slate-600 uppercase tracking-wider">Product SKU</th>
                    <th className="py-2.5 px-3 font-bold text-slate-600 uppercase tracking-wider">Name</th>
                    <th className="py-2.5 px-3 font-bold text-slate-600 uppercase tracking-wider">Physical Stock</th>
                    <th className="py-2.5 px-3 font-bold text-slate-600 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.filter(p => !p.isBundle).map(p => {
                    const localStock = p.stockByWarehouse?.[selectedWarehouseId] || 0;
                    return (
                      <tr key={p.sku} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-mono font-bold text-slate-800">{p.sku}</td>
                        <td className="py-2 px-3 text-slate-600 font-medium">
                          <div className="flex items-center gap-2">
                            {p.image && <img src={p.image} alt={p.name} className="w-6 h-6 rounded-md object-cover" />}
                            {p.name}
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <span className={`font-black ${localStock > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {localStock} units
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <input 
                              type="number"
                              min="0"
                              className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded-md font-bold text-center text-slate-800"
                              defaultValue={localStock}
                              id={`stock_input_${p.sku}_${selectedWarehouseId}`}
                            />
                            <button title="Perform action" 
                              onClick={() => {
                                const el = document.getElementById(`stock_input_${p.sku}_${selectedWarehouseId}`) as HTMLInputElement;
                                if (el) {
                                  handleUpdateWarehouseStock(p.sku, parseInt(el.value) || 0);
                                }
                              }}
                              disabled={updatingStockSku === p.sku}
                              className="px-3 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-md font-bold text-[10px] uppercase tracking-wider transition-colors disabled:opacity-50"
                            >
                              {updatingStockSku === p.sku ? 'Updating...' : 'Set'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {/* Supplier Register/Edit Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form 
            onSubmit={handleSaveSupplier}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-scale-up"
          >
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-600" />
                {selectedSupplier ? 'Edit Supplier Profile' : 'Register New Supplier'}
              </h3>
              <button title="Close dialog or panel"  
                type="button"
                onClick={() => setShowSupplierModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Supplier Name *</label>
                  <input
                    type="text"
                    required
                    value={supName}
                    onChange={(e) => setSupName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-800"
                    placeholder="Grand Electronics Corp"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Unique Code *</label>
                  <input
                    type="text"
                    required
                    value={supCode}
                    onChange={(e) => setSupCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-800"
                    placeholder="GEC-EL"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Contact Person</label>
                  <input
                    type="text"
                    value={supContact}
                    onChange={(e) => setSupContact(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-800"
                    placeholder="James Lin"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Delivery Lead Time (Days)</label>
                  <input
                    type="number"
                    value={supLeadTime}
                    onChange={(e) => setSupLeadTime(Math.max(1, parseInt(e.target.value) || 7))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-800"
                    placeholder="7"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Email Address</label>
                  <input
                    type="email"
                    value={supEmail}
                    onChange={(e) => setSupEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-800"
                    placeholder="orders@grandelec.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Phone Contact</label>
                  <input
                    type="text"
                    value={supPhone}
                    onChange={(e) => setSupPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-800"
                    placeholder="+1 415-555-0810"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">Supplier Address</label>
                <textarea
                  rows={2}
                  value={supAddress}
                  onChange={(e) => setSupAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-800 focus:outline-none"
                  placeholder="900 Technology Dr, San Jose, CA 95110"
                />
              </div>
            </div>

            <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button title="Cancel and close" 
                type="button"
                onClick={() => setShowSupplierModal(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-[11px] px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button title="Submit form" 
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px] px-4 py-2 rounded-lg"
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Purchase Order Create / Details Modal */}
      {showPoModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          {isCreatingPo ? (
            <form 
              onSubmit={handleCreatePOSubmit}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-scale-up my-8 text-xs"
            >
              <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-indigo-600" />
                  Raise New Purchase Order
                </h3>
                <button title="Close dialog or panel"  
                  type="button"
                  onClick={() => setShowPoModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Supplier Account *</label>
                    <select
                      value={poSupplierId}
                      onChange={(e) => setPoSupplierId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-800"
                    >
                      {suppliers.map(s => (
                        <option key={s.id} value={s.id}>[{s.code}] {s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Expected Delivery Date *</label>
                    <input
                      type="date"
                      required
                      value={poExpectedDate}
                      onChange={(e) => setPoExpectedDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-800"
                    />
                  </div>
                </div>

                {/* Line Items Builder */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Purchase Order Items</span>
                    <button title="Add new item"
                      type="button"
                      onClick={handleAddPoLine}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[10px] font-black px-2 py-1 rounded flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Item Line
                    </button>
                  </div>

                  <div className="space-y-2 border border-slate-100 bg-slate-50/40 rounded-xl p-3">
                    {poLines.map((line, idx) => {
                      const currentProduct = products.find(p => p.sku === line.sku);
                      return (
                        <div key={idx} className="flex gap-3 items-center">
                          <div className="flex-1">
                            <label className="text-[9px] font-bold uppercase text-slate-400 block mb-0.5">Product SKU</label>
                            <select
                              value={line.sku}
                              onChange={(e) => handleLineChange(idx, 'sku', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 font-bold text-slate-800"
                            >
                              <option value="">-- Choose Product --</option>
                              {products.map(p => (
                                <option key={p.sku} value={p.sku}>[{p.sku}] {p.name} (Stock: {p.stock})</option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="w-24">
                            <label className="text-[9px] font-bold uppercase text-slate-400 block mb-0.5">Quantity</label>
                            <input
                              type="number"
                              required
                              min="1"
                              value={line.quantity}
                              onChange={(e) => handleLineChange(idx, 'quantity', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 font-bold text-slate-800"
                            />
                          </div>

                          <div className="w-28">
                            <label className="text-[9px] font-bold uppercase text-slate-400 block mb-0.5">Unit Cost ({currencySymbol})</label>
                            <input
                              type="number"
                              step="0.01"
                              required
                              value={line.unitCost}
                              onChange={(e) => handleLineChange(idx, 'unitCost', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 font-bold text-slate-800"
                            />
                          </div>

                          <div className="w-20 pt-4 font-mono font-bold text-slate-700 text-center">
                            ${(line.quantity * line.unitCost).toFixed(2)}
                          </div>

                          <button title="Perform action" 
                            type="button"
                            onClick={() => handleRemovePoLine(idx)}
                            disabled={poLines.length === 1}
                            className="pt-4 text-rose-500 hover:text-rose-700 disabled:opacity-30 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="font-extrabold text-slate-600">Total Invoice Valuation:</span>
                    <span className="font-mono font-black text-sm text-indigo-700">
                      ${poLines.reduce((sum, line) => sum + (line.quantity * line.unitCost), 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Purchase Order Terms & Memo</label>
                  <textarea
                    rows={2}
                    value={poNotes}
                    onChange={(e) => setPoNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-800"
                    placeholder="Provide special delivery codes, packaging instructions, or payment arrangements..."
                  />
                </div>
              </div>

              <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button title="Cancel and close" 
                  type="button"
                  onClick={() => setShowPoModal(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-[11px] px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button title="Submit form" 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px] px-4 py-2 rounded-lg"
                >
                  Save Draft PO
                </button>
              </div>
            </form>
          ) : (
            selectedPo && (
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-scale-up my-8 text-xs">
                <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-600 text-white font-black text-[10px] px-2.5 py-1 rounded uppercase tracking-wider">
                      {selectedPo.poNumber}
                    </span>
                    <span className="font-black text-slate-600 text-[10px] uppercase">
                      Status: <strong className="text-slate-800">{selectedPo.status.toUpperCase()}</strong>
                    </span>
                  </div>
                  <button title="Close dialog or panel"  
                    type="button"
                    onClick={() => setShowPoModal(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-6 bg-slate-50/50 p-4 rounded-xl border border-slate-200/50">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Supplier Details</span>
                      <p className="font-black text-slate-900 text-xs">{selectedPo.supplierName}</p>
                      <p className="text-[11px] text-slate-500 font-medium">Order Date: {new Date(selectedPo.orderDate).toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Expected Arrival</span>
                      <p className="font-black text-slate-800 text-xs">{selectedPo.expectedDeliveryDate ? new Date(selectedPo.expectedDeliveryDate).toLocaleDateString() : 'N/A'}</p>
                      {selectedPo.receivedDate && (
                        <p className="text-[11px] text-emerald-600 font-bold">Received On: {new Date(selectedPo.receivedDate).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>

                  {/* PO lines list */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Product Inventory Line Allocation</span>
                    
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 border-b border-slate-200">
                            <th className="py-2.5 px-3">Product SKU</th>
                            <th className="py-2.5 px-3">Item Name</th>
                            <th className="py-2.5 px-3 text-center">Ordered Qty</th>
                            <th className="py-2.5 px-3 text-right">Unit Cost</th>
                            <th className="py-2.5 px-3 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[11px] font-medium text-slate-700">
                          {selectedPo.items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/20">
                              <td className="py-2 px-3 font-mono font-bold text-slate-800">{item.sku}</td>
                              <td className="py-2 px-3 text-slate-600 max-w-xs truncate font-semibold">{item.name}</td>
                              <td className="py-2 px-3 text-center font-black text-slate-900">{item.quantity} units</td>
                              <td className="py-2 px-3 text-right font-mono">${item.unitCost.toFixed(2)}</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-slate-800">${(item.quantity * item.unitCost).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {selectedPo.notes && (
                    <div className="p-3 bg-indigo-50/40 border border-indigo-100/30 rounded-xl space-y-1">
                      <span className="text-[9px] font-black uppercase text-indigo-700 tracking-wider">Supplier Notes</span>
                      <p className="text-slate-600 font-medium leading-relaxed">{selectedPo.notes}</p>
                    </div>
                  )}

                  {/* Actions / Status changes */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                      Status Workflow Transition & Automation
                    </span>

                    {selectedPo.status === 'draft' && (
                      <div className="space-y-2 text-slate-600 font-medium leading-normal">
                        <p>This Purchase Order is a <strong>Draft</strong> and has not yet been submitted to the supplier.</p>
                        <div className="flex gap-2 pt-1">
                          <button title="Cancel and close" 
                            type="button"
                            onClick={() => handleUpdatePoStatus(selectedPo.id, 'ordered')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px] px-3.5 py-2 rounded-lg cursor-pointer"
                          >
                            Mark as ORDERED (Simulate Dispatch)
                          </button>
                          <button title="Cancel and close" 
                            type="button"
                            onClick={() => handleUpdatePoStatus(selectedPo.id, 'cancelled')}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-[11px] px-3.5 py-2 rounded-lg cursor-pointer"
                          >
                            Cancel PO
                          </button>
                        </div>
                      </div>
                    )}

                    {selectedPo.status === 'ordered' && (
                      <div className="space-y-2 text-slate-600 font-medium leading-normal">
                        <p>This Purchase Order has been submitted to the supplier. Mark as <strong>Received</strong> once the physical shipment arrives at the warehouse docks.</p>
                        <div className="bg-amber-50 border border-amber-200/50 rounded-lg p-3 text-[11px] text-amber-800 flex gap-2">
                          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <strong>Automatic Catalog Sync:</strong> Marking this PO as received will automatically increment your global product catalog stock levels in real time.
                          </div>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button title="Perform action" 
                            type="button"
                            onClick={() => handleUpdatePoStatus(selectedPo.id, 'received')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] px-3.5 py-2 rounded-lg flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            Mark as RECEIVED (Add Stock)
                          </button>
                          <button title="Cancel and close" 
                            type="button"
                            onClick={() => handleUpdatePoStatus(selectedPo.id, 'cancelled')}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-[11px] px-3.5 py-2 rounded-lg cursor-pointer"
                          >
                            Cancel PO
                          </button>
                        </div>
                      </div>
                    )}

                    {selectedPo.status === 'received' && (
                      <div className="text-emerald-800 bg-emerald-50 border border-emerald-100 p-3 rounded-lg flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span className="font-semibold">This Purchase Order is fully received and stocks have been synced. No further modifications can be made.</span>
                      </div>
                    )}

                    {selectedPo.status === 'cancelled' && (
                      <div className="text-slate-600 bg-slate-100 p-3 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-slate-400 shrink-0" />
                        <span className="font-semibold">This Purchase Order is Cancelled.</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                  <button title="Perform action" 
                    type="button"
                    onClick={() => setShowPoModal(false)}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-[11px] px-4 py-2 rounded-lg cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Warehouse Register/Edit Modal */}
      {showWarehouseModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form 
            onSubmit={handleSaveWarehouse}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-scale-up"
          >
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Warehouse className="w-4 h-4 text-indigo-600" />
                {editingWarehouse ? 'Edit Warehouse Profile' : 'Register New Warehouse'}
              </h3>
              <button title="Close dialog or panel"  
                type="button"
                onClick={() => setShowWarehouseModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Warehouse Name *</label>
                  <input
                    type="text"
                    required
                    value={whName}
                    onChange={(e) => setWhName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-800"
                    placeholder="East Coast Fulfillment"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Unique Code *</label>
                  <input
                    type="text"
                    required
                    value={whCode}
                    onChange={(e) => setWhCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-800"
                    placeholder="EC-01"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">Physical Address</label>
                <textarea
                  rows={2}
                  value={whAddress}
                  onChange={(e) => setWhAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-800 focus:outline-none"
                  placeholder="50 Industrial Blvd, Newark NJ"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="default-warehouse-check"
                  checked={whIsDefault}
                  onChange={(e) => setWhIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 border-slate-300"
                />
                <label htmlFor="default-warehouse-check" className="font-bold text-slate-700">Set as Default Warehouse</label>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">The default warehouse is the primary location for incoming Purchase Orders and general inventory sync.</p>
            </div>

            <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button title="Cancel and close" 
                type="button"
                onClick={() => setShowWarehouseModal(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-[11px] px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button title="Submit form" 
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px] px-4 py-2 rounded-lg"
              >
                Save Warehouse
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
