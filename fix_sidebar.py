import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

replacement = """              { id: 'guide', label: 'User Guides', icon: BookOpen },
              { id: 'settings', label: 'Settings', icon: Settings, adminOnly: true },
              { id: 'emails', label: 'Emails & Notifications', icon: Mail, adminOnly: true },
              { id: 'logs', label: 'API\\'s Logs', icon: Terminal, adminOnly: true }"""

content = re.sub(r"              \{ id: 'guide', label: 'User Guides', icon: BookOpen \},\n              \{ id: 'settings', label: 'Settings', icon: Settings, adminOnly: true \},\n              \{ id: 'logs', label: 'API\\'s Logs', icon: Terminal, adminOnly: true \}", replacement, content)

with open('src/App.tsx', 'w') as f:
    f.write(content)
