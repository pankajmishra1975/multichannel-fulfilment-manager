import re
with open('src/components/PrintStatusModal.tsx', 'r') as f:
    content = f.read()

content = content.replace('onOpenSpool: () => void;', 'onOpenSpool: () => void;\n  currency?: string;\n  unitSystem?: string;')
content = content.replace('onOpenSpool\n}: PrintStatusModalProps)', 'onOpenSpool,\n  currency = "USD",\n  unitSystem = "imperial"\n}: PrintStatusModalProps)')
content = content.replace('$<span', '{currency === "GBP" ? "£" : currency === "EUR" ? "€" : "$"}<span')
content = content.replace('${totalCost.toFixed(2)}', '{totalCost.toFixed(2)}')

with open('src/components/PrintStatusModal.tsx', 'w') as f:
    f.write(content)
