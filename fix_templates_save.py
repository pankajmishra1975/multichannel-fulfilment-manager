import re

with open('src/components/TemplateDesigner.tsx', 'r') as f:
    content = f.read()

# Fix addElement
content = content.replace("    setTemplates(updated);\n    setSelectedElementId(newElem.id);", "    setTemplates(updated);\n    saveTemplatesToBackend(updated);\n    setSelectedElementId(newElem.id);")

# Fix deleteElement
content = content.replace("    setTemplates(updated);\n    setSelectedElementId(null);", "    setTemplates(updated);\n    saveTemplatesToBackend(updated);\n    setSelectedElementId(null);")

# Handle resize/drag end save. The best way is to add saveTemplatesToBackend to handleGlobalPointerUp
replacement_up = """    const handleGlobalPointerUp = (e: PointerEvent) => {
      if (isDragging || isResizing) {
        setIsDragging(false);
        setIsResizing(false);
        setResizeDir(null);
        // Save to backend using the latest state of templates. Wait, handleGlobalPointerUp is in a useEffect that might have stale templates.
      }
    };"""

with open('src/components/TemplateDesigner.tsx', 'w') as f:
    f.write(content)
