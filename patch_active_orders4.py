import re

content = open('src/components/ActiveOrderDetails.tsx').read()

# Fix hook usage
content = content.replace("  const { customers, updateCustomer } = useCrm();", "  const { customers, tickets, updateCustomer } = useCrm();")

# Remove the inline hook call
content = content.replace("const { tickets } = useCrm();", "")

open('src/components/ActiveOrderDetails.tsx', 'w').write(content)
