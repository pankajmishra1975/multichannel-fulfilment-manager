import re

with open('src/components/ProductsManager.tsx', 'r') as f:
    content = f.read()

replacement = """  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setAddForm(prev => {
               if (prev.images.length >= 12) return prev;
               return { ...prev, images: [...prev.images, event.target!.result as string] };
            });
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };"""

content = content.replace('''  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAddForm({ ...addForm, image: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };''', replacement)


replacement_ui = """              {/* Media Upload Mock */}
              <div className="md:col-span-4 border-t border-slate-100 pt-3 mt-1">
                <label className="block text-slate-500 font-bold mb-2">Product Media (Images & Videos) - Max 12</label>
                <div className="flex flex-wrap gap-3">
                  {addForm.images.map((img, idx) => (
                    <div key={idx} className="w-20 h-20 border border-slate-200 rounded-xl relative overflow-hidden shrink-0 group">
                       <img src={img} className="w-full h-full object-cover" />
                       <button onClick={() => setAddForm({...addForm, images: addForm.images.filter((_, i) => i !== idx)})} className="absolute top-1 right-1 bg-white shadow rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3 text-red-500"/></button>
                       {idx === 0 && <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] text-center font-bold py-0.5">MAIN</span>}
                    </div>
                  ))}
                  {addForm.images.length < 12 && (
                    <div 
                      className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-emerald-500 hover:text-emerald-600 transition-colors cursor-pointer bg-slate-50 relative overflow-hidden shrink-0"
                      onClick={() => mediaInputRef.current?.click()}
                    >
                      <Upload className="w-5 h-5 mb-1" />
                      <span className="text-[9px] font-bold text-center leading-tight">Upload<br/>Media</span>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={mediaInputRef}
                    className="hidden"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleMediaUpload}
                  />
                </div>
              </div>"""

content = content.replace('''              {/* Media Upload Mock */}
              <div className="md:col-span-4 border-t border-slate-100 pt-3 mt-1">
                <label className="block text-slate-500 font-bold mb-2">Product Media (Images & Videos)</label>
                <div className="flex gap-3">
                  <div 
                    className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-emerald-500 hover:text-emerald-600 transition-colors cursor-pointer bg-slate-50 relative overflow-hidden"
                    onClick={() => mediaInputRef.current?.click()}
                  >
                    {addForm.image ? (
                      <img src={addForm.image} alt="Upload preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Upload className="w-5 h-5 mb-1" />
                        <span className="text-[9px] font-bold text-center leading-tight">Upload<br/>Media</span>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={mediaInputRef}
                    className="hidden"
                    accept="image/*,video/*"
                    onChange={handleMediaUpload}
                  />
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs italic">
                    Images & Videos will appear here. Unlimited uploads supported.
                  </div>
                </div>
              </div>''', replacement_ui)

with open('src/components/ProductsManager.tsx', 'w') as f:
    f.write(content)
