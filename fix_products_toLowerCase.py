import re

with open('src/components/ProductsManager.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'listing.channelSku.toLowerCase()',
    '(listing.channelSku || "").toLowerCase()'
)

content = content.replace(
    'p.sku.toLowerCase()',
    '(p.sku || "").toLowerCase()'
)

content = content.replace(
    'listing.title.toLowerCase()',
    '(listing.title || "").toLowerCase()'
)

content = content.replace(
    'p.name.toLowerCase()',
    '(p.name || "").toLowerCase()'
)

content = content.replace(
    'm.channelSku.toLowerCase()',
    '(m.channelSku || "").toLowerCase()'
)

content = content.replace(
    'm.warehouseSku.toLowerCase()',
    '(m.warehouseSku || "").toLowerCase()'
)

with open('src/components/ProductsManager.tsx', 'w') as f:
    f.write(content)

