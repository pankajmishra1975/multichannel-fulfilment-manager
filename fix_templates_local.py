import re

with open('src/components/TemplateDesigner.tsx', 'r') as f:
    content = f.read()

replacement = """  useEffect(() => {
    const localTemplates = localStorage.getItem('appTemplates');
    if (localTemplates) {
      try {
        const parsed = JSON.parse(localTemplates);
        if (parsed && parsed.length > 0) {
          setTemplates(parsed);
          setActiveTemplateId(parsed[0].id);
          return;
        }
      } catch (e) {}
    }
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => {
        if(data && data.length > 0) {
          setTemplates(data);
          setActiveTemplateId(data[0].id);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const saveTemplatesToBackend = async (updatedTemplates: Template[]) => {
    try {
      localStorage.setItem('appTemplates', JSON.stringify(updatedTemplates));
      await fetch('/api/templates', {"""

content = re.sub(r'  useEffect\(\(\) => \{\n    fetch\(\'/api/templates\'\)\n      \.then\(res => res\.json\(\)\)\n      \.then\(data => \{\n        if\(data && data\.length > 0\) \{\n          setTemplates\(data\);\n          setActiveTemplateId\(data\[0\]\.id\);\n        \}\n      \}\)\n      \.catch\(err => console\.error\(err\)\);\n  \}, \[\]\);\n\n  const saveTemplatesToBackend = async \(updatedTemplates: Template\[\]\) => \{\n    try \{\n      await fetch\(\'/api/templates\', \{', replacement, content)

with open('src/components/TemplateDesigner.tsx', 'w') as f:
    f.write(content)
