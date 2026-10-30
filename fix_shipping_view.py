import re
with open('src/components/ShippingView.tsx', 'r') as f:
    content = f.read()

content = content.replace('under 1 lb', 'under 1 lb / 450g')
content = content.replace('exceeds 3 lbs', 'exceeds 3 lbs / 1.3kg')
content = content.replace('USPS Ground Advantage', 'Economy Shipping')
content = content.replace('UPS Ground or FedEx Saver', 'Courier Standard')

with open('src/components/ShippingView.tsx', 'w') as f:
    f.write(content)
