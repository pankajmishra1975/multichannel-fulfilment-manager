import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# I need to add Activity, Wifi, Terminal, ShoppingBag, Database, Building2, Layers, Globe
additional_icons = "Activity, Wifi, Terminal, ShoppingBag, Database, Building2, Layers, Globe"
content = re.sub(r'import \{([^}]+)\} from \'lucide-react\';', lambda m: f"import {{{m.group(1)}, {additional_icons}}} from 'lucide-react';", content)

with open('src/App.tsx', 'w') as f:
    f.write(content)

with open('server.ts', 'r') as f:
    content = f.read()

content = content.replace("export function addLog(level: 'info'|'warning'|'error', component: 'system'|'amazon_api'|'ebay_api'|'shipping_api'|'ai', message: string, details?: any) {", "export function addLog(level: 'info'|'warning'|'error', component: 'system'|'amazon_api'|'ebay_api'|'shipping_api'|'ai'|'orders', message: string, details?: any) {")

with open('server.ts', 'w') as f:
    f.write(content)
