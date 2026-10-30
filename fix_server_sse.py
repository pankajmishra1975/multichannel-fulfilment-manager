import re

with open('server.ts', 'r') as f:
    content = f.read()

content = content.replace(
    "`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;",
    "`event: ${type}\\ndata: ${JSON.stringify(data)}\\n\\n`;"
)
content = content.replace(
    "'event: ping\ndata: ok\n\n'",
    "'event: ping\\ndata: ok\\n\\n'"
)

with open('server.ts', 'w') as f:
    f.write(content)
