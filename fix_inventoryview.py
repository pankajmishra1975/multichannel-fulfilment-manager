import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
'''            <InventoryView
              products={products}
              currency={currency}
              inventoryThreshold={inventoryThreshold}
              onUpdateThreshold={updateInventoryThreshold}
              onSyncProducts={syncProducts}
              onUpdateProduct={updateProduct}
            />''',
'''            <InventoryView
              products={products}
              currency={currency}
              unitSystem={unitSystem}
              inventoryThreshold={inventoryThreshold}
              onUpdateThreshold={updateInventoryThreshold}
              onSyncProducts={syncProducts}
              onUpdateProduct={updateProduct}
            />'''
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

with open('src/components/InventoryView.tsx', 'r') as f:
    content = f.read()

content = content.replace(
'''interface InventoryViewProps {
  products: Product[];
  inventoryThreshold: number;
  onUpdateThreshold: (threshold: number) => Promise<void>;
  onSyncProducts: (channel: 'all' | 'amazon' | 'ebay') => Promise<void>;
  onUpdateProduct: (productDetails: any) => Promise<void>;
  currency: string;
}''',
'''interface InventoryViewProps {
  products: Product[];
  inventoryThreshold: number;
  onUpdateThreshold: (threshold: number) => Promise<void>;
  onSyncProducts: (channel: 'all' | 'amazon' | 'ebay') => Promise<void>;
  onUpdateProduct: (productDetails: any) => Promise<void>;
  currency: string;
  unitSystem: 'metric' | 'imperial';
}'''
)

content = content.replace(
'''export default function InventoryView({
  products,
  inventoryThreshold,
  onUpdateThreshold,
  onSyncProducts,
  onUpdateProduct,
  currency
}: InventoryViewProps) {''',
'''export default function InventoryView({
  products,
  inventoryThreshold,
  onUpdateThreshold,
  onSyncProducts,
  onUpdateProduct,
  currency,
  unitSystem
}: InventoryViewProps) {'''
)

with open('src/components/InventoryView.tsx', 'w') as f:
    f.write(content)
