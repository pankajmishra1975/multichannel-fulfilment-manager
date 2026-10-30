import re

with open('server.ts', 'r') as f:
    content = f.read()

# Add templates array
templates_mock = """let templates = [
  {
    id: 'shipping_label_4x6',
    name: 'Standard Shipping Label (4"x6")',
    type: 'label',
    width: 400,
    height: 600,
    elements: []
  }
];

// GET templates
app.get('/api/templates', (req, res) => {
  res.json(templates);
});

// POST save templates
app.post('/api/templates', (req, res) => {
  templates = req.body;
  res.json({ success: true, templates });
});

"""

content = content.replace("function addLog(level: 'info' | 'warn' | 'error'", templates_mock + "function addLog(level: 'info' | 'warn' | 'error'")

with open('server.ts', 'w') as f:
    f.write(content)

