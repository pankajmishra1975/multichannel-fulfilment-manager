with open('src/components/TemplateDesigner.tsx', 'r') as f:
    content = f.read()

target = '            )}\n<div className="flex items-center gap-2">'
replacement = '            )}\n          </div>\n          <div className="flex items-center gap-2">'
content = content.replace(target, replacement)

with open('src/components/TemplateDesigner.tsx', 'w') as f:
    f.write(content)
