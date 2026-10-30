const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const regex = /app\.post\('\/api\/orders\/:id\/manual-split', \(req, res\) => \{[\s\S]*?res\.json\(\{ success: true, newOrder1, newOrder2 \}\);\n\}\);/;

const newEndpoint = `app.post('/api/orders/:id/manual-split', (req, res) => {
  const { id } = req.params;
  const { shipments } = req.body;
  const idx = orders.findIndex(o => o.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Order not found' });
  
  if (!shipments || !Array.isArray(shipments) || shipments.length < 2) {
    return res.status(400).json({ error: 'At least 2 shipments required' });
  }

  const order = orders[idx];
  
  const newOrders = shipments.map((items, index) => {
    const letter = String.fromCharCode(65 + index); // A, B, C...
    return {
      ...order,
      id: \`\${order.id}-\${letter}\`,
      orderId: \`\${order.orderId}-\${letter}\`,
      items: items
    };
  });
  
  orders.splice(idx, 1, ...newOrders);
  saveToDB();
  addLog('info', 'orders', \`Manually split order \${order.id} into \${newOrders.length} shipments\`);
  
  res.json({ success: true, newOrders });
});`;

code = code.replace(regex, newEndpoint);

fs.writeFileSync('server.ts', code);
