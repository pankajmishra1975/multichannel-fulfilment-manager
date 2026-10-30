import re

with open('src/components/PrintStatusModal.tsx', 'r') as f:
    content = f.read()

replacement_state = """  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [templates, setTemplates] = React.useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = React.useState<string>('shipping_label_4x6');

  React.useEffect(() => {
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => {
        if(data && data.length > 0) {
          setTemplates(data);
          setSelectedTemplate(data[0].id);
        }
      })
      .catch(err => console.error(err));
  }, []);"""

content = content.replace("  const [copiedId, setCopiedId] = React.useState<string | null>(null);", replacement_state)

replacement_print_btn = """        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-xs font-bold text-slate-700">Label Format:</span>
            <select 
              value={selectedTemplate} 
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="text-xs border-slate-300 rounded px-2 py-1 bg-white text-slate-900"
            >
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
              {templates.length === 0 && <option value="shipping_label_4x6">Standard 4x6 Label</option>}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
            >
              Close
            </button>
            <button
              onClick={() => {
                onOpenSpool();
                onClose();
              }}
              className="px-6 py-2.5 text-sm font-black text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Send to Printer Spool
            </button>
          </div>
        </div>"""

content = re.sub(r'        <div className="flex justify-end gap-3">.*?Send to Printer Spool\n            </button>\n          </div>', replacement_print_btn, content, flags=re.DOTALL)

with open('src/components/PrintStatusModal.tsx', 'w') as f:
    f.write(content)
