with open('src/types.ts', 'r') as f:
    content = f.read()

content = content.replace(
    'image?: string;\n  stock: number;',
    'image?: string;\n  images?: string[];\n  stock: number;'
)

with open('src/types.ts', 'w') as f:
    f.write(content)
