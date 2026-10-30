import re

with open('src/components/TemplateDesigner.tsx', 'r') as f:
    content = f.read()

# We need to change the pointer move/up logic. 
# We'll put them in a useEffect.

# First, remove onPointerMove and onPointerUp from the canvas div.
content = content.replace('            onPointerMove={handlePointerMove}\n            onPointerUp={handlePointerUp}\n', '')

# Then we create a useEffect for it.
use_effect = """
  // Global pointer events for drag and resize
  useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      if (!isDragging && !isResizing) return;
      if (!selectedElementId) return;

      if (isDragging) {
        const dx = e.clientX - dragStartPos.x;
        const dy = e.clientY - dragStartPos.y;
        const newX = Math.max(0, Math.min(activeTemplate.width - 20, elemStartPos.x + dx));
        const newY = Math.max(0, Math.min(activeTemplate.height - 10, elemStartPos.y + dy));

        updateElementProperties({
          x: Math.round(newX),
          y: Math.round(newY)
        });
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
          if (newWidth > 10) {
            newX = elemStartPos.x + dx;
          } else {
            newX = elemStartPos.x + resizeStartSize.width - 10;
          }
        }
        if (resizeDir.includes('s')) {
          newHeight = Math.max(10, resizeStartSize.height + dy);
        }
        if (resizeDir.includes('n')) {
          newHeight = Math.max(10, resizeStartSize.height - dy);
          if (newHeight > 10) {
            newY = elemStartPos.y + dy;
          } else {
            newY = elemStartPos.y + resizeStartSize.height - 10;
          }
        }

        updateElementProperties({
          width: Math.round(newWidth),
          height: Math.round(newHeight),
          x: Math.round(newX),
          y: Math.round(newY)
        });
      }
    };

    const handleGlobalPointerUp = (e: PointerEvent) => {
      if (isDragging || isResizing) {
        setIsDragging(false);
        setIsResizing(false);
        setResizeDir(null);
      }
    };

    if (isDragging || isResizing) {
      window.addEventListener('pointermove', handleGlobalPointerMove);
      window.addEventListener('pointerup', handleGlobalPointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
    };
  }, [isDragging, isResizing, dragStartPos, elemStartPos, resizeStartSize, resizeDir, selectedElementId, activeTemplate.width, activeTemplate.height]);
"""

# Find where to insert it. Let's insert it before the original handlePointerMove
content = re.sub(
    r'  // Handle pointer drag movement\n  const handlePointerMove = \(e: React.PointerEvent\) => \{.*?\n  \};\n\n\n  // Release dragging capture\n  const handlePointerUp = \(e: React.PointerEvent\) => \{.*?\n  \};',
    use_effect.strip(),
    content,
    flags=re.DOTALL
)

with open('src/components/TemplateDesigner.tsx', 'w') as f:
    f.write(content)
