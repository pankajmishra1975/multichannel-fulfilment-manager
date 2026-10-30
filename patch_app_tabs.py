import re

content = open('src/App.tsx').read()

tab_meta_block = """                openTabs.map((tabId) => {
                  let tabMeta = [
                    { id: 'dashboard', label: 'Dashboard', icon: Activity },
                    { id: 'orders', label: 'Orders Deck', icon: ShoppingBag },
                    { id: 'products', label: 'Products', icon: Package },
                    { id: 'inventory', label: 'Inventory', icon: Database },
                    { id: 'profit_calculator', label: 'Profit Calculator', icon: Calculator },
                    { id: 'shipping', label: 'Shipping', icon: Truck },
                    { id: 'wms', label: 'WMS Suppliers', icon: Building2 },
                    { id: 'printers', label: 'Printers & Spool', icon: Printer },
                    { id: 'designer', label: 'Template Designer', icon: Layers },
              { id: 'crm', label: 'CRM & Customers', icon: Users },
                    { id: 'integrations', label: 'Integrations', icon: Globe },
                    { id: 'reports', label: 'Reports', icon: FileText },
                    { id: 'guide', label: 'User Guides', icon: BookOpen },
                          { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'emails', label: 'Emails & Notifications', icon: Mail },
                    { id: 'logs', label: 'API\\'s Logs', icon: Terminal }
                  ].find(t => t.id === tabId);

                  if (!tabMeta && tabId.startsWith('order_')) {
                    tabMeta = {
                      id: tabId,
                      label: `Order ${tabId.replace('order_', '')}`,
                      icon: ShoppingBag
                    };
                  }

                  if (!tabMeta) return null;"""

content = re.sub(r"                openTabs\.map\(\(tabId\) => \{\n                  const tabMeta = \[\n.*?\]\.find\(t => t\.id === tabId\);\n\n                  if \(!tabMeta\) return null;", tab_meta_block, content, flags=re.DOTALL)

open('src/App.tsx', 'w').write(content)
