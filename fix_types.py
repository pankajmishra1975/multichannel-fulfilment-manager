with open('src/types.ts', 'r') as f:
    content = f.read()

content = content.replace(
    'buyingPrice: number;\n  sellingPrice: number;\n  vatType: \'VAT\' | \'Non VAT\';\n  image?: string;',
    'buyingPrice: number;\n  sellingPrice: number;\n  vatType: \'VAT\' | \'Non VAT\';\n  commission?: number;\n  shippingCost?: number;\n  image?: string;'
)

with open('src/types.ts', 'w') as f:
    f.write(content)
