import re

with open('src/components/OrdersList.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'first.shippingAddress.addressLine1.toLowerCase().trim()',
    '(first.shippingAddress.addressLine1 || "").toLowerCase().trim()'
)

with open('src/components/OrdersList.tsx', 'w') as f:
    f.write(content)

