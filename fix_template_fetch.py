import re

with open('src/components/TemplateDesigner.tsx', 'r') as f:
    content = f.read()

replacement = """export default function TemplateDesigner() {
  const [templates, setTemplates] = useState<Template[]>(PRESET_TEMPLATES);
  const [activeTemplateId, setActiveTemplateId] = useState<string>('shipping_label_4x6');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  
  useEffect(() => {
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
      await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTemplates)
      });
    } catch(err) {
      console.error('Failed to save templates', err);
    }
  };"""

content = content.replace("export default function TemplateDesigner() {\n  const [templates, setTemplates] = useState<Template[]>(PRESET_TEMPLATES);\n  const [activeTemplateId, setActiveTemplateId] = useState<string>('shipping_label_4x6');\n  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);", replacement)


# Replace createTemplate to save to backend
replacement_create = """  const createTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return;

    const dimensions = newTemplateType === 'label' 
      ? { width: 400, height: 600 } 
      : { width: 595, height: 842 }; // A4 portrait size

    const newTemp: Template = {
      id: `custom_${Date.now()}`,
      name: newTemplateName,
      type: newTemplateType,
      width: dimensions.width,
      height: dimensions.height,
      elements: [
        { id: 'initial_txt', type: 'text', x: 20, y: 40, width: dimensions.width - 40, height: 45, content: newTemplateName, fontSize: 18, fontWeight: 'bold', align: 'center' }
      ]
    };

    const newTemplates = [...templates, newTemp];
    setTemplates(newTemplates);
    saveTemplatesToBackend(newTemplates);
    setActiveTemplateId(newTemp.id);
    setSelectedElementId('initial_txt');
    setNewTemplateName('');
  };"""

content = re.sub(r'  const createTemplate = \(e: React.FormEvent\) => \{.*?setNewTemplateName\(\'\'\);\n  \};', replacement_create, content, flags=re.DOTALL)


# Also add a general save button for the template designer or save on edit?
# Wait, let's just make it auto save when an element changes.
replacement_update_element = """  const updateElementProperty = (key: keyof Element, value: any) => {
    if (!selectedElementId) return;
    const newTemplates = templates.map(t => {
      if (t.id === activeTemplateId) {
        return {
          ...t,
          elements: t.elements.map(el => el.id === selectedElementId ? { ...el, [key]: value } : el)
        };
      }
      return t;
    });
    setTemplates(newTemplates);
    saveTemplatesToBackend(newTemplates);
  };"""

content = re.sub(r'  const updateElementProperty = \(key: keyof Element, value: any\) => \{.*?setTemplates.*?;\n  \};', replacement_update_element, content, flags=re.DOTALL)

with open('src/components/TemplateDesigner.tsx', 'w') as f:
    f.write(content)

