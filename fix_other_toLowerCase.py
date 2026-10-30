import re

def safe_replace(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Generic replacement for common properties that might be undefined
    props_to_fix = [
        'g.title', 'g.summary', 'f.name', 
        'po.poNumber', 'po.supplierName', 'i.sku',
        's.name', 's.code', 's.contactName',
        'w.name', 'w.code',
        'i.name', 'i.description',
        'o.buyerName', 'o.id', 'o.shippingAddress.addressLine1',
    ]
    
    for prop in props_to_fix:
        content = content.replace(f'{prop}.toLowerCase()', f'({prop} || "").toLowerCase()')
        
    with open(file_path, 'w') as f:
        f.write(content)

safe_replace('src/components/UserGuidesView.tsx')
safe_replace('src/components/WmsView.tsx')
safe_replace('src/components/IntegrationsView.tsx')
safe_replace('src/components/OrdersList.tsx')
