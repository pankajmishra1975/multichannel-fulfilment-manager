import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("action: 'cancel' | 'delete' | 'ship'", "action: 'cancel' | 'delete' | 'ship' | 'notify_channels'")

with open('src/App.tsx', 'w') as f:
    f.write(content)

with open('server.ts', 'r') as f:
    server_content = f.read()

replacement_server_bulk = """app.post('/api/orders/bulk-action', (req, res) => {
  const { action, ids } = req.body;
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ error: 'IDs required' });
  }

  if (action === 'delete') {
    orders = orders.filter(o => !ids.includes(o.id));
    addLog('info', 'orders', `Deleted ${ids.length} orders.`);
  } else if (action === 'cancel') {
    orders = orders.map(o => ids.includes(o.id) ? { ...o, status: 'cancelled' } : o);
    addLog('info', 'orders', `Cancelled ${ids.length} orders.`);
  } else if (action === 'ship') {
    orders = orders.map(o => ids.includes(o.id) ? { ...o, status: 'shipped', trackingNumber: 'TRK-' + Math.random().toString(36).substring(2, 10).toUpperCase() } : o);
    addLog('info', 'orders', `Marked ${ids.length} orders as SHIPPED and generated tracking numbers.`);
  } else if (action === 'notify_channels') {
    addLog('info', 'system', `Notified channels/stores for ${ids.length} shipped orders.`);
  }

  res.json({ success: true });
});"""

server_content = re.sub(r'app.post\(\'/api/orders/bulk-action\', \(req, res\) => \{.*?res.json\(\{ success: true \}\);\n\}\);', replacement_server_bulk, server_content, flags=re.DOTALL)

with open('server.ts', 'w') as f:
    f.write(server_content)

