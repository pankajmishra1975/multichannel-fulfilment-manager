#!/bin/bash
cat << 'INNER' > patch.txt
        {/* Order Items & Splitting */}
        <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-4 h-4 text-slate-500" /> Order Items ({order.items.length})
            </h4>
            <button
              onClick={handleSplitOrder}
              disabled={splittingOrder || (order.items.length <= 1 && order.items[0]?.quantity === 1)}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed px-2.5 py-1 rounded-md transition-all shrink-0"
              title="Split Hazmat/Heavy items or divide order into multiple shipments"
            >
              {splittingOrder ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Split className="w-3.5 h-3.5" />
              )}
              Auto-Split by Rules
            </button>
          </div>
          <div className="bg-white rounded-lg border border-slate-100 divide-y divide-slate-100 max-h-48 overflow-y-auto">
            {order.items.map((item, idx) => (
              <div key={idx} className="p-3 flex items-start gap-3">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="w-10 h-10 object-cover rounded-md border border-slate-200" />
                ) : (
                  <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center text-slate-400">
                    <Package className="w-5 h-5" />
                  </div>
                )}
                <div className="flex-1">
                  <h5 className="text-[11px] font-bold text-slate-800 line-clamp-1">{item.title}</h5>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] font-mono text-slate-500">SKU: {item.sku}</span>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 rounded">Qty: {item.quantity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
INNER
sed -i '/<div className="flex-1 overflow-y-auto p-5 space-y-5" id="details-inner-scroll">/r patch.txt' src/components/ActiveOrderDetails.tsx
