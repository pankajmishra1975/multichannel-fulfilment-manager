import re

with open('src/components/TemplateDesigner.tsx', 'r') as f:
    content = f.read()

replacement_add = """  const addElement = (type: Element['type'], customContent?: string) => {
    const newTemplates = templates.map(t => {
      if (t.id === activeTemplateId) {
        return {
          ...t,
          elements: [
            ...t.elements,
            {
              id: Date.now().toString(),
              type,
              x: 50,
              y: 50,
              width: type === 'line' ? t.width - 100 : 150,
              height: type === 'line' ? 2 : type === 'barcode' ? 60 : type === 'image' ? 100 : 40,
              content: customContent || (type === 'text' 
                ? 'Double click to edit text' 
                : type === 'image' 
                  ? 'https://ais-dev-g4tqmemrqwpf3n6lcv2stb-348050727922.europe-west2.run.app/src/assets/images/amazon_auth_flow_1783082164631.jpg'
                  : type === 'barcode'
                    ? '{{ORDER_ID}}'
                    : type === 'table'
                      ? 'SKU | Description | Bin | Qty\\nItem-1 | Sample Item | Rack-A1 | 2'
                      : ''),
              fontSize: type === 'text' ? 12 : undefined,
              fontWeight: type === 'text' ? 'normal' : undefined,
              align: type === 'text' ? 'left' : undefined,
            }
          ]
        };
      }
      return t;
    });
    setTemplates(newTemplates);
    saveTemplatesToBackend(newTemplates);
  };

  const deleteElement = () => {
    if (!selectedElementId) return;
    const newTemplates = templates.map(t => {
      if (t.id === activeTemplateId) {
        return {
          ...t,
          elements: t.elements.filter(el => el.id !== selectedElementId)
        };
      }
      return t;
    });
    setTemplates(newTemplates);
    saveTemplatesToBackend(newTemplates);
    setSelectedElementId(null);
  };"""

content = re.sub(r'  const addElement = \(type: Element\[\'type\'\], customContent\?: string\) => \{.*?const deleteElement = \(\) => \{.*?\n  \};', replacement_add, content, flags=re.DOTALL)

with open('src/components/TemplateDesigner.tsx', 'w') as f:
    f.write(content)

