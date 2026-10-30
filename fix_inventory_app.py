import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
'''            <InventoryView
              products={products}
              currency={currency}
              inventoryThreshold={inventoryThreshold}
              onUpdateThreshold={handleUpdateThreshold}
              onSyncProducts={handleSyncProducts}
              onUpdateProduct={handleUpdateProduct}
            />''',
'''            <InventoryView
              products={products}
              currency={currency}
              unitSystem={unitSystem}
              inventoryThreshold={inventoryThreshold}
              onUpdateThreshold={handleUpdateThreshold}
              onSyncProducts={handleSyncProducts}
              onUpdateProduct={handleUpdateProduct}
            />'''
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
