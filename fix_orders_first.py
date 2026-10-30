import re

with open('src/components/OrdersList.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'first.buyerName.toLowerCase()',
    '(first.buyerName || "").toLowerCase()'
)

with open('src/components/OrdersList.tsx', 'w') as f:
    f.write(content)

