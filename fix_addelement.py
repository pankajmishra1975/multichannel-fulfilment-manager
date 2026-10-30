with open('src/components/TemplateDesigner.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "const addElement = (type: 'text' | 'image' | 'barcode' | 'line' | 'table') => {",
    "const addElement = (type: 'text' | 'image' | 'barcode' | 'line' | 'table', initialContent?: string) => {"
)
content = content.replace(
    "      content: type === 'text'",
    "      content: initialContent || (type === 'text' ?"
)
content = content.replace(
    "            : type === 'table'\n              ? 'Item Name | SKU | Qty | Price\\n{{ITEM_NAME}} | {{ITEM_SKU}} | {{ITEM_QTY}} | {{ITEM_PRICE}}'\n              : ''",
    "            : type === 'table'\n              ? 'Item Name | SKU | Qty | Price\\n{{ITEM_NAME}} | {{ITEM_SKU}} | {{ITEM_QTY}} | {{ITEM_PRICE}}'\n              : '')"
)
with open('src/components/TemplateDesigner.tsx', 'w') as f:
    f.write(content)
