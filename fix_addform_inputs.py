import re

with open('src/components/ProductsManager.tsx', 'r') as f:
    content = f.read()

replacement = """              <div>
                <label className="block text-slate-500 font-bold mb-1">Selling Price (MSRP)</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-slate-400 font-mono text-xs font-bold">{currencySymbol}</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="12.99"
                    value={addForm.sellingPrice}
                    onChange={(e) => setAddForm({...addForm, sellingPrice: e.target.value})}
                    className="w-full p-2 pl-8 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-500 font-bold mb-1">Selling Comm.</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-slate-400 font-mono text-xs font-bold">{currencySymbol}</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={addForm.commission}
                    onChange={(e) => setAddForm({...addForm, commission: e.target.value})}
                    className="w-full p-2 pl-8 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-500 font-bold mb-1">Ship Cost</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-slate-400 font-mono text-xs font-bold">{currencySymbol}</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={addForm.shippingCost}
                    onChange={(e) => setAddForm({...addForm, shippingCost: e.target.value})}
                    className="w-full p-2 pl-8 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>"""

content = content.replace('''              <div>
                <label className="block text-slate-500 font-bold mb-1">Selling Price (MSRP)</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-slate-400 font-mono text-xs font-bold">{currencySymbol}</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="12.99"
                    value={addForm.sellingPrice}
                    onChange={(e) => setAddForm({...addForm, sellingPrice: e.target.value})}
                    className="w-full p-2 pl-8 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>''', replacement)

with open('src/components/ProductsManager.tsx', 'w') as f:
    f.write(content)
