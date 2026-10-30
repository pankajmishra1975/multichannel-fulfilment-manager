import re

with open('src/components/TemplateDesigner.tsx', 'r') as f:
    content = f.read()

# 1. Update Template interface
content = content.replace(
    "  elements: Element[];\n}",
    "  elements: Element[];\n  backgroundImage?: string;\n}"
)

# 2. Update handleFileUpload
new_handle_upload = """  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (activeTemplate) {
          updateTemplate(activeTemplate.id, { backgroundImage: base64String });
        }
      };
      reader.readAsDataURL(file);
    }
  };"""

content = re.sub(
    r"  const handleFileUpload = \(e: React\.ChangeEvent<HTMLInputElement>\) => \{.*?^\s*\};" ,
    new_handle_upload,
    content,
    flags=re.DOTALL | re.MULTILINE
)

# 3. Use activeTemplate.backgroundImage instead of backgroundImageUrl
content = content.replace(
    "backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : undefined,",
    "backgroundImage: activeTemplate.backgroundImage ? `url(${activeTemplate.backgroundImage})` : undefined,"
)

# 4. Remove backgroundImageUrl state and usage
content = re.sub(r"  const \[backgroundImageUrl, setBackgroundImageUrl\] = useState<string \| null>\(null\);\n", "", content)

content = content.replace(
    "{backgroundImageUrl && (",
    "{activeTemplate.backgroundImage && ("
)
content = content.replace(
    "onClick={() => setBackgroundImageUrl(null)}",
    "onClick={() => updateTemplate(activeTemplate.id, { backgroundImage: undefined })}"
)

with open('src/components/TemplateDesigner.tsx', 'w') as f:
    f.write(content)
