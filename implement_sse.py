import re

with open('server.ts', 'r') as f:
    content = f.read()

# Add clients array
sse_setup = """let sseClients: any[] = [];

function broadcast(type: string, data: any) {
  const message = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(client => client.write(message));
}

app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Send initial ping
  res.write('event: ping\ndata: ok\n\n');
  
  sseClients.push(res);
  
  req.on('close', () => {
    sseClients = sseClients.filter(client => client !== res);
  });
});
"""

# inject before // --- CRM Endpoints ---
content = content.replace("// --- CRM Endpoints ---", sse_setup + "\n// --- CRM Endpoints ---")

# Now inject broadcast calls whenever orders or CRM update.
content = content.replace("res.json({ success: true, order: orders[idx], orders });", "res.json({ success: true, order: orders[idx], orders });\n    broadcast('orders', orders);")
content = content.replace("res.json({ success: true, removedCount: ids.length });", "res.json({ success: true, removedCount: ids.length });\n  broadcast('orders', orders);")
content = content.replace("res.json({ success: true, orders });", "res.json({ success: true, orders });\n  broadcast('orders', orders);")

content = content.replace("res.json({ success: true, order: newOrder, orders });", "res.json({ success: true, order: newOrder, orders });\n  broadcast('orders', orders);")
content = content.replace("res.json({ success: true, splitOrders, orders });", "res.json({ success: true, splitOrders, orders });\n    broadcast('orders', orders);")
content = content.replace("res.json({ success: true, mergedOrder, orders });", "res.json({ success: true, mergedOrder, orders });\n  broadcast('orders', orders);")

content = content.replace("res.json({ success: true, customer: crmCustomers[id] });", "res.json({ success: true, customer: crmCustomers[id] });\n  broadcast('crmCustomers', crmCustomers);")
content = content.replace("res.json({ success: true, ticket });", "res.json({ success: true, ticket });\n    broadcast('crmTickets', crmTickets);")


with open('server.ts', 'w') as f:
    f.write(content)
