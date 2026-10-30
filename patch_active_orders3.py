import re

content = open('src/components/ActiveOrderDetails.tsx').read()

crm_tickets_section = """            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">CRM Notes</label>
              <textarea
                value={customerProfile.notes || ''}
                onChange={(e) => updateCustomer(customerEmail, { notes: e.target.value })}
                placeholder="Private notes synced with CRM..."
                className="w-full text-xs p-2 border border-slate-200 rounded bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-400 font-sans h-16 resize-none"
              />
            </div>
            {/* Communication Logs */}
            <div className="border-t border-slate-100 pt-3 mt-3">
              <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-2">Communication Logs (Tickets)</label>
              <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                {(() => {
                  const { tickets } = useCrm();
                  const customerTickets = tickets.filter(t => t.customerId === customerEmail);
                  if (customerTickets.length === 0) return <p className="text-xs text-slate-400 italic">No communication history</p>;
                  return customerTickets.map(t => (
                    <div key={t.id} className="bg-slate-50 p-2 rounded border border-slate-100">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-slate-700">{t.subject}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${t.status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'}`}>{t.status}</span>
                      </div>
                      {t.messages.length > 0 && (
                        <p className="text-[10px] text-slate-600 line-clamp-1">{t.messages[t.messages.length - 1].content}</p>
                      )}
                    </div>
                  ));
                })()}
              </div>
            </div>"""

content = content.replace("""            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">CRM Notes</label>
              <textarea
                value={customerProfile.notes || ''}
                onChange={(e) => updateCustomer(customerEmail, { notes: e.target.value })}
                placeholder="Private notes synced with CRM..."
                className="w-full text-xs p-2 border border-slate-200 rounded bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-400 font-sans h-16 resize-none"
              />
            </div>""", crm_tickets_section)

open('src/components/ActiveOrderDetails.tsx', 'w').write(content)
