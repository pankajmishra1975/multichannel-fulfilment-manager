import re

with open('src/components/ProductsManager.tsx', 'r') as f:
    content = f.read()

replacement_ui = """                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Stock Level</label>"""

# Replace the part correctly
content = content.replace('''                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Stock Level</label>''',
"""                        <div className="pt-2 border-t border-slate-200 mt-2 mb-2">
                          <label className="text-[10px] font-bold text-slate-400 block mb-1">Product Images (Max 12)</label>
                          <div className="flex flex-wrap gap-2">
                            {editForm.images.map((img, idx) => (
                              <div key={idx} className="w-10 h-10 border border-slate-200 rounded relative overflow-hidden shrink-0 group">
                                 <img src={img} className="w-full h-full object-cover" />
                                 <button onClick={() => setEditForm({...editForm, images: editForm.images.filter((_, i) => i !== idx)})} className="absolute top-0 right-0 bg-white shadow rounded-bl p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-2.5 h-2.5 text-red-500"/></button>
                              </div>
                            ))}
                            {editForm.images.length < 12 && (
                              <label className="w-10 h-10 border-2 border-dashed border-slate-300 rounded flex flex-col items-center justify-center text-slate-400 hover:border-emerald-500 hover:text-emerald-600 transition-colors cursor-pointer bg-slate-50 shrink-0">
                                <Upload className="w-3.5 h-3.5" />
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*,video/*"
                                  multiple
                                  onChange={handleEditMediaUpload}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Stock Level</label>""")

with open('src/components/ProductsManager.tsx', 'w') as f:
    f.write(content)
