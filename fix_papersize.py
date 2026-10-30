import re

with open("src/components/PrinterSettingsView.tsx", "r") as f:
    content = f.read()

content = content.replace("useState<'4x6' | '8.5x11' | 'A4' | 'ZPL'>('4x6')", "useState<string>('4x6')")

pattern = re.compile(
    r'(<select\s*value=\{paperSize\}\s*onChange=\{\(e\) => setPaperSize\(e.target.value as any\)\}\s*className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-800"\s*>).*?(</select>)',
    re.DOTALL
)

replacement = """\\1
                    <option value="4x6">100x150 (4x6) Labels</option>
                    <option value="A4_integrated">Integrated A4 Labels</option>
                    <option value="4x6_packslip">Packing Slip & Shipping Label (4x6 format)</option>
                    <option value="ZPL">Raw ZPL Datastream</option>
                    <option value="A4">Standard A4 Sheet</option>
                    <option value="8.5x11">Letter (8.5"x11")</option>
                  \\2"""

new_content = pattern.sub(replacement, content)

with open("src/components/PrinterSettingsView.tsx", "w") as f:
    f.write(new_content)
