import re

with open('src/components/OrdersList.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'o.shippingAddress.city.toLowerCase().includes(searchTerm.toLowerCase())',
    '(o.shippingAddress.city || "").toLowerCase().includes(searchTerm.toLowerCase())'
)

content = content.replace(
    'o.items.some(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()))',
    'o.items.some(item => (item.title || "").toLowerCase().includes(searchTerm.toLowerCase()))'
)

content = content.replace(
    'o.shippingAddress.postalCode.toLowerCase().trim() !== first.shippingAddress.postalCode.toLowerCase().trim()',
    '(o.shippingAddress.postalCode || "").toLowerCase().trim() !== (first.shippingAddress.postalCode || "").toLowerCase().trim()'
)

with open('src/components/OrdersList.tsx', 'w') as f:
    f.write(content)

