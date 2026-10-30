with open('src/components/TemplateDesigner.tsx', 'r') as f:
    content = f.read()

content = content.replace("?         ? 'Double click to edit text'", "? 'Double click to edit text'")
content = content.replace("              : '',", "              : ''),")

with open('src/components/TemplateDesigner.tsx', 'w') as f:
    f.write(content)
