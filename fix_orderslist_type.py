import re

with open('src/components/OrdersList.tsx', 'r') as f:
    content = f.read()

content = content.replace("onBulkAction?: (action: 'cancel' | 'delete' | 'ship', ids: string[]) => void;", "onBulkAction?: (action: 'cancel' | 'delete' | 'ship' | 'notify_channels', ids: string[]) => void;")

content = re.sub(r'import \{([^}]+)\} from \'lucide-react\';', lambda m: f"import {{{m.group(1)}, RefreshCw}} from 'lucide-react';" if 'RefreshCw' not in m.group(1) else m.group(0), content)

with open('src/components/OrdersList.tsx', 'w') as f:
    f.write(content)

