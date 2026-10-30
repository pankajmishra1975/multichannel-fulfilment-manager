import re

with open('src/components/TemplateDesigner.tsx', 'r') as f:
    content = f.read()

replacement = """  const triggerExport = () => {
    saveTemplatesToBackend(templates);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };"""

content = re.sub(r'  const triggerExport = \(\) => \{\n    setSaveSuccess\(true\);\n  \};', replacement, content)

with open('src/components/TemplateDesigner.tsx', 'w') as f:
    f.write(content)
