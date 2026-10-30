with open('src/components/TemplateDesigner.tsx', 'r') as f:
    content = f.read()
import re
content = re.sub(r'\}\)\}<div className="flex items-center gap-2">\s*', ')}\n            ', content)
with open('src/components/TemplateDesigner.tsx', 'w') as f:
    f.write(content)
