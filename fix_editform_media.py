import re

with open('src/components/ProductsManager.tsx', 'r') as f:
    content = f.read()

replacement_upload_func = """  const handleEditMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setEditForm(prev => {
               if (prev.images.length >= 12) return prev;
               return { ...prev, images: [...prev.images, event.target!.result as string] };
            });
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const saveEdit = async (sku: string) => {"""

content = content.replace("  const saveEdit = async (sku: string) => {", replacement_upload_func)

replacement_ui = """                        </div>
                        <div className="pt-2 border-t border-slate-200 mt-2">
                          <label className="text-[10px] font-bold text-slate-400 block mb-1">Product Images (Max 12)</label>
                          <div className="flex flex-wrap gap-2">
                            {editForm.images.map((img, idx) => (
                              <div key={idx} className="w-12 h-12 border border-slate-200 rounded relative overflow-hidden shrink-0 group">
                                 <img src={img} className="w-full h-full object-cover" />
                                 <button onClick={() => setEditForm({...editForm, images: editForm.images.filter((_, i) => i !== idx)})} className="absolute top-0.5 right-0.5 bg-white shadow rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3 text-red-500"/></button>
                              </div>
                            ))}
                            {editForm.images.length < 12 && (
                              <label className="w-12 h-12 border-2 border-dashed border-slate-300 rounded flex flex-col items-center justify-center text-slate-400 hover:border-emerald-500 hover:text-emerald-600 transition-colors cursor-pointer bg-slate-50 shrink-0">
                                <Upload className="w-4 h-4" />
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
                        </div>"""

content = content.replace('''                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Stock Level</label>''',
'''                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Stock Level</label>'''
)

# wait I need to place it in the correct place
with open('src/components/ProductsManager.tsx', 'w') as f:
    f.write(content)
