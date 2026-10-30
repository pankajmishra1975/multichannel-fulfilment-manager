with open('src/components/UserGuidesView.tsx', 'r') as f:
    content = f.read()

import re
content = content.replace(
    "['all', 'Getting Started', 'Logistics', 'Financials', 'Infrastructure']",
    "['all', 'Updates & Changelog', 'Getting Started', 'Logistics', 'Financials', 'Infrastructure']"
)

with open('src/components/UserGuidesView.tsx', 'w') as f:
    f.write(content)
