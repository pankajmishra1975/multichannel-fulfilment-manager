import re

with open('src/components/OrdersList.tsx', 'r') as f:
    content = f.read()

content = content.replace("onBulkAction?: (action: 'cancel' | 'delete' | 'ship', ids: string[]) => Promise<void>;", "onBulkAction?: (action: 'cancel' | 'delete' | 'ship' | 'notify_channels', ids: string[]) => Promise<void>;")

with open('src/components/OrdersList.tsx', 'w') as f:
    f.write(content)
