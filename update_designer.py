import re

with open('src/components/TemplateDesigner.tsx', 'r') as f:
    content = f.read()

# Add new imports
if 'Upload' not in content:
    content = content.replace("Move,", "Move, Upload,")

# Add state variables
state_vars = """
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDir, setResizeDir] = useState<string | null>(null);
  const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0 });
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PLATFORM_PRESETS = [
    { label: '-- Select Preset to Insert --', value: '' },
    { label: 'Customer: Name', value: '{{CUSTOMER_NAME}}' },
    { label: 'Customer: Email', value: '{{CUSTOMER_EMAIL}}' },
    { label: 'Customer: Phone', value: '{{CUSTOMER_PHONE}}' },
    { label: 'Shipping: Address Line 1', value: '{{SHIPPING_ADDRESS_1}}' },
    { label: 'Shipping: Address Line 2', value: '{{SHIPPING_ADDRESS_2}}' },
    { label: 'Shipping: City', value: '{{SHIPPING_CITY}}' },
    { label: 'Shipping: State/Region', value: '{{SHIPPING_STATE}}' },
    { label: 'Shipping: Postcode', value: '{{SHIPPING_POSTCODE}}' },
    { label: 'Shipping: Country', value: '{{SHIPPING_COUNTRY}}' },
    { label: 'Billing: Address', value: '{{BILLING_ADDRESS}}' },
    { label: 'Product: Title', value: '{{PRODUCT_TITLE}}' },
    { label: 'Product: SKU', value: '{{PRODUCT_SKU}}' },
    { label: 'Product: Barcode', value: '{{PRODUCT_BARCODE}}' },
    { label: 'Product: Quantity', value: '{{PRODUCT_QUANTITY}}' },
    { label: 'Product: Price', value: '{{PRODUCT_PRICE}}' },
    { label: 'Product: Weight', value: '{{PRODUCT_WEIGHT}}' },
    { label: 'Product: Bin Location', value: '{{PRODUCT_BIN_LOCATION}}' },
    { label: 'Product: Image', value: '{{PRODUCT_IMAGE_URL}}' },
    { label: 'Order: ID', value: '{{ORDER_ID}}' },
    { label: 'Order: Date', value: '{{ORDER_DATE}}' },
    { label: 'Order: Total', value: '{{ORDER_TOTAL}}' },
    { label: 'Carrier: Name', value: '{{SHIPPING_CARRIER}}' },
    { label: 'Carrier: Service', value: '{{SHIPPING_SERVICE}}' },
    { label: 'Carrier: Tracking Number', value: '{{TRACKING_NUMBER}}' },
    { label: 'Carrier: Shipping Cost', value: '{{SHIPPING_COST}}' },
    { label: 'Misc: Delivery Instructions', value: '{{DELIVERY_INSTRUCTIONS}}' }
  ];

  const handlePresetSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val) {
      addElement('text', val);
      e.target.value = '';
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBackgroundImageUrl(url);
    }
  };
"""

content = re.sub(
    r'(const \[isDragging, setIsDragging\] = useState\(false\);)',
    r'\1' + state_vars,
    content
)

# Update addElement signature
content = content.replace(
    "const addElement = (type: Element['type']) => {",
    "const addElement = (type: Element['type'], presetContent?: string) => {"
)
content = content.replace(
    "content: type === 'text' \n         ? 'Double click to edit text'",
    "content: type === 'text' \n         ? (presetContent || 'Double click to edit text')"
)

# Update handlePointerDown to ignore resize handles
pointer_down_replacement = """
  // Handle resize down
  const handleResizeDown = (e: React.PointerEvent, elem: Element, dir: string) => {
    e.stopPropagation();
    setSelectedElementId(elem.id);
    setIsResizing(true);
    setResizeDir(dir);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setElemStartPos({ x: elem.x, y: elem.y });
    setResizeStartSize({ width: elem.width, height: elem.height });
    if (canvasRef.current) {
      canvasRef.current.setPointerCapture(e.pointerId);
    }
  };

  // Pointer down event to begin element drag repositioning
  const handlePointerDown = (e: React.PointerEvent, elem: Element) => {
    e.stopPropagation();
    if ((e.target as HTMLElement).classList.contains('resize-handle')) {
      return;
    }
    setSelectedElementId(elem.id);
    setIsDragging(true);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setElemStartPos({ x: elem.x, y: elem.y });
    if (canvasRef.current) {
      canvasRef.current.setPointerCapture(e.pointerId);
    }
  };
"""
content = re.sub(
    r'// Pointer down event to begin element drag repositioning\s*const handlePointerDown =.*?};',
    pointer_down_replacement,
    content,
    flags=re.DOTALL
)

# Update handlePointerMove to include resize logic
pointer_move_replacement = """
  // Handle pointer drag movement
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!selectedElementId || !canvasRef.current) return;
    
    if (isDragging) {
      const dx = e.clientX - dragStartPos.x;
      const dy = e.clientY - dragStartPos.y;
      const newX = Math.max(0, Math.min(activeTemplate.width - 20, elemStartPos.x + dx));
      const newY = Math.max(0, Math.min(activeTemplate.height - 10, elemStartPos.y + dy));
      
      updateElementProperty('x', Math.round(newX));
      updateElementProperty('y', Math.round(newY));
    } else if (isResizing && resizeDir) {
      const dx = e.clientX - dragStartPos.x;
      const dy = e.clientY - dragStartPos.y;
      
      let newWidth = resizeStartSize.width;
      let newHeight = resizeStartSize.height;
      
      if (resizeDir.includes('e')) newWidth = Math.max(10, resizeStartSize.width + dx);
      if (resizeDir.includes('s')) newHeight = Math.max(10, resizeStartSize.height + dy);
      
      updateElementProperty('width', Math.round(newWidth));
      updateElementProperty('height', Math.round(newHeight));
    }
  };
"""
content = re.sub(
    r'// Handle pointer drag movement\s*const handlePointerMove =.*?};',
    pointer_move_replacement,
    content,
    flags=re.DOTALL
)

# Update handlePointerUp
pointer_up_replacement = """
  // Release dragging capture
  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging || isResizing) {
      setIsDragging(false);
      setIsResizing(false);
      setResizeDir(null);
      if (canvasRef.current) {
        canvasRef.current.releasePointerCapture(e.pointerId);
      }
    }
  };
"""
content = re.sub(
    r'// Release dragging capture\s*const handlePointerUp =.*?};',
    pointer_up_replacement,
    content,
    flags=re.DOTALL
)

# Add presets dropdown and background image to Tool Elements Box
tool_elements_replacement = """
        {/* Toolbox / Add Elements */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <h4 className="text-[10px] uppercase font-black text-slate-700 tracking-wider flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-emerald-500" /> Tool Elements Box
          </h4>
          <p className="text-[10px] text-slate-400 leading-normal">
            Click to insert custom modules. Drag and place them anywhere on the right stage.
          </p>

          <div className="space-y-2">
            <select
              onChange={handlePresetSelect}
              className="w-full text-xs px-2.5 py-1.5 border border-indigo-200 bg-indigo-50/50 text-indigo-700 font-bold rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {PLATFORM_PRESETS.map((preset, idx) => (
                <option key={idx} value={preset.value}>{preset.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => addElement('text')}
              className="py-2 px-2.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-600 font-bold text-xs rounded-lg border border-slate-200 inline-flex items-center justify-center gap-1.5 transition-all"
            >
              <Type className="w-3.5 h-3.5" /> Text Block
            </button>
            <button
              onClick={() => addElement('barcode')}
              className="py-2 px-2.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-600 font-bold text-xs rounded-lg border border-slate-200 inline-flex items-center justify-center gap-1.5 transition-all"
            >
              <QrCode className="w-3.5 h-3.5" /> Barcode/QR
            </button>
            <button
              onClick={() => addElement('image')}
              className="py-2 px-2.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-600 font-bold text-xs rounded-lg border border-slate-200 inline-flex items-center justify-center gap-1.5 transition-all"
            >
              <ImageIcon className="w-3.5 h-3.5" /> Image Logo
            </button>
            <button
              onClick={() => addElement('line')}
              className="py-2 px-2.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-600 font-bold text-xs rounded-lg border border-slate-200 inline-flex items-center justify-center gap-1.5 transition-all"
            >
              <Minus className="w-3.5 h-3.5" /> Divider Line
            </button>
            <button
              onClick={() => addElement('table')}
              className="py-2 px-2.5 col-span-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-600 font-bold text-xs rounded-lg border border-slate-200 inline-flex items-center justify-center gap-1.5 transition-all"
            >
              <Table className="w-3.5 h-3.5" /> Dynamic Item Table Grid
            </button>
          </div>
        </div>
"""
content = re.sub(
    r'\{\/\* Toolbox \/ Add Elements \*\/.*?<\/div>\s*<\/div>\s*\{\/\* Selected Element Properties Inspector \*\/\}',
    tool_elements_replacement + '\n        {/* Selected Element Properties Inspector */}',
    content,
    flags=re.DOTALL
)

# Add Top Control Bar changes (Upload background image button)
top_control_bar_replacement = """
        {/* Top Control Bar */}
        <div className="w-full bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
              Active Stage: {activeTemplate.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*" 
              className="hidden" 
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black px-4 py-2 rounded-lg inline-flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" /> Background Ref
            </button>
            {backgroundImageUrl && (
              <button
                onClick={() => setBackgroundImageUrl(null)}
                className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-black px-4 py-2 rounded-lg inline-flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear BG
              </button>
            )}
"""
content = re.sub(
    r'\{\/\* Top Control Bar \*\/.*?(<div className="flex items-center gap-2">\s*\{saveSuccess)',
    top_control_bar_replacement + r'\1',
    content,
    flags=re.DOTALL
)

# Update canvas element background
canvas_style_replacement = """
            style={{ 
              width: `${activeTemplate.width}px`, 
              height: `${activeTemplate.height}px`,
              backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : undefined,
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
"""
content = re.sub(
    r'style=\{\{\s*width: `\$\{activeTemplate.width\}px`,\s*height: `\$\{activeTemplate.height\}px`\s*\}\}',
    canvas_style_replacement,
    content,
    flags=re.DOTALL
)

# Add resize handles rendering
resize_handles = """
                  {/* Small label tags */}
                  {isSelected && (
                    <span className="absolute -top-4.5 left-0 bg-indigo-600 text-white font-mono text-[8.5px] px-1 py-0.2 rounded font-black uppercase tracking-wider shadow-sm flex items-center gap-0.5 z-30 pointer-events-none">
                      <Move className="w-2.5 h-2.5" /> {elem.type}
                    </span>
                  )}
                  
                  {/* Resize Handles */}
                  {isSelected && (
                    <>
                      <div 
                        onPointerDown={(e) => handleResizeDown(e, elem, 'e')}
                        className="resize-handle absolute top-1/2 -right-1.5 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full cursor-e-resize transform -translate-y-1/2 z-40" 
                      />
                      <div 
                        onPointerDown={(e) => handleResizeDown(e, elem, 's')}
                        className="resize-handle absolute -bottom-1.5 left-1/2 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full cursor-s-resize transform -translate-x-1/2 z-40" 
                      />
                      <div 
                        onPointerDown={(e) => handleResizeDown(e, elem, 'se')}
                        className="resize-handle absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full cursor-se-resize z-40" 
                      />
                    </>
                  )}
"""

content = re.sub(
    r'\{\/\* Small label tags \*\/\}\s*\{isSelected && \(\s*<span className="absolute -top-4\.5 left-0 bg-indigo-600 text-white font-mono text-\[8\.5px\] px-1 py-0\.2 rounded font-black uppercase tracking-wider shadow-sm flex items-center gap-0\.5 z-30">\s*<Move className="w-2\.5 h-2\.5" \/> \{elem\.type\}\s*<\/span>\s*\)\}',
    resize_handles,
    content,
    flags=re.DOTALL
)

with open('src/components/TemplateDesigner.tsx', 'w') as f:
    f.write(content)

