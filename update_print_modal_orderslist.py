import re

with open('src/components/OrdersList.tsx', 'r') as f:
    content = f.read()

# Add states for printing modal
state_insert = """  const [mergingOrderIds, setMergingOrderIds] = useState<string[]>([]);
  const [packagePresets, setPackagePresets] = useState<any[]>([]);

  // Print modal states
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printTemplates, setPrintTemplates] = useState<any[]>([]);
  const [selectedPrintTemplate, setSelectedPrintTemplate] = useState<string>('');"""

content = content.replace("  const [mergingOrderIds, setMergingOrderIds] = useState<string[]>([]);\n  const [packagePresets, setPackagePresets] = useState<any[]>([]);", state_insert)

# Add function to load templates and open modal
modal_funcs = """  const handleOpenPrintModal = () => {
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
  };"""

# inject this somewhere after useStates
content = content.replace("  // Draggable columns state", modal_funcs + "\n\n  // Draggable columns state")

# Add Print button in bulk actions
print_btn = """                <button
                  type="button"
                  onClick={handleOpenPrintModal}
                  className="bg-purple-100 hover:bg-purple-200 text-purple-800 font-extrabold text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Box className="w-3.5 h-3.5" /> Print
                </button>
                <button"""

content = content.replace("                <button", print_btn, 1)

# Add Modal JSX at the end of the component
modal_jsx = """      {isPrintModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-100 overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <h3 className="text-lg font-black tracking-tight">Print Labels / Invoices</h3>
              <button onClick={() => setIsPrintModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
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
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
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
      )}"""

content = content.replace("    </div>\n  );\n}", modal_jsx + "\n    </div>\n  );\n}")

with open('src/components/OrdersList.tsx', 'w') as f:
    f.write(content)
