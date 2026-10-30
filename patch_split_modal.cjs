const fs = require('fs');

let code = `
import React, { useState } from 'react';
import { Order } from '../types';
import { X, Package, ArrowRight, Save, Plus, Trash2, Split } from 'lucide-react';

interface SplitOrderModalProps {
  order: Order;
  onClose: () => void;
  onSplitConfirm: (shipments: any[][]) => Promise<void>;
}

export default function SplitOrderModal({ order, onClose, onSplitConfirm }: SplitOrderModalProps) {
  const [shipments, setShipments] = useState<any[][]>([
    order.items.map(item => ({ ...item, splitQty: item.quantity })),
    order.items.map(item => ({ ...item, splitQty: 0 }))
  ]);
  
  const [saving, setSaving] = useState(false);

  const handleMove = (fromShipment: number, toShipment: number, itemIndex: number, qty: number = 1) => {
    const newShipments = shipments.map(s => s.map(item => ({...item})));
    
    if (newShipments[fromShipment][itemIndex].splitQty >= qty) {
      newShipments[fromShipment][itemIndex].splitQty -= qty;
      newShipments[toShipment][itemIndex].splitQty += qty;
    }
    
    setShipments(newShipments);
  };

  const addShipment = () => {
    setShipments([...shipments, order.items.map(item => ({ ...item, splitQty: 0 }))]);
  };

  const removeShipment = (index: number) => {
    if (shipments.length <= 2) return;
    const newShipments = [...shipments];
    // Move all items back to shipment 0
    newShipments[index].forEach((item, i) => {
      newShipments[0][i].splitQty += item.splitQty;
    });
    newShipments.splice(index, 1);
    setShipments(newShipments);
  };

  const handleConfirm = async () => {
    const finalShipments = shipments.map(s => 
      s.filter(item => item.splitQty > 0).map(item => ({
        ...item,
        quantity: item.splitQty
      }))
    ).filter(s => s.length > 0);
    
    if (finalShipments.length < 2) {
      alert('You need at least 2 populated shipments to split the order.');
      return;
    }
    
    // Validate total quantity matches
    let totalQty = 0;
    finalShipments.forEach(s => s.forEach(item => { totalQty += item.quantity; }));
    let origQty = 0;
    order.items.forEach(item => { origQty += item.quantity; });
    if (totalQty !== origQty) {
      alert('Total item quantity does not match the original order.');
      return;
    }

    setSaving(true);
    await onSplitConfirm(finalShipments);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in border border-slate-200">
        <div className="bg-slate-950 p-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/20 p-2 rounded-xl text-indigo-400">
              <Split className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-white">Manual Order Split</h2>
              <p className="text-[10px] text-slate-400">Divide {order.orderId} into multiple shipments</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors bg-slate-900 p-2 rounded-lg border border-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-slate-50 flex gap-4 min-h-[400px]">
          {shipments.map((shipment, sIdx) => (
            <div key={sIdx} className={\`min-w-[300px] flex-1 bg-white rounded-xl border \${sIdx === 0 ? 'border-slate-200' : 'border-indigo-100'} shadow-sm overflow-hidden flex flex-col relative\`}>
              <div className={\`p-3 \${sIdx === 0 ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-indigo-50 border-indigo-100 text-indigo-800'} border-b font-bold text-xs uppercase tracking-wider flex items-center justify-between\`}>
                <div className="flex items-center gap-2">
                  <Package className={\`w-4 h-4 \${sIdx === 0 ? 'text-slate-500' : 'text-indigo-500'}\`} />
                  {sIdx === 0 ? 'Original Shipment' : \`New Shipment \${sIdx}\`}
                </div>
                {sIdx !== 0 && shipments.length > 2 && (
                  <button onClick={() => removeShipment(sIdx)} className="text-rose-500 hover:text-rose-700 bg-white p-1 rounded-md shadow-sm border border-rose-100">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="p-3 space-y-2 overflow-y-auto flex-1">
                {shipment.map((item, idx) => (
                  <div key={idx} className={\`p-2 border rounded flex flex-col gap-2 \${item.splitQty > 0 ? (sIdx===0 ? 'border-slate-200 bg-slate-50' : 'border-indigo-200 bg-indigo-50/30') : 'border-slate-100 bg-slate-50 opacity-50'}\`}>
                    <div className="flex items-start justify-between text-xs">
                      <div className="truncate flex-1 pr-2">
                        <span className="font-bold text-slate-800">{item.sku}</span><br />
                        <span className="text-[10px] text-slate-500 truncate block">{item.name}</span>
                      </div>
                      <span className="font-mono bg-white px-2 py-1 rounded border border-slate-200 font-bold text-slate-700 shrink-0">Qty: {item.splitQty}</span>
                    </div>
                    
                    <div className="flex justify-between mt-1 pt-1 border-t border-slate-100/50">
                      <div className="flex gap-1">
                        {sIdx > 0 && (
                          <button 
                            onClick={() => handleMove(sIdx, sIdx - 1, idx)} 
                            disabled={item.splitQty === 0}
                            className="bg-slate-100 text-slate-600 p-1 rounded hover:bg-slate-200 disabled:opacity-30"
                            title="Move 1 to left shipment"
                          >
                            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                          </button>
                        )}
                        {sIdx < shipments.length - 1 && (
                          <button 
                            onClick={() => handleMove(sIdx, sIdx + 1, idx)} 
                            disabled={item.splitQty === 0}
                            className="bg-indigo-50 text-indigo-600 p-1 rounded hover:bg-indigo-100 disabled:opacity-30"
                            title="Move 1 to right shipment"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      
                      <div className="flex gap-1">
                        {/* Move All buttons */}
                        {sIdx > 0 && (
                          <button 
                            onClick={() => handleMove(sIdx, 0, idx, item.splitQty)} 
                            disabled={item.splitQty === 0}
                            className="text-[9px] font-bold uppercase text-slate-500 hover:text-slate-800 px-1.5 py-0.5 rounded bg-slate-100 disabled:opacity-30"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {/* Add shipment button */}
          <div className="min-w-[60px] flex flex-col justify-center border-2 border-dashed border-slate-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors cursor-pointer group" onClick={addShipment}>
            <div className="flex flex-col items-center justify-center p-4 text-slate-400 group-hover:text-indigo-500 gap-2">
              <Plus className="w-6 h-6" />
              <span className="text-[10px] font-bold uppercase tracking-widest [writing-mode:vertical-rl] rotate-180">Add Shipment</span>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-200 bg-white flex justify-between items-center shrink-0">
          <div className="text-[10px] text-slate-500">
            Split into {shipments.filter(s => s.some(i => i.splitQty > 0)).length} active shipments
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-50"
            >
              {saving ? <Split className="w-4 h-4 animate-pulse" /> : <Save className="w-4 h-4" />}
              Confirm Split Shipments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/SplitOrderModal.tsx', code);
