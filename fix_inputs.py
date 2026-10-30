import re

with open('src/components/ProductsManager.tsx', 'r') as f:
    content = f.read()

replacement = """                        <div className="grid grid-cols-4 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Cost ({currencySymbol})</label>
                            <input
                              type="number"
                              step="0.01"
                              value={editForm.buyingPrice}
                              onChange={(e) => setEditForm({...editForm, buyingPrice: e.target.value})}
                              className="w-full font-mono p-1 border border-slate-300 rounded focus:outline-none text-[11px]"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Selling ({currencySymbol})</label>
                            <input
                              type="number"
                              step="0.01"
                              value={editForm.sellingPrice}
                              onChange={(e) => setEditForm({...editForm, sellingPrice: e.target.value})}
                              className="w-full font-mono p-1 border border-slate-300 rounded focus:outline-none text-[11px]"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Comm. ({currencySymbol})</label>
                            <input
                              type="number"
                              step="0.01"
                              value={editForm.commission}
                              onChange={(e) => setEditForm({...editForm, commission: e.target.value})}
                              className="w-full font-mono p-1 border border-slate-300 rounded focus:outline-none text-[11px]"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Ship Cost ({currencySymbol})</label>
                            <input
                              type="number"
                              step="0.01"
                              value={editForm.shippingCost}
                              onChange={(e) => setEditForm({...editForm, shippingCost: e.target.value})}
                              className="w-full font-mono p-1 border border-slate-300 rounded focus:outline-none text-[11px]"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Stock Level</label>"""

content = content.replace(
'''                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Cost ({currencySymbol})</label>
                            <input
                              type="number"
                              step="0.01"
                              value={editForm.buyingPrice}
                              onChange={(e) => setEditForm({...editForm, buyingPrice: e.target.value})}
                              className="w-full font-mono p-1 border border-slate-300 rounded focus:outline-none text-[11px]"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Retail Selling ({currencySymbol})</label>
                            <input
                              type="number"
                              step="0.01"
                              value={editForm.sellingPrice}
                              onChange={(e) => setEditForm({...editForm, sellingPrice: e.target.value})}
                              className="w-full font-mono p-1 border border-slate-300 rounded focus:outline-none text-[11px]"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Stock Level</label>''',
replacement
)

with open('src/components/ProductsManager.tsx', 'w') as f:
    f.write(content)
