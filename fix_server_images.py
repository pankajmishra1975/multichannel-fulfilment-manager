import re

with open('server.ts', 'r') as f:
    content = f.read()

content = content.replace(
    'const { sku, name, description, weight, size, buyingPrice, sellingPrice, commission, shippingCost, vatType, stock, stockByWarehouse, mappedSku, isBundle, bundleComponents } = req.body;',
    'const { sku, name, description, weight, size, buyingPrice, sellingPrice, commission, shippingCost, vatType, stock, stockByWarehouse, mappedSku, isBundle, bundleComponents, image, images } = req.body;'
)

content = content.replace(
'''      stock: stock !== undefined ? stock : products[idx].stock,
      stockByWarehouse: stockByWarehouse !== undefined ? stockByWarehouse : products[idx].stockByWarehouse,
      mappedSku: mappedSku !== undefined ? mappedSku : products[idx].mappedSku,
      isBundle: isBundle !== undefined ? isBundle : products[idx].isBundle,
      bundleComponents: bundleComponents !== undefined ? bundleComponents : products[idx].bundleComponents,
    };''',
'''      stock: stock !== undefined ? stock : products[idx].stock,
      stockByWarehouse: stockByWarehouse !== undefined ? stockByWarehouse : products[idx].stockByWarehouse,
      mappedSku: mappedSku !== undefined ? mappedSku : products[idx].mappedSku,
      isBundle: isBundle !== undefined ? isBundle : products[idx].isBundle,
      bundleComponents: bundleComponents !== undefined ? bundleComponents : products[idx].bundleComponents,
      image: image !== undefined ? image : products[idx].image,
      images: images !== undefined ? images : products[idx].images,
    };'''
)

with open('server.ts', 'w') as f:
    f.write(content)
