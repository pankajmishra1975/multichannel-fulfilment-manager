with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '${o.dimensions ? `${o.dimensions.length}x${o.dimensions.width}x${o.dimensions.height} in` : \'Standard\'}',
    '${o.dimensions ? (unitSystem === "metric" ? `${Math.round(o.dimensions.length * 2.54)}x${Math.round(o.dimensions.width * 2.54)}x${Math.round(o.dimensions.height * 2.54)} cm` : `${o.dimensions.length}x${o.dimensions.width}x${o.dimensions.height} in`) : \'Standard\'}'
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
