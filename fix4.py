with open('src/components/TemplateDesigner.tsx', 'r') as f:
    content = f.read()
import re
content = re.sub(r'\}\)\n<div className="flex items-center gap-2">\n            \{saveSuccess && \(', r'})}\n          </div>\n          <div className="flex items-center gap-2">\n            {saveSuccess && (', content)
with open('src/components/TemplateDesigner.tsx', 'w') as f:
    f.write(content)
