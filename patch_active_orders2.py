import re

content = open('src/components/ActiveOrderDetails.tsx').read()

crm_section = """        {/* CRM Customer Profile Sync */}
        <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-500" /> Customer Profile & CRM
            </h4>
          </div>
          <div className="bg-white rounded-lg border border-slate-100 p-3 space-y-3">
            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">CRM Tags</label>
              <div className="flex flex-wrap gap-1.5 items-center">
                {(customerProfile.tags || []).map((tag: string, i: number) => (
                  <span key={i} className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                    {tag}
                    <button onClick={() => {
                      const newTags = (customerProfile.tags || []).filter((t: string) => t !== tag);
                      updateCustomer(customerEmail, { tags: newTags });
                    }} className="hover:text-rose-500 font-bold">×</button>
                  </span>
                ))}
                <button 
                  onClick={() => {
                    const tag = prompt("Enter new CRM tag:");
                    if (tag && !(customerProfile.tags || []).includes(tag)) {
                      updateCustomer(customerEmail, { tags: [...(customerProfile.tags || []), tag] });
                    }
                  }}
                  className="text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md border border-indigo-200 transition-colors"
                >
                  + Add Tag
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">CRM Notes</label>
              <textarea
                value={customerProfile.notes || ''}
                onChange={(e) => updateCustomer(customerEmail, { notes: e.target.value })}
                placeholder="Private notes synced with CRM..."
                className="w-full text-xs p-2 border border-slate-200 rounded bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-400 font-sans h-16 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Step 1: Destination Address Verification */}"""

content = content.replace("        {/* Step 1: Destination Address Verification */}", crm_section)

open('src/components/ActiveOrderDetails.tsx', 'w').write(content)
