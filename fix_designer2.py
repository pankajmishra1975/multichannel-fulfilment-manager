import re

with open('src/components/TemplateDesigner.tsx', 'r') as f:
    content = f.read()

replacement_select = """              value={newTemplateType}
              onChange={(e) => setNewTemplateType(e.target.value as any)}
              className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none bg-white flex-1 text-slate-900"
            >"""

content = content.replace('''              value={newTemplateType}
              onChange={(e) => setNewTemplateType(e.target.value as any)}
              className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none bg-white flex-1"
            >''', replacement_select)

replacement_insert = """                <span className="text-[9px] text-slate-400 block leading-normal italic mt-1">
                  Use presets like `{"{{ORDER_ID}}"}` or `{"{{BUYER_NAME}}"}` for dynamic values.
                </span>
                {(selectedElement.type === 'text' || selectedElement.type === 'table' || selectedElement.type === 'barcode') && (
                  <select
                    onChange={(e) => {
                       const val = e.target.value;
                       if(val) {
                         updateElementProperty('content', (selectedElement.content || '') + (selectedElement.content ? ' ' : '') + val);
                         e.target.value = '';
                       }
                    }}
                    className="w-full mt-1 text-[10px] px-2 py-1 border border-slate-200 bg-slate-50 text-slate-900 rounded focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">+ Quick Insert Variable...</option>
                    {PLATFORM_PRESETS.filter(p => p.value).map((preset, idx) => (
                      <option key={idx} value={preset.value}>{preset.label}</option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Position and Dimensions Inputs */}"""

content = content.replace('''                <span className="text-[9px] text-slate-400 block leading-normal italic">
                  Use presets like `{"{{ORDER_ID}}"}` or `{"{{BUYER_NAME}}"}` for dynamic values.
                </span>
              </div>
            )}

            {/* Position and Dimensions Inputs */}''', replacement_insert)

with open('src/components/TemplateDesigner.tsx', 'w') as f:
    f.write(content)
