import re

with open('server.ts', 'r') as f:
    content = f.read()

content = re.sub(r'export function addLog\(level: \'info\'\|\'warning\'\|\'error\', component: \'[^\']+\'\|\'[^\']+\'\|\'[^\']+\'\|\'[^\']+\'\|\'[^\']+\', message: string, details\?: any\) \{', 
                 "export function addLog(level: 'info'|'warning'|'error', component: 'system'|'amazon_api'|'ebay_api'|'shipping_api'|'ai'|'orders', message: string, details?: any) {", content)

with open('server.ts', 'w') as f:
    f.write(content)

with open('src/components/OrdersList.tsx', 'r') as f:
    content_orders = f.read()

content_orders = content_orders.replace("onBulkAction?: (action: 'cancel' | 'delete' | 'ship', ids: string[]) => void;", "onBulkAction?: (action: 'cancel' | 'delete' | 'ship' | 'notify_channels', ids: string[]) => void;")
content_orders = content_orders.replace("onBulkAction?: (action: 'cancel' | 'delete' | 'ship' | 'notify_channels', ids: string[]) => void;", "onBulkAction?: (action: 'cancel' | 'delete' | 'ship' | 'notify_channels', ids: string[]) => void;")

with open('src/components/OrdersList.tsx', 'w') as f:
    f.write(content_orders)
