import re
with open('server.ts', 'r') as f:
    content = f.read()

content = content.replace(
    'Weight: ${currentProduct.weight || \'12\'} Oz\\nSize: ${currentProduct.size || \'10x6x4\'} (LxWxH inches)',
    'Weight: ${currentProduct.weight || \'12\'} ${appUnitSystem === "metric" ? "g" : "Oz"}\\nSize: ${currentProduct.size || \'10x6x4\'} (LxWxH ${appUnitSystem === "metric" ? "cm" : "inches"})'
)

content = content.replace(
    '(Weight in ounces and Dimensions like "LxWxH" in inches) and fair pricing (Cost and Retail Selling Price with a healthy profitable markup of 40-150%)',
    '(Weight in ${appUnitSystem === "metric" ? "grams" : "ounces"} and Dimensions like "LxWxH" in ${appUnitSystem === "metric" ? "cm" : "inches"}) and fair pricing (Cost and Retail Selling Price in ${appCurrency} with a healthy profitable markup of 40-150%)'
)

content = content.replace(
    '(formatted exactly as "LxWxH", e.g., "8x6x2" or "12x8x6" in inches)',
    '(formatted exactly as "LxWxH", e.g., "8x6x2" or "12x8x6" in ${appUnitSystem === "metric" ? "cm" : "inches"})'
)

content = content.replace(
    'description: "Estimated packaging dimensions formatted exactly as LxWxH in inches, e.g. 10x6x4" },',
    'description: `Estimated packaging dimensions formatted exactly as LxWxH in ${appUnitSystem === "metric" ? "cm" : "inches"}, e.g. 10x6x4` },'
)

with open('server.ts', 'w') as f:
    f.write(content)
