import re

with open('server.ts', 'r') as f:
    content = f.read()

content = content.replace("addLog('info', 'orders', ", "addLog('info', 'system', ")

with open('server.ts', 'w') as f:
    f.write(content)
