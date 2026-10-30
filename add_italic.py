with open('src/components/TemplateDesigner.tsx', 'r') as f:
    content = f.read()

italic_ui = """                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500">Style</label>
                  <select
                    value={selectedElement.fontStyle || 'normal'}
                    onChange={(e) => updateElementProperty('fontStyle', e.target.value)}
                    className="w-full px-2 py-1 border border-slate-200 rounded-md bg-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="italic">Italic</option>
                  </select>
                </div>"""

# insert it before the closing tag of the grid
content = content.replace(
    '                  </select>\n                </div>\n              </div>\n            )}',
    '                  </select>\n                </div>\n' + italic_ui + '\n              </div>\n            )}'
)

# And add the italic rendering to the style object
render_style_orig = """                      style={{ 
                        fontSize: `${elem.fontSize || 12}px`, 
                        fontWeight: elem.fontWeight === 'bold' ? 700 : elem.fontWeight === 'black' ? 900 : 400,
                        textAlign: elem.align || 'left',
                        whiteSpace: 'pre-wrap'
                      }}"""

render_style_new = """                      style={{ 
                        fontSize: `${elem.fontSize || 12}px`, 
                        fontWeight: elem.fontWeight === 'bold' ? 700 : elem.fontWeight === 'black' ? 900 : 400,
                        fontStyle: elem.fontStyle === 'italic' ? 'italic' : 'normal',
                        textAlign: elem.align || 'left',
                        whiteSpace: 'pre-wrap'
                      }}"""

content = content.replace(render_style_orig, render_style_new)

with open('src/components/TemplateDesigner.tsx', 'w') as f:
    f.write(content)

