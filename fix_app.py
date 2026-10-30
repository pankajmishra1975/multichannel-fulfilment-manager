import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("currency={currency}\n              unitSystem={unitSystem}", "currency={currency}")

with open('src/App.tsx', 'w') as f:
    f.write(content)
