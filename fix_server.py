with open('server.ts', 'r') as f:
    content = f.read()

content = content.replace(
    'const { sku, name, description, weight, size, buyingPrice, sellingPrice, vatType, stock, stockByWarehouse, mappedSku, isBundle, bundleComponents } = req.body;',
    'const { sku, name, description, weight, size, buyingPrice, sellingPrice, commission, shippingCost, vatType, stock, stockByWarehouse, mappedSku, isBundle, bundleComponents } = req.body;'
)

content = content.replace(
    'buyingPrice: buyingPrice !== undefined ? buyingPrice : products[idx].buyingPrice,',
    'buyingPrice: buyingPrice !== undefined ? buyingPrice : products[idx].buyingPrice,\n      commission: commission !== undefined ? commission : products[idx].commission,\n      shippingCost: shippingCost !== undefined ? shippingCost : products[idx].shippingCost,'
)

with open('server.ts', 'w') as f:
    f.write(content)
