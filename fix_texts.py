with open('src/components/OrdersList.tsx', 'r') as f:
    content = f.read()

content = content.replace('Env (2oz)', '{unitSystem === "metric" ? "Env (56g)" : "Env (2oz)"}')
content = content.replace('Small Box (8oz)', '{unitSystem === "metric" ? "Small Box (225g)" : "Small Box (8oz)"}')
content = content.replace('Med Box (16oz)', '{unitSystem === "metric" ? "Med Box (450g)" : "Med Box (16oz)"}')
content = content.replace('Large Box (32oz)', '{unitSystem === "metric" ? "Large Box (900g)" : "Large Box (32oz)"}')

content = content.replace('<option value="bubble">Envelope (2oz)</option>', '<option value="bubble">{unitSystem === "metric" ? "Envelope (56g)" : "Envelope (2oz)"}</option>')
content = content.replace('<option value="small">Small Box (8oz)</option>', '<option value="small">{unitSystem === "metric" ? "Small Box (225g)" : "Small Box (8oz)"}</option>')
content = content.replace('<option value="medium">Med Box (16oz)</option>', '<option value="medium">{unitSystem === "metric" ? "Med Box (450g)" : "Med Box (16oz)"}</option>')
content = content.replace('<option value="large">Large Box (32oz)</option>', '<option value="large">{unitSystem === "metric" ? "Large Box (900g)" : "Large Box (32oz)"}</option>')

with open('src/components/OrdersList.tsx', 'w') as f:
    f.write(content)
