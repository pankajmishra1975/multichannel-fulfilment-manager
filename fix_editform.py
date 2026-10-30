import re

with open('src/components/ProductsManager.tsx', 'r') as f:
    content = f.read()

content = content.replace(
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
  }>({
    name: '',
    description: '',
    weight: '12',
    size: '10x6x4',
    buyingPrice: '0',
    sellingPrice: '0',
    commission: '0',
    shippingCost: '0',
    vatType: 'VAT',
    stock: '0',
    mappedSku: '',
  });''',
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
    image: string;
    images: string[];
  }>({
    name: '',
    description: '',
    weight: '12',
    size: '10x6x4',
    buyingPrice: '0',
    sellingPrice: '0',
    commission: '0',
    shippingCost: '0',
    vatType: 'VAT',
    stock: '0',
    mappedSku: '',
    image: '',
    images: [],
  });'''
)

content = content.replace(
'''      commission: (p.commission || 0).toString(),
      shippingCost: (p.shippingCost || 0).toString(),
      vatType: p.vatType as 'VAT' | 'Non VAT',
      stock: (p.stock !== undefined ? p.stock : 10).toString(),
      mappedSku: p.mappedSku || p.sku,
    });''',
'''      commission: (p.commission || 0).toString(),
      shippingCost: (p.shippingCost || 0).toString(),
      vatType: p.vatType as 'VAT' | 'Non VAT',
      stock: (p.stock !== undefined ? p.stock : 10).toString(),
      mappedSku: p.mappedSku || p.sku,
      image: p.image || (p.images ? p.images[0] : ''),
      images: p.images || (p.image ? [p.image] : []),
    });'''
)

content = content.replace(
'''      commission: Number(editForm.commission),
      shippingCost: Number(editForm.shippingCost),
      vatType: editForm.vatType,
      stock: Number(editForm.stock),
      mappedSku: editForm.mappedSku,
    });''',
'''      commission: Number(editForm.commission),
      shippingCost: Number(editForm.shippingCost),
      vatType: editForm.vatType,
      stock: Number(editForm.stock),
      mappedSku: editForm.mappedSku,
      image: editForm.image || editForm.images[0] || '',
      images: editForm.images,
    });'''
)

with open('src/components/ProductsManager.tsx', 'w') as f:
    f.write(content)
