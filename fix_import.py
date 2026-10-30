import re

with open('server.ts', 'r') as f:
    content = f.read()

replacement = """    const stockVal = item.stock !== undefined ? Number(item.stock) : (item.quantity !== undefined ? Number(item.quantity) : 10);
    const vatVal = (item.vatType || item.vatOrNonVat || 'VAT').toString().toLowerCase().includes('non') ? 'Non VAT' : 'VAT';
    const imageVal = item.image || (Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=60');
    const imagesVal = Array.isArray(item.images) ? item.images : (item.image ? [item.image] : []);
    const commissionVal = item.commission !== undefined ? Number(item.commission) : 0;
    const shippingCostVal = item.shippingCost !== undefined ? Number(item.shippingCost) : 0;

    const cleanItem = {
      sku: item.sku,
      name: item.name || item.productName || 'Imported Product',
      description: descVal,
      weight: weightVal,
      size: sizeVal,
      buyingPrice: buyingVal,
      sellingPrice: sellingVal,
      commission: commissionVal,
      shippingCost: shippingCostVal,
      vatType: vatVal,
      image: imageVal,
      images: imagesVal,
      stock: stockVal,
      mappedSku: mappedVal,
      source: item.source || 'none'
    };"""

content = re.sub(r'    const stockVal = item\.stock !== undefined \? Number\(item\.stock\) : \(item\.quantity !== undefined \? Number\(item\.quantity\) : 10\);\n    const vatVal = .*?    };', replacement, content, flags=re.DOTALL)

with open('server.ts', 'w') as f:
    f.write(content)

