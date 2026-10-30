import re

with open('src/components/OrdersList.tsx', 'r') as f:
    content = f.read()

# Add state and effect for package presets
state_addition = """
  const [packagePresets, setPackagePresets] = useState<any[]>([
    { id: '1', name: 'Env (56g)', weight: 56, length: 15, width: 10, height: 1 },
    { id: '2', name: 'Small Box (225g)', weight: 225, length: 20, width: 15, height: 10 },
    { id: '3', name: 'Med Box (450g)', weight: 450, length: 30, width: 25, height: 15 },
    { id: '4', name: 'Large Box (900g)', weight: 900, length: 45, width: 35, height: 25 }
  ]);

  useEffect(() => {
    const saved = localStorage.getItem('appPackagePresets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          setPackagePresets(parsed);
        }
      } catch (e) {}
    }
  }, []);
"""

content = content.replace("  const [bulkStrategyOpen, setBulkStrategyOpen] = useState(false);", "  const [bulkStrategyOpen, setBulkStrategyOpen] = useState(false);" + state_addition)

replacement_buttons = """              {/* Quick Presets row */}
              <div className="flex flex-wrap gap-1 items-center">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Presets:</span>
                {packagePresets.map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setBulkWeight(String(preset.weight));
                      setBulkLength(String(preset.length));
                      setBulkWidth(String(preset.width));
                      setBulkHeight(String(preset.height));
                    }}
                    className="text-[9px] bg-white border border-slate-250 hover:bg-slate-50 font-extrabold px-1.5 py-0.5 rounded cursor-pointer text-slate-600 transition-colors shadow-2xs"
                  >
                    📦 {preset.name}
                  </button>
                ))}
              </div>"""

content = re.sub(r'              \{\/\* Quick Presets row \*\/}.*?<\/div>', replacement_buttons, content, flags=re.DOTALL)

with open('src/components/OrdersList.tsx', 'w') as f:
    f.write(content)

