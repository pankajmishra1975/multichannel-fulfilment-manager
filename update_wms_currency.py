import re

with open('src/components/WmsView.tsx', 'r') as f:
    content = f.read()

content = re.sub(
    r'interface WmsViewProps \{',
    'interface WmsViewProps {\n  currency?: string;\n  unitSystem?: string;',
    content
)

content = re.sub(
    r'export default function WmsView\(\{ products, onRefreshProducts, onRefreshLogs \}: WmsViewProps\) \{',
    'export default function WmsView({ products, onRefreshProducts, onRefreshLogs, currency = "USD", unitSystem = "imperial" }: WmsViewProps) {\n  const currencySymbol = currency === "GBP" ? "£" : currency === "EUR" ? "€" : "$";',
    content
)

content = content.replace('Unit Cost ($)', 'Unit Cost ({currencySymbol})')

with open('src/components/WmsView.tsx', 'w') as f:
    f.write(content)


with open('src/components/ProductsManager.tsx', 'r') as f:
    content = f.read()

content = content.replace('Cost ($)', 'Cost ({currencySymbol})')
content = content.replace('Retail Selling ($)', 'Retail Selling ({currencySymbol})')
content = content.replace('Retail Selling MSRP ($)', 'Retail Selling MSRP ({currencySymbol})')
content = content.replace('Wholesale Cost ($)', 'Wholesale Cost ({currencySymbol})')

content = re.sub(r'<span className="absolute left-3 top-2 text-slate-400 font-bold">\$</span>', '<span className="absolute left-3 top-2 text-slate-400 font-bold">{currencySymbol}</span>', content)
content = re.sub(r'Expedited Shipping \(\$5\.00\)', 'Expedited Shipping ({currencySymbol}5.00)', content)

with open('src/components/ProductsManager.tsx', 'w') as f:
    f.write(content)
