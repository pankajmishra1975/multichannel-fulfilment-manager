import re

with open('server.ts', 'r') as f:
    content = f.read()

replacement = """      mappedSku: mappedSku !== undefined ? mappedSku : products[idx].mappedSku,
      isBundle: isBundle !== undefined ? isBundle : products[idx].isBundle,
      bundleComponents: bundleComponents !== undefined ? bundleComponents : products[idx].bundleComponents,
      commission: commission !== undefined ? Number(commission) : products[idx].commission,
      shippingCost: shippingCost !== undefined ? Number(shippingCost) : products[idx].shippingCost,
      image: image !== undefined ? image : products[idx].image,
      images: images !== undefined ? images : products[idx].images,
    };"""

content = re.sub(r'      mappedSku: mappedSku !== undefined \? mappedSku : products\[idx\]\.mappedSku,\n      isBundle: isBundle !== undefined \? isBundle : products\[idx\]\.isBundle,\n      bundleComponents: bundleComponents !== undefined \? bundleComponents : products\[idx\]\.bundleComponents,\n    };', replacement, content)

with open('server.ts', 'w') as f:
    f.write(content)
