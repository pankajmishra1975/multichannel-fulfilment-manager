import re

with open('src/components/TemplateDesigner.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "updateTemplate(activeTemplate.id, { backgroundImage: base64String });",
    "setTemplates(prev => prev.map(t => t.id === activeTemplate.id ? { ...t, backgroundImage: base64String } : t));"
)

content = content.replace(
    "updateTemplate(activeTemplate.id, { backgroundImage: undefined })",
    "setTemplates(prev => prev.map(t => t.id === activeTemplate.id ? { ...t, backgroundImage: undefined } : t))"
)

with open('src/components/TemplateDesigner.tsx', 'w') as f:
    f.write(content)
