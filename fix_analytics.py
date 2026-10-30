import re

with open('src/components/ProductsManager.tsx', 'r') as f:
    content = f.read()

replacement = """              {/* Profit Analytics */}
              <div className="md:col-span-4 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-800">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-bold">Live Profit Analytics</span>
                </div>
                <div className="flex gap-4 text-xs">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 uppercase font-bold">Shipping Cost</span>
                    <span className="font-mono text-slate-700">{currencySymbol} {(Number(addForm.shippingCost) > 0 ? Number(addForm.shippingCost) : (Number(addForm.weight) * 0.25 || 2.50)).toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 uppercase font-bold">Commission</span>
                    <span className="font-mono text-slate-700">{currencySymbol} {(Number(addForm.commission) > 0 ? Number(addForm.commission) : (Number(addForm.sellingPrice) * 0.15 || 0)).toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 uppercase font-bold">Net Profit</span>
                    <span className="font-mono font-black text-emerald-600">
                      {currencySymbol} {(Number(addForm.sellingPrice) - Number(addForm.buyingPrice) - (Number(addForm.shippingCost) > 0 ? Number(addForm.shippingCost) : (Number(addForm.weight) * 0.25 || 2.50)) - (Number(addForm.commission) > 0 ? Number(addForm.commission) : (Number(addForm.sellingPrice) * 0.15 || 0))).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 uppercase font-bold">Margin</span>
                    <span className="font-mono font-black text-indigo-600">
                      {Number(addForm.sellingPrice) > 0 
                        ? Math.round(((Number(addForm.sellingPrice) - Number(addForm.buyingPrice) - (Number(addForm.shippingCost) > 0 ? Number(addForm.shippingCost) : (Number(addForm.weight) * 0.25 || 2.50)) - (Number(addForm.commission) > 0 ? Number(addForm.commission) : (Number(addForm.sellingPrice) * 0.15 || 0))) / Number(addForm.sellingPrice)) * 100) 
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>"""

content = re.sub(r'              \{\/\* Profit Analytics \*\/}.*?<\/div>\n              <\/div>', replacement, content, flags=re.DOTALL)

with open('src/components/ProductsManager.tsx', 'w') as f:
    f.write(content)

