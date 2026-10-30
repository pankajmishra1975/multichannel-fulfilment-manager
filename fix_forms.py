import re

with open('src/components/ProductsManager.tsx', 'r') as f:
    content = f.read()

# Update editForm state definition
content = content.replace(
'''  const [editForm, setEditForm] = useState<{
    name: string;
    description: string;
    weight: string;
    size: string;
    buyingPrice: string;
    sellingPrice: string;
    vatType: 'VAT' | 'Non VAT';
    stock: string;
    mappedSku: string;
  }>''',
'''  const [editForm, setEditForm] = useState<{
    name: string;
    description: string;
    weight: string;
    size: string;
    buyingPrice: string;
    sellingPrice: string;
    commission: string;
    shippingCost: string;
    vatType: 'VAT' | 'Non VAT';
    stock: string;
    mappedSku: string;
  }>'''
)

# Update startEdit function
content = content.replace(
'''      buyingPrice: (p.buyingPrice || 0).toString(),
      sellingPrice: (p.sellingPrice || 0).toString(),
      vatType: p.vatType as 'VAT' | 'Non VAT',''',
'''      buyingPrice: (p.buyingPrice || 0).toString(),
      sellingPrice: (p.sellingPrice || 0).toString(),
      commission: (p.commission || 0).toString(),
      shippingCost: (p.shippingCost || 0).toString(),
      vatType: p.vatType as 'VAT' | 'Non VAT','''
)

# Update saveEdit function
content = content.replace(
'''      buyingPrice: Number(editForm.buyingPrice),
      sellingPrice: Number(editForm.sellingPrice),
      vatType: editForm.vatType,''',
'''      buyingPrice: Number(editForm.buyingPrice),
      sellingPrice: Number(editForm.sellingPrice),
      commission: Number(editForm.commission),
      shippingCost: Number(editForm.shippingCost),
      vatType: editForm.vatType,'''
)

# Update margin calculation to include commission and shippingCost
content = content.replace(
'''              const marginAmt = (p.sellingPrice || 0) - (p.buyingPrice || 0);''',
'''              const marginAmt = (p.sellingPrice || 0) - (p.buyingPrice || 0) - (p.commission || 0) - (p.shippingCost || 0);'''
)

with open('src/components/ProductsManager.tsx', 'w') as f:
    f.write(content)
