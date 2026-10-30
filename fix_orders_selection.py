import re

with open('src/components/OrdersList.tsx', 'r') as f:
    content = f.read()

# Remove disabled={order.status === 'shipped'}
content = content.replace("disabled={order.status === 'shipped'}", "")

with open('src/components/OrdersList.tsx', 'w') as f:
    f.write(content)

