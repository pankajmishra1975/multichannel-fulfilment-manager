import re

with open('src/components/ProductsManager.tsx', 'r') as f:
    content = f.read()

content = content.replace(
'''  const [addForm, setAddForm] = useState({
    sku: '',
    name: '',
    description: '',
    weight: '12',
    size: '10x6x4',
    buyingPrice: '5.00',
    sellingPrice: '12.99',
    vatType: 'VAT' as 'VAT' | 'Non VAT',
    stock: '15',
    mappedSku: '',
    image: '',
  });''',
'''  const [addForm, setAddForm] = useState({
    sku: '',
    name: '',
    description: '',
    weight: '12',
    size: '10x6x4',
    buyingPrice: '5.00',
    sellingPrice: '12.99',
    commission: '0.00',
    shippingCost: '0.00',
    vatType: 'VAT' as 'VAT' | 'Non VAT',
    stock: '15',
    mappedSku: '',
    image: '',
    images: [] as string[],
  });'''
)

content = content.replace(
'''    await onImportProducts([{
      sku: addForm.sku,
      name: addForm.name,
      description: addForm.description,
      weight: Number(addForm.weight),
      size: addForm.size,
      buyingPrice: Number(addForm.buyingPrice),
      sellingPrice: Number(addForm.sellingPrice),
      vatType: addForm.vatType,
      stock: Number(addForm.stock),
      mappedSku: addForm.mappedSku || addForm.sku,
      image: addForm.image,
    }]);

    setIsAdding(false);
    setAddForm({
      sku: '',
      name: '',
      description: '',
      weight: '12',
      size: '10x6x4',
      buyingPrice: '5.00',
      sellingPrice: '12.99',
      vatType: 'VAT',
      stock: '15',
      mappedSku: '',
      image: '',
    });''',
'''    await onImportProducts([{
      sku: addForm.sku,
      name: addForm.name,
      description: addForm.description,
      weight: Number(addForm.weight),
      size: addForm.size,
      buyingPrice: Number(addForm.buyingPrice),
      sellingPrice: Number(addForm.sellingPrice),
      commission: Number(addForm.commission),
      shippingCost: Number(addForm.shippingCost),
      vatType: addForm.vatType,
      stock: Number(addForm.stock),
      mappedSku: addForm.mappedSku || addForm.sku,
      image: addForm.image || addForm.images[0] || '',
      images: addForm.images,
    }]);

    setIsAdding(false);
    setAddForm({
      sku: '',
      name: '',
      description: '',
      weight: '12',
      size: '10x6x4',
      buyingPrice: '5.00',
      sellingPrice: '12.99',
      commission: '0.00',
      shippingCost: '0.00',
      vatType: 'VAT',
      stock: '15',
      mappedSku: '',
      image: '',
      images: [],
    });'''
)

with open('src/components/ProductsManager.tsx', 'w') as f:
    f.write(content)
