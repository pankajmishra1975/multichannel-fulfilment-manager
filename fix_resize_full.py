with open('src/components/TemplateDesigner.tsx', 'r') as f:
    content = f.read()

import re

# Update handlePointerMove
pointer_move_replacement = """  // Handle pointer drag movement
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
      let newX = elemStartPos.x;
      let newY = elemStartPos.y;
      
      if (resizeDir.includes('e')) {
        newWidth = Math.max(10, resizeStartSize.width + dx);
      }
      if (resizeDir.includes('w')) {
        newWidth = Math.max(10, resizeStartSize.width - dx);
        if (newWidth > 10) newX = elemStartPos.x + dx;
      }
      if (resizeDir.includes('s')) {
        newHeight = Math.max(10, resizeStartSize.height + dy);
      }
      if (resizeDir.includes('n')) {
        newHeight = Math.max(10, resizeStartSize.height - dy);
        if (newHeight > 10) newY = elemStartPos.y + dy;
      }

      updateElementProperty('width', Math.round(newWidth));
      updateElementProperty('height', Math.round(newHeight));
      updateElementProperty('x', Math.round(newX));
      updateElementProperty('y', Math.round(newY));
    }
  };"""

content = re.sub(
    r'  // Handle pointer drag movement\n  const handlePointerMove = \(e: React\.PointerEvent\) => \{.*?\n  \};\n',
    pointer_move_replacement + '\n',
    content,
    flags=re.DOTALL
)

handles_replacement = """                  {/* Resize Handles */}
                  {isSelected && (
                    <>
                      <div 
                        onPointerDown={(e) => handleResizeDown(e, elem, 'nw')}
                        className="resize-handle absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full cursor-nw-resize z-40" 
                      />
                      <div 
                        onPointerDown={(e) => handleResizeDown(e, elem, 'n')}
                        className="resize-handle absolute -top-1.5 left-1/2 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full cursor-n-resize transform -translate-x-1/2 z-40" 
                      />
                      <div 
                        onPointerDown={(e) => handleResizeDown(e, elem, 'ne')}
                        className="resize-handle absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full cursor-ne-resize z-40" 
                      />
                      <div 
                        onPointerDown={(e) => handleResizeDown(e, elem, 'w')}
                        className="resize-handle absolute top-1/2 -left-1.5 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full cursor-w-resize transform -translate-y-1/2 z-40" 
                      />
                      <div 
                        onPointerDown={(e) => handleResizeDown(e, elem, 'e')}
                        className="resize-handle absolute top-1/2 -right-1.5 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full cursor-e-resize transform -translate-y-1/2 z-40" 
                      />
                      <div 
                        onPointerDown={(e) => handleResizeDown(e, elem, 'sw')}
                        className="resize-handle absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full cursor-sw-resize z-40" 
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
                  )}"""

content = re.sub(
    r'                  \{\/\* Resize Handles \*\/\}\n                  \{isSelected && \(\n                    <>\n                      <div \n                        onPointerDown=\{\(e\) => handleResizeDown\(e, elem, \'e\'\)\}\n                        className="resize-handle absolute top-1\/2 -right-1\.5 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full cursor-e-resize transform -translate-y-1\/2 z-40" \n                      \/>\n                      <div \n                        onPointerDown=\{\(e\) => handleResizeDown\(e, elem, \'s\'\)\}\n                        className="resize-handle absolute -bottom-1\.5 left-1\/2 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full cursor-s-resize transform -translate-x-1\/2 z-40" \n                      \/>\n                      <div \n                        onPointerDown=\{\(e\) => handleResizeDown\(e, elem, \'se\'\)\}\n                        className="resize-handle absolute -bottom-1\.5 -right-1\.5 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full cursor-se-resize z-40" \n                      \/>\n                    <\/>\n                  \)\}',
    handles_replacement,
    content
)

with open('src/components/TemplateDesigner.tsx', 'w') as f:
    f.write(content)
