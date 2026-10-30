with open('src/components/TemplateDesigner.tsx', 'r') as f:
    content = f.read()

import re
content = re.sub(
    r"content: initialContent \|\| \(type === 'text' \? \s*\? 'Double click to edit text'",
    r"content: initialContent || (type === 'text' ? 'Double click to edit text'",
    content
)

with open('src/components/TemplateDesigner.tsx', 'w') as f:
    f.write(content)
